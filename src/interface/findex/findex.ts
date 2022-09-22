import { webassembly_search, webassembly_upsert } from "cosmian_findex";
import { Users } from "../../demos/findex/users";
import { deserializeList, sanitizeString, toBase64 } from "../../utils/utils";
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

    /**
     * Reset all indexes and upsert new ones
     *
     * @param location location string naming the key of location to index
     */
    async upsertUsersIndexes(masterKeysFindex: MasterKeys, label: string, users: Users, location: string) {
        const generatedUsers = await users.getUsers();

        const locationAndWords: { [key: string]: string[]; } = {};
        generatedUsers.map((user) => {
            let userId = user.id;
            if (location === "enc_uid") {
                userId = user.enc_uid;
            }
            if (userId) {
                locationAndWords[toBase64('l' + userId)] = [
                    toBase64(user.firstName),
                    toBase64(user.lastName),
                    toBase64(user.phone),
                    toBase64(user.email),
                    toBase64(user.country),
                    toBase64(user.region),
                    toBase64(user.employeeNumber),
                    toBase64(user.security)]
            } else {
                throw new Error("upsertUsersIndexes: userId cannot be null")
            }
        });

        await this.upsert(masterKeysFindex, Buffer.from(label), locationAndWords);
    }

    /**
     * Search terms with Findex implementation
     * @param words string of all searched terms separated by a space character
     * @param logicalSwitch boolean to specify OR / AND search
     * @returns a promise containing results from query
     */
    async searchWithLogicalSwitch(masterKeysFindex: MasterKeys, label: string, words: string, logicalSwitch: boolean, loopIterationLimit: number): Promise<Uint8Array[]> {
        const wordsArray = words.split(" ");
        let indexedValues: string[] = [];
        if (!logicalSwitch) {
            const indexedValuesBytes = await this.search(
                masterKeysFindex,
                Buffer.from(label),
                wordsArray.map(word => sanitizeString(word)),
                loopIterationLimit
            );
            indexedValues = indexedValuesBytes.map(iv => new TextDecoder().decode(iv));
        } else {
            for (const [index, word] of wordsArray.entries()) {
                const partialIndexedValues = await this.search(
                    masterKeysFindex,
                    Buffer.from(label),
                    [sanitizeString(word)],
                    loopIterationLimit
                );

                const partialIndexedValuesString = partialIndexedValues.map(iv => new TextDecoder().decode(iv));
                if (index) {
                    indexedValues = indexedValues.filter(location => partialIndexedValuesString.includes(location))
                } else {
                    indexedValues = [...partialIndexedValuesString]
                }
            }
        }

        // Remove the first character of an indexed value ('l')
        let locations: Uint8Array[] = [];
        for (const indexedValue of indexedValues) {
            locations = [...locations, new TextEncoder().encode(indexedValue).slice(1)]
        }

        return locations
    }
}
