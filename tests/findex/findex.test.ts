import { FetchChains, FetchEntries, NewIndexedEntry, IndexedValue, Key, Keyword, Label, Location, search, UidsAndValues, upsert, UpsertChains, UpsertEntries } from "../../src/findex";
import { USERS } from "../data/users";
import { expect, test } from '@jest/globals';
import { createClient } from "redis";

test("in memory", async () => {
    let entry_table: Array<{ uid: Uint8Array, value: Uint8Array }> = [];
    let chain_table: Array<{ uid: Uint8Array, value: Uint8Array }> = [];

    let fetch = async (table: Array<{ uid: Uint8Array, value: Uint8Array }>, uids: Uint8Array[]) => {
        let results: UidsAndValues = [];
        uidsLoop: for (let requestedUid of uids) {
            for (let { uid, value } of table) {
                if (Buffer.from(uid).toString('base64') == Buffer.from(requestedUid).toString('base64')) {
                    results.push({ uid, value });
                    continue uidsLoop;
                }
            }
        }
        return results;
    }
    let upsert = async (table: Array<{ uid: Uint8Array, value: Uint8Array }>, uidsAndValues: Array<{ uid: Uint8Array, value: Uint8Array }>) => {
        uidsAndValuesLoop: for (let { uid: newUid, value: newValue } of uidsAndValues) {
            for (let tableEntry of table) {
                if (Buffer.from(tableEntry.uid).toString('base64') == Buffer.from(newUid).toString('base64')) {
                    tableEntry.value = newValue;
                    continue uidsAndValuesLoop;
                }
            }

            // The uid doesn't exist yet.
            table.push({ uid: newUid, value: newValue });
        }
    }

    await run(
        (uids) => fetch(entry_table, uids),
        (uids) => fetch(chain_table, uids),
        (uidsAndValues) => upsert(entry_table, uidsAndValues),
        (uidsAndValues) => upsert(chain_table, uidsAndValues),
    );
});

test("SQLite", async () => {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(':memory:');
    await (new Promise((resolve) => {
        db.run("CREATE TABLE entry_table (uid BYTES PRIMARY KEY, value BYTES)", resolve);
    }))
    await (new Promise((resolve) => {
        db.run("CREATE TABLE chain_table (uid BYTES PRIMARY KEY, value BYTES)", resolve);
    }))

    let fetch = async (table: string, uids: Uint8Array[]) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT uid, value FROM ${table} WHERE uid IN (${uids.map(() => '?').join(',')})`, uids, (err: any, rows: UidsAndValues) => {
                if (err) reject(err);
                resolve(rows);
            });
        }) as Promise<UidsAndValues>;
    }
    let upsert = async (table: string, uidsAndValues: Array<{ uid: Uint8Array, value: Uint8Array }>) => {
        for (let { uid, value } of uidsAndValues) {
            await new Promise((resolve, reject) => {
                db.run(`INSERT OR REPLACE INTO ${table} (uid, value) VALUES(?, ?)`, [uid, value], (err: any) => {
                    if (err) reject(err);
                    resolve(null);
                });
            });
        }
    }

    await run(
        (uids) => fetch("entry_table", uids),
        (uids) => fetch("chain_table", uids),
        (uidsAndValues) => upsert("entry_table", uidsAndValues),
        (uidsAndValues) => upsert("chain_table", uidsAndValues),
    );
});

test("Redis", async () => {
    const client = createClient();
    await client.connect();

    try {
        let fetch = async (prefix: string, uids: Uint8Array[]) => {
            let redisResults = await client.mGet(uids.map((uid) => `findex.test.ts::${prefix}.${Buffer.from(uid).toString('base64')}`));

            let results: UidsAndValues = [];
            for (let index in uids) {
                if (redisResults[index] !== null) {
                    results.push({ uid: uids[index], value: Uint8Array.from(Buffer.from(redisResults[index] as string, 'base64')) });
                }
            }

            return results;
        }
        let upsert = async (prefix: string, uidsAndValues: Array<{ uid: Uint8Array, value: Uint8Array }>) => {
            await client.mSet(uidsAndValues.map(({ uid, value }) => [`findex.test.ts::${prefix}.${Buffer.from(uid).toString('base64')}`, Buffer.from(value).toString('base64')]))
        }

        await run(
            (uids) => fetch("entry_table", uids),
            (uids) => fetch("chain_table", uids),
            (uidsAndValues) => upsert("entry_table", uidsAndValues),
            (uidsAndValues) => upsert("chain_table", uidsAndValues),
        );
    } finally {
        await client.disconnect();
    }
});

async function run(fetchEntries: FetchEntries, fetchChains: FetchChains, upsertEntries: UpsertEntries, upsertChains: UpsertChains) {
    let searchKey = new Key(Uint8Array.from(Array(32).keys()));
    let updateKey = new Key(Uint8Array.from(Array(32).keys()));
    let label = new Label(Uint8Array.from([1, 2, 3]));

    let newIndexedEntries: NewIndexedEntry[] = [];
    for (let user of USERS) {
        newIndexedEntries.push({
            indexedValue: IndexedValue.fromLocation(Location.fromUtf8String(user.id)),
            keywords: new Set([
                Keyword.fromUtf8String(user.firstName),
            ]),
        });
    }

    await upsert(newIndexedEntries, searchKey, updateKey, label, fetchEntries, upsertEntries, upsertChains);

    let results = await search(new Set([
        USERS[0].firstName,
    ]), searchKey, label, 1000, fetchEntries, fetchChains);

    expect(results.length).toEqual(1);
    expect(results[0]).toEqual(IndexedValue.fromLocation(Location.fromUtf8String(USERS[0].id)));
}


