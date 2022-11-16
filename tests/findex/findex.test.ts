import {
  FetchChains,
  FetchEntries,
  IndexedEntry,
  IndexedValue,
  FindexKey,
  Keyword,
  Label,
  Location,
  Findex,
  UidsAndValues,
  UpsertChains,
  UpsertEntries,
  LocationIndexEntry,
  KeywordIndexEntry,
} from "../.."
import { USERS } from "../data/users"
import { expect, test } from 'vitest'
import { createClient } from "redis"
import { hexEncode } from "../../src/utils/utils"
import { randomBytes } from "crypto"
import sqlite3 from 'sqlite3';

test("upsert and search memory", async () => {
  const findex = await Findex()

  const entryLocation: IndexedEntry = {
    indexedValue: IndexedValue.fromLocation(
      new Location(new TextEncoder().encode("ROBERT file")),
    ),
    keywords: new Set([new Keyword(new TextEncoder().encode("ROBERT"))]),
  }
  const entryLocation_ = new LocationIndexEntry("ROBERT file", ["ROBERT"])
  expect(entryLocation_).toEqual(entryLocation)

  const arrayLocation: IndexedEntry = {
    indexedValue: IndexedValue.fromLocation(
      new Location(new TextEncoder().encode("ROBERT file array")),
    ),
    keywords: new Set([new Keyword(new TextEncoder().encode("ROBERT"))]),
  }
  const arrayLocation_ = new LocationIndexEntry("ROBERT file array", [
    new TextEncoder().encode("ROBERT"),
  ])
  expect(arrayLocation_).toEqual(arrayLocation)

  const entryKeyword: IndexedEntry = {
    indexedValue: IndexedValue.fromNextWord(
      new Keyword(new TextEncoder().encode("ROBERT")),
    ),
    keywords: new Set([new Keyword(new TextEncoder().encode("BOB"))]),
  }
  const entryKeyword_ = new KeywordIndexEntry("BOB", "ROBERT")
  expect(entryKeyword_).toEqual(entryKeyword)

  const searchKey = new FindexKey(randomBytes(32))
  const updateKey = new FindexKey(randomBytes(32))

  const label = new Label("test")

  const entryTable: { [uid: string]: Uint8Array } = {}
  const chainTable: { [uid: string]: Uint8Array } = {}

  const fetchEntries: FetchEntries = async (
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    const results: UidsAndValues = []
    for (const uid of uids) {
      const value = entryTable[hexEncode(uid)]
      if (typeof value !== "undefined") {
        results.push({ uid, value })
      }
    }
    return await Promise.resolve(results)
  }

  const fetchChains: FetchChains = async (
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    const results: UidsAndValues = []
    for (const uid of uids) {
      const value = chainTable[hexEncode(uid)]
      if (typeof value !== "undefined") {
        results.push({ uid, value })
      }
    }
    return await Promise.resolve(results)
  }

  const upsertEntries: UpsertEntries = async (
    uidsAndValues: UidsAndValues,
  ): Promise<void> => {
    for (const { uid, value } of uidsAndValues) {
      entryTable[hexEncode(uid)] = value
    }
    return await Promise.resolve()
  }

  const upsertChains: UpsertChains = async (
    uidsAndValues: UidsAndValues,
  ): Promise<void> => {
    for (const { uid, value } of uidsAndValues) {
      chainTable[hexEncode(uid)] = value
    }
    return await Promise.resolve()
  }

  await findex.upsert(
    [entryLocation, entryKeyword, arrayLocation],
    searchKey,
    updateKey,
    label,
    fetchEntries,
    upsertEntries,
    upsertChains,
  )

  const results0 = await findex.search(
    new Set(["ROBERT"]),
    searchKey,
    label,
    100,
    fetchEntries,
    fetchChains,
  )
  expect(results0.length).toEqual(2)

  const results1 = await findex.search(
    new Set([new TextEncoder().encode("ROBERT")]),
    searchKey,
    label,
    100,
    fetchEntries,
    fetchChains,
  )
  expect(results1.length).toEqual(2)

  const results2 = await findex.search(
    new Set(["BOB"]),
    searchKey,
    label,
    100,
    fetchEntries,
    fetchChains,
  )
  expect(results2.length).toEqual(2)
})

test("in memory", async () => {
  const entryTable: UidsAndValues = []
  const chainTable: UidsAndValues = []

  const fetchCallback = async (
    table: UidsAndValues,
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    const results: UidsAndValues = []
    for (const requestedUid of uids) {
      for (const { uid, value } of table) {
        if (
          Buffer.from(uid).toString("base64") ===
          Buffer.from(requestedUid).toString("base64")
        ) {
          results.push({ uid, value })
          break
        }
      }
    }
    return results
  }
  const upsertCallback = async (
    table: UidsAndValues,
    uidsAndValues: UidsAndValues,
  ): Promise<void> => {
    for (const { uid: newUid, value: newValue } of uidsAndValues) {
      for (const tableEntry of table) {
        if (
          Buffer.from(tableEntry.uid).toString("base64") ===
          Buffer.from(newUid).toString("base64")
        ) {
          tableEntry.value = newValue
          break
        }
      }

      // The uid doesn't exist yet.
      table.push({ uid: newUid, value: newValue })
    }
  }

  await run(
    async (uids) => await fetchCallback(entryTable, uids),
    async (uids) => await fetchCallback(chainTable, uids),
    async (uidsAndValues) => await upsertCallback(entryTable, uidsAndValues),
    async (uidsAndValues) => await upsertCallback(chainTable, uidsAndValues),
  )
})

