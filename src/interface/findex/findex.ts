import { webassembly_search, webassembly_upsert } from "../../../wasm_lib/findex/findex";
import { deserializeHashMap, deserializeList, hexDecode, hexEncode, serializeHashMap, serializeList } from "../../utils/utils";
import { DBInterface } from "./dbInterface";

type MasterKeys = {
    k: string,
    k_star: string,
}

/**
 * Findex class implementing callbacks using DbInterface and upsert and search functions
 * @param db DB Interface, implementing the minimal DB requests for Findex algorithm
 */
export class Findex {
    db: DBInterface;

    constructor(db: DBInterface) {
        this.db = db;
    }

    fetchEntry = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
        const uids: Uint8Array[] = deserializeList(serializedUids);
        const uidsHex = uids.map(uid => hexEncode(uid));
        const result = await this.db.getEntryTableEntriesById(uidsHex);
        const formattedResult: { uid: Uint8Array, value: Uint8Array}[] = result.reduce((acc: { uid: Uint8Array, value: Uint8Array }[], el) => {
            const uid: Uint8Array = hexDecode(el.uid);
            const value: Uint8Array = hexDecode(el.value);
            return [...acc, { uid, value} ];
        }, []);
        return serializeHashMap(formattedResult);
    }

    fetchChain = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
        const uids = deserializeList(serializedUids);
        const uidsHex = uids.map(uid => hexEncode(uid));
        const result = await this.db.getChainTableEntriesById(uidsHex);
        const formattedResult = result.reduce((acc: Uint8Array[], el) => {
            const value: Uint8Array = hexDecode(el.value);
            return [...acc, value];
        }, []);
        return serializeList(formattedResult);
    }

    upsertEntry = async (serializedEntries: Uint8Array): Promise<number> => {
        const items = deserializeHashMap(serializedEntries)
        let formattedElements: { uid: string, value: string }[] = [];
        for (const item of items) {
            formattedElements = [...formattedElements, { 'uid': hexEncode(item.key), 'value': hexEncode(item.value) }]
        }
        await this.db.upsertEntryTableEntries(formattedElements);
        return formattedElements.length;
    }

    upsertChain = async (serializedEntries: Uint8Array): Promise<number> => {
        const items = deserializeHashMap(serializedEntries)
        let formattedElements: { uid: string, value: string }[] = [];
        for (const item of items) {
            formattedElements = [...formattedElements, { 'uid': hexEncode(item.key), 'value': hexEncode(item.value) }]
        }
        await this.db.upsertChainTableEntries(formattedElements);
        return formattedElements.length;
    }

    public async upsert(masterKeys: MasterKeys, locationAndWords: { [key: string]: string[]; }): Promise<any> {
        try {
            const res = await webassembly_upsert(JSON.stringify(masterKeys), JSON.stringify(locationAndWords), this.fetchEntry, this.upsertEntry, this.upsertChain);
            console.log("Elements upserted.")
            return res;
        } catch (e) {
            console.log("Error upserting : ", e)
        }
    }

    public async search(masterKeys: MasterKeys, words: string[]): Promise<any> {
        try {
            const res = await webassembly_search(JSON.stringify(masterKeys), JSON.stringify(words), 100, this.fetchEntry, this.fetchChain);
            const queryUidsBytes = deserializeList(res)
            let queryUids: string[] = []
            for (const dbUid of queryUidsBytes) {
                queryUids = [...queryUids, new TextDecoder().decode(dbUid)]
            }
            return queryUids;
        } catch (e) {
            console.log("Error searching : ", e)
        }
    }
}
