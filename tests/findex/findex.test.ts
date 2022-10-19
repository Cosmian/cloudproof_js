/* eslint-disable jsdoc/require-jsdoc */
import {
  FetchChains,
  FetchEntries,
  IndexedEntry,
  IndexedValue,
  FindexKey,
  Keyword,
  Label,
  Location,
  search,
  UidsAndValues,
  upsert,
  UpsertChains,
  UpsertEntries,
  LocationIndexEntry,
  KeywordIndexEntry,
} from "../../src/crypto/sse/findex/simple"
import { USERS } from "../data/users"
import { expect, test } from "@jest/globals"
import { createClient } from "redis"

test("upsert in memory", async () => {
  const entryLocation: IndexedEntry = {
    indexedValue: IndexedValue.fromLocation(
      new Location(new TextEncoder().encode("ROBERT file"))
    ),
    keywords: new Set([new Keyword(new TextEncoder().encode("ROBERT"))]),
  }
  const entryLocation_ = new LocationIndexEntry("ROBERT file", ["ROBERT"])
  expect(entryLocation_).toEqual(entryLocation)

  const entryKeyword: IndexedEntry = {
    indexedValue: IndexedValue.fromNextWord(
      new Keyword(new TextEncoder().encode("ROBERT"))
    ),
    keywords: new Set([new Keyword(new TextEncoder().encode("BOB"))]),
  }
  const entryKeyword_ = new KeywordIndexEntry("BOB", "ROBERT")
  expect(entryKeyword_).toEqual(entryKeyword)

  // const label = new Label(new TextEncoder().encode("Q1 2022"))
})

test("in memory", async () => {
  const entryTable: UidsAndValues = []
  const chainTable: UidsAndValues = []

  const fetchCallback = async (
    table: UidsAndValues,
    uids: Uint8Array[]
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
    uidsAndValues: UidsAndValues
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
    async (uidsAndValues) => await upsertCallback(chainTable, uidsAndValues)
  )
})

test("SQLite", async () => {
  const sqlite3 = require("sqlite3").verbose()
  const db = new sqlite3.Database(":memory:")
  await new Promise((resolve) => {
    db.run(
      "CREATE TABLE entry_table (uid BYTES PRIMARY KEY, value BYTES)",
      resolve
    )
  })
  await new Promise((resolve) => {
    db.run(
      "CREATE TABLE chain_table (uid BYTES PRIMARY KEY, value BYTES)",
      resolve
    )
  })

  const fetchCallback = async (
    table: string,
    uids: Uint8Array[]
  ): Promise<UidsAndValues> => {
    return await new Promise((resolve, reject) => {
      db.all(
        `SELECT uid, value FROM ${table} WHERE uid IN (${uids
          .map(() => "?")
          .join(",")})`,
        uids,
        (err: any, rows: UidsAndValues) => {
          if (err) reject(err)
          resolve(rows)
        }
      )
    })
  }
  const upsertCallback = async (
    table: string,
    uidsAndValues: UidsAndValues
  ): Promise<void> => {
    for (const { uid, value } of uidsAndValues) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR REPLACE INTO ${table} (uid, value) VALUES(?, ?)`,
          [uid, value],
          (err: any) => {
            if (err) reject(err)
            resolve(null)
          }
        )
      })
    }
  }

  await run(
    async (uids) => await fetchCallback("entry_table", uids),
    async (uids) => await fetchCallback("chain_table", uids),
    async (uidsAndValues) => await upsertCallback("entry_table", uidsAndValues),
    async (uidsAndValues) => await upsertCallback("chain_table", uidsAndValues)
  )
})

test("Redis", async () => {
  const client = createClient()
  await client.connect()

  try {
    const fetchCallback = async (
      prefix: string,
      uids: Uint8Array[]
    ): Promise<UidsAndValues> => {
      const redisResults = await client.mGet(
        uids.map(
          (uid) =>
            `findex.test.ts::${prefix}.${Buffer.from(uid).toString("base64")}`
        )
      )

      const results: UidsAndValues = []
      uids.forEach((uid, index) => {
        if (redisResults[index] !== null) {
          results.push({
            uid: uids[index],
            value: Uint8Array.from(
              Buffer.from(redisResults[index] as string, "base64")
            ),
          })
        }
      })
      return results
    }

    const upsertCallback = async (
      prefix: string,
      uidsAndValues: UidsAndValues
    ): Promise<void> => {
      await client.mSet(
        uidsAndValues.map(({ uid, value }) => [
          `findex.test.ts::${prefix}.${Buffer.from(uid).toString("base64")}`,
          Buffer.from(value).toString("base64"),
        ])
      )
    }

    await run(
      async (uids) => await fetchCallback("entry_table", uids),
      async (uids) => await fetchCallback("chain_table", uids),
      async (uidsAndValues) =>
        await upsertCallback("entry_table", uidsAndValues),
      async (uidsAndValues) =>
        await upsertCallback("chain_table", uidsAndValues)
    )
  } finally {
    await client.disconnect()
  }
})

async function run(
  fetchEntries: FetchEntries,
  fetchChains: FetchChains,
  upsertEntries: UpsertEntries,
  upsertChains: UpsertChains
): Promise<void> {
  const searchKey = new FindexKey(Uint8Array.from(Array(32).keys()))
  const updateKey = new FindexKey(Uint8Array.from(Array(32).keys()))
  const label = new Label(Uint8Array.from([1, 2, 3]))

  {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: IndexedValue.fromLocation(
          Location.fromUtf8String(user.id)
        ),
        keywords: new Set([Keyword.fromUtf8String(user.firstName)]),
      })
    }

    await upsert(
      newIndexedEntries,
      searchKey,
      updateKey,
      label,
      fetchEntries,
      upsertEntries,
      upsertChains
    )

    const results = await search(
      new Set([USERS[0].firstName]),
      searchKey,
      label,
      1000,
      fetchEntries,
      fetchChains
    )

    expect(results.length).toEqual(1)
    expect(results[0]).toEqual(
      IndexedValue.fromLocation(Location.fromUtf8String(USERS[0].id))
    )
  }

  {
    // Test upsert an alias to the first user.
    await upsert(
      [
        {
          indexedValue: IndexedValue.fromNextWord(
            Keyword.fromUtf8String(USERS[0].firstName)
          ),
          keywords: new Set([Keyword.fromUtf8String("SomeAlias")]),
        },
      ],
      searchKey,
      updateKey,
      label,
      fetchEntries,
      upsertEntries,
      upsertChains
    )

    const results = await search(
      new Set(["SomeAlias"]),
      searchKey,
      label,
      1000,
      fetchEntries,
      fetchChains
    )

    expect(results.length).toEqual(1)
    expect(results[0]).toEqual(
      IndexedValue.fromLocation(Location.fromUtf8String(USERS[0].id))
    )
  }
}
