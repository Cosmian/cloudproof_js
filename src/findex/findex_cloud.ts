/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { fromByteArray, toByteArray } from 'base64-js';
import { Findex, FindexKey, IndexedEntry, Label } from "./findex";
import { hexEncode, hexDecode } from "../utils/utils";
import jsSHA from 'jssha';

export interface FindexCloudToken {
    publicId: string,
    findexMasterKey: Uint8Array,

    fetchEntriesKey: Uint8Array | null,
    fetchChainsKey: Uint8Array | null,
    upsertEntriesKey: Uint8Array | null,
    insertChainsKey: Uint8Array | null,
}

/**
 * Transform a string to a token object
 */
function tokenToString(token: FindexCloudToken): string {
    const masterKeyAndPrivateKey = new Uint8Array([
        ...token.findexMasterKey,
        ...(token.fetchEntriesKey !== null ? [0, ...token.fetchEntriesKey] : []),
        ...(token.fetchChainsKey !== null ? [1, ...token.fetchChainsKey] : []),
        ...(token.upsertEntriesKey !== null ? [2, ...token.upsertEntriesKey] : []),
        ...(token.insertChainsKey !== null ? [3, ...token.insertChainsKey] : []),
    ]);

    return token.publicId + fromByteArray(masterKeyAndPrivateKey);
}

/**
 * Transform a token to a string
 */
function tokenFromString(tokenAsString: string): FindexCloudToken {
    const publicId = tokenAsString.slice(0, 5);
    const bytes = toByteArray(tokenAsString.slice(5));
    const findexMasterKey = bytes.slice(0, 16);
    let callbacksKeys = bytes.slice(16);

    const token: FindexCloudToken = {
        publicId,
        findexMasterKey,

        fetchEntriesKey: null,
        fetchChainsKey: null,
        upsertEntriesKey: null,
        insertChainsKey: null,
    }

    while (callbacksKeys.length > 0) {
        const prefix = callbacksKeys[0];
        const value = callbacksKeys.slice(1, 16 + 1);
        callbacksKeys = callbacksKeys.slice(16 + 1);
        
        if (prefix === 0) {
            token.fetchEntriesKey = value;
        } else if (prefix === 1) {
            token.fetchChainsKey = value;
        } else if (prefix === 2) {
            token.upsertEntriesKey = value;
        } else if (prefix === 3) {
            token.insertChainsKey = value;
        }
    }

    return token
}

/**
 * Create a new token with reduced permissions
 */
function deriveNewToken(token: FindexCloudToken, permissions: {
    search: boolean,
    index: boolean,
} = {
    search: false,
    index: false,
}): FindexCloudToken {
    const newToken: FindexCloudToken = {
        publicId: token.publicId,
        findexMasterKey: token.findexMasterKey,
        fetchEntriesKey: null,
        fetchChainsKey: null,
        upsertEntriesKey: null,
        insertChainsKey: null,
    }

    if (permissions.search) {
        newToken.fetchEntriesKey = token.fetchEntriesKey
        newToken.fetchChainsKey = token.fetchChainsKey
    }

    if (permissions.index) {
        newToken.fetchChainsKey = token.fetchChainsKey
        newToken.upsertEntriesKey = token.upsertEntriesKey
        newToken.insertChainsKey = token.insertChainsKey
    }

    return newToken
}

/**
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function FindexCloud() {
    const { upsert, search } = await Findex();
    
    return {
        tokenToString,
        tokenFromString,
        deriveNewToken,

        upsert: async (rawToken: string | FindexCloudToken, newIndexedEntries: IndexedEntry[]) => {
            let token: FindexCloudToken;
            if (typeof rawToken === 'string') {
                token = tokenFromString(rawToken);
            } else {
                token = rawToken
            }

            return await upsert(
                newIndexedEntries,
                new FindexKey(token.findexMasterKey),
                new Label("Some label"),
                async (uids) => {
                    const data = await post<Array<{ 'uid': string, 'value': string }>>(token, '/fetch_entries', uids.map((uid) => hexEncode(uid)))
                    return data.map(({ uid, value }) => ({ uid: hexDecode(uid), value: hexDecode(value) }));
                },
                async (entriesToUpsert) => {
                    const data = await post<Array<{ 'uid': string, 'value': string }>>(token, '/upsert_entries', 
                        entriesToUpsert.map(({ uid, oldValue, newValue }) => ({
                            uid: hexEncode(uid),
                            "old_value": oldValue !== null ? hexEncode(oldValue) : null,
                            "new_value": hexEncode(newValue),
                        })),
                    );
        
                    return data.map(({ uid, value }) => ({ uid: hexDecode(uid), value: hexDecode(value) }));
                },
                async (chainsToInsert) => {
                    await post(token, '/insert_chains', 
                        chainsToInsert.map(({ uid, value }) => ({
                            uid: hexEncode(uid),
                            value: hexEncode(value),
                        }))
                    );
                },
            )
        },

        search: async (rawToken: string | FindexCloudToken, keywords: Set<string | Uint8Array> | Array<string | Uint8Array>) => {
            let token: FindexCloudToken;
            if (typeof rawToken === 'string') {
                token = tokenFromString(rawToken);
            } else {
                token = rawToken
            }

            return await search(
                keywords,
                new FindexKey(token.findexMasterKey),
                new Label("Some label"),
                async (uids) => {
                    const data = await post<Array<{ 'uid': string, 'value': string }>>(token, '/fetch_entries', uids.map((uid) => hexEncode(uid)))
                    return data.map(({ uid, value }) => ({ uid: hexDecode(uid), value: hexDecode(value) }));
                },
                async (uids) => {
                    const data = await post<Array<{ 'uid': string, 'value': string }>>(token, '/fetch_chains', uids.map((uid) => hexEncode(uid)))
                    return data.map(({ uid, value }) => ({ uid: hexDecode(uid), value: hexDecode(value) }));
                },
            )
        }
    }
}

/**
 * HTTP POST request to the Findex Cloud API
 */
async function post<T>(token: FindexCloudToken, uri: '/fetch_entries' | '/fetch_chains' | '/upsert_entries' | '/insert_chains', data: any): Promise<T> {
    let key: Uint8Array | null = null;
    if (uri === '/fetch_entries') {
        key = token.fetchEntriesKey
    } else if (uri === '/fetch_chains') {
        key = token.fetchChainsKey
    } else if (uri === '/upsert_entries') {
        key = token.upsertEntriesKey
    } else if (uri === '/insert_chains') {
        key = token.insertChainsKey
    }


    if (key === null) {
        throw new Error("You key doesn't allow you to call this callback");
    }

    const requestBody = JSON.stringify(data);

    // eslint-disable-next-line new-cap
    const shaObj = new jsSHA("KMAC128", "UINT8ARRAY", {
        kmacKey: { value: key, format: "UINT8ARRAY" },
    });
    shaObj.update(new TextEncoder().encode(requestBody));
    const signature = shaObj.getHash("UINT8ARRAY", { outputLen: 256 });

    const response = await fetch(`http://127.0.0.1:8080/indexes/${token.publicId}${uri}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'cloudproof_client',
            'X-Findex-Cloud-Signature': hexEncode(signature),
        },
        body: requestBody,
    })
    const body = await response.text();

    if (body === "") return null as T;
    return JSON.parse(body) as T;
}