test("SQLite", async () => {
  const db = new sqlite3.Database(":memory:")
  await new Promise((resolve) => {
    db.run(
      "CREATE TABLE entry_table (uid BYTES PRIMARY KEY, value BYTES)",
      resolve,
    )
  })
  await new Promise((resolve) => {
    db.run(
      "CREATE TABLE chain_table (uid BYTES PRIMARY KEY, value BYTES)",
      resolve,
    )
  })

  const fetchCallback = async (
    table: string,
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    return await new Promise((resolve, reject) => {
      db.all(
        `SELECT uid, value FROM ${table} WHERE uid IN (${uids
          .map(() => "?")
          .join(",")})`,
        uids,
        (err: any, rows: UidsAndValues) => {
          if (err !== null && typeof err !== "undefined") reject(err)
          resolve(rows)
        },
      )
    })
  }
  const upsertCallback = async (
    table: string,
    uidsAndValues: UidsAndValues,
  ): Promise<void> => {
    for (const { uid, value } of uidsAndValues) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR REPLACE INTO ${table} (uid, value) VALUES(?, ?)`,
          [uid, value],
          (err: any) => {
            if (err !== null && typeof err !== "undefined") reject(err)
            resolve(null)
          },
        )
      })
    }
  }

  await run(
    async (uids) => await fetchCallback("entry_table", uids),
    async (uids) => await fetchCallback("chain_table", uids),
    async (uidsAndValues) => await upsertCallback("entry_table", uidsAndValues),
    async (uidsAndValues) => await upsertCallback("chain_table", uidsAndValues),
  )
})

test("Redis", async () => {
  const client = createClient()
  await client.connect()

  try {
    const fetchCallback = async (
      prefix: string,
      uids: Uint8Array[],
    ): Promise<UidsAndValues> => {
      const redisResults = await client.mGet(
        uids.map(
          (uid) =>
            `findex.test.ts::${prefix}.${Buffer.from(uid).toString("base64")}`,
        ),
      )

      const results: UidsAndValues = []
      uids.forEach((uid, index) => {
        if (redisResults[index] !== null) {
          results.push({
            uid,
            value: Uint8Array.from(
              Buffer.from(redisResults[index] as string, "base64"),
            ),
          })
        }
      })
      return results
    }

    const upsertCallback = async (
      prefix: string,
      uidsAndValues: UidsAndValues,
    ): Promise<void> => {
      await client.mSet(
        uidsAndValues.map(({ uid, value }) => [
          `findex.test.ts::${prefix}.${Buffer.from(uid).toString("base64")}`,
          Buffer.from(value).toString("base64"),
        ]),
      )
    }

    await run(
      async (uids) => await fetchCallback("entry_table", uids),
      async (uids) => await fetchCallback("chain_table", uids),
      async (uidsAndValues) =>
        await upsertCallback("entry_table", uidsAndValues),
      async (uidsAndValues) =>
        await upsertCallback("chain_table", uidsAndValues),
    )
  } finally {
    await client.disconnect()
  }
})

// eslint-disable-next-line jsdoc/require-jsdoc
async function run(
  fetchEntries: FetchEntries,
  fetchChains: FetchChains,
  upsertEntries: UpsertEntries,
  upsertChains: UpsertChains,
): Promise<void> {
  const findex = await Findex()
  const searchKey = new FindexKey(randomBytes(32))
  const updateKey = new FindexKey(randomBytes(32))
  const label = new Label(randomBytes(10))

  {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: IndexedValue.fromLocation(
          Location.fromUtf8String(user.id),
        ),
        keywords: new Set([
          Keyword.fromUtf8String(user.firstName),
          Keyword.fromUtf8String(user.country),
        ]),
      })
    }

    await findex.upsert(
      newIndexedEntries,
      searchKey,
      updateKey,
      label,
      fetchEntries,
      upsertEntries,
      upsertChains,
    )

    const results = await findex.search(
      new Set([USERS[0].firstName]),
      searchKey,
      label,
      1000,
      fetchEntries,
      fetchChains,
    )

    expect(results.length).toEqual(1)
    expect(results[0]).toEqual(
      IndexedValue.fromLocation(Location.fromUtf8String(USERS[0].id)),
    )
  }

  {
    // Test with multiple results.

    const results = await findex.search(
      new Set(["Spain"]),
      searchKey,
      label,
      1000,
      fetchEntries,
      fetchChains,
    )

    expect(results.length).toEqual(30)
  }

  {
    // Test upsert an alias to the first user.
    await findex.upsert(
      [
        {
          indexedValue: IndexedValue.fromNextWord(
            Keyword.fromUtf8String(USERS[0].firstName),
          ),
          keywords: new Set([Keyword.fromUtf8String("SomeAlias")]),
        },
      ],
      searchKey,
      updateKey,
      label,
      fetchEntries,
      upsertEntries,
      upsertChains,
    )

    const results = await findex.search(
      new Set(["SomeAlias"]),
      searchKey,
      label,
      1000,
      fetchEntries,
      fetchChains,
    )

    expect(results.length).toEqual(1)
    expect(results[0]).toEqual(
      IndexedValue.fromLocation(Location.fromUtf8String(USERS[0].id)),
    )
  }
}
