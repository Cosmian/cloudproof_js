import { webassembly_search, webassembly_upsert } from "cosmian_findex";
import { deserializeList } from "../../utils/utils";
import { DBInterface } from "./dbInterface";
import { MasterKeys } from "./master_keys";

/**
 * Findex class implementing callbacks using DbInterface and upsert and search functions
 * @param db DB Interface, implementing the minimal DB requests for Findex algorithm
 */
export class Findex {
    private _db: DBInterface;

    public get db(): DBInterface {
        return this._db;
    }

    constructor(db: DBInterface) {
        this._db = db;
    }

    public async upsert(masterKeys: MasterKeys, label: Uint8Array, locationAndWords: { [key: string]: string[]; }): Promise<any> {
        try {
            const res = await webassembly_upsert(
                JSON.stringify(masterKeys),
                label,
                JSON.stringify(locationAndWords), this.db.fetchEntry,
                this.db.upsertEntry,
                this.db.upsertChain);
            return res;
        } catch (e) {
            console.log("Error upserting : ", e)
            throw new Error("Error upserting : " + e)
        }
    }

    public async search(masterKeys: MasterKeys, label: Uint8Array, words: string[], loopIterationLimit: number): Promise<Uint8Array[]> {
        try {
            const res = await webassembly_search(
                JSON.stringify(masterKeys),
                label,
                JSON.stringify(words),
                loopIterationLimit,
                this.db.fetchEntry,
                this.db.fetchChain
            );
            const queryUidsBytes = deserializeList(res)
            return queryUidsBytes;
        } catch (e) {
            console.log("Error searching : ", e)
            throw new Error("Error searching : " + e)
        }
    }

}
