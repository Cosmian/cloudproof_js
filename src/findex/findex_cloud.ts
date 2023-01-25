import { randomBytes } from "crypto"
import { toBase64, base64ToBytes } from "../utils/utils";

export interface FindexCloudToken {
    publicId: string,
    findexMasterKey: Uint8Array,

    fetchEntriesKey: Uint8Array | null,
    fetchChainsKey: Uint8Array | null,
    upsertEntriesKey: Uint8Array | null,
    insertChainsKey: Uint8Array | null,
}

/**
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function FindexCloud() {
    return {
        tokenToString: (token: FindexCloudToken): string => {
            const masterKeyAndPrivateKey = new Uint8Array([
                ...token.findexMasterKey,
                ...(token.fetchEntriesKey !== null ? [0, ...token.fetchEntriesKey] : []),
                ...(token.fetchChainsKey !== null ? [1, ...token.fetchChainsKey] : []),
                ...(token.upsertEntriesKey !== null ? [2, ...token.upsertEntriesKey] : []),
                ...(token.insertChainsKey !== null ? [3, ...token.insertChainsKey] : []),
            ]);
        
            return token.publicId + toBase64(masterKeyAndPrivateKey);
        },

        tokenFromString: async (tokenAsString: string): Promise<FindexCloudToken> => {
            const publicId = tokenAsString.slice(0, 5);
            const bytes = await base64ToBytes(tokenAsString.slice(5));
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
        
        },

        randomToken: (publicId: string): FindexCloudToken => {
            return {
                publicId,
                findexMasterKey: randomBytes(16),
                fetchEntriesKey: randomBytes(16),
                fetchChainsKey: randomBytes(16),
                upsertEntriesKey: randomBytes(16),
                insertChainsKey: randomBytes(16),
            }
        },

        deriveNewToken: (token: FindexCloudToken, permissions: {
            search: boolean,
            index: boolean,
        } = {
            search: false,
            index: false,
        }) => {
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
    }

}
