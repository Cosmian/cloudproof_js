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
  UidsAndValuesToUpsert,
  InsertChains,
  UpsertEntries,
  LocationIndexEntry,
  KeywordIndexEntry,
  generateAliases,
} from ".."
import { USERS } from "./data/users"
import { expect, test } from "vitest"
import { createClient, defineScript } from "redis"
import { hexEncode } from "../src/utils/utils"
import { randomBytes } from "crypto"
import sqlite3 from "sqlite3"

test("upsert and search memory", async () => {
  const findex = await Findex()

  const entryLocation: IndexedEntry = {
    indexedValue: IndexedValue.fromLocation(
      Location.fromUtf8String("ROBERT file"),
    ),
    keywords: new Set([Keyword.fromUtf8String("ROBERT")]),
  }
  const entryLocation_ = new LocationIndexEntry("ROBERT file", ["ROBERT"])
  expect(entryLocation_).toEqual(entryLocation)

  const arrayLocation: IndexedEntry = {
    indexedValue: IndexedValue.fromLocation(
      Location.fromUtf8String("ROBERT file array"),
    ),
    keywords: new Set([Keyword.fromUtf8String("ROBERT")]),
  }
  const arrayLocation_ = new LocationIndexEntry("ROBERT file array", [
    new TextEncoder().encode("ROBERT"),
  ])
  expect(arrayLocation_).toEqual(arrayLocation)

  const entryKeyword: IndexedEntry = {
    indexedValue: IndexedValue.fromNextWord(Keyword.fromUtf8String("ROBERT")),
    keywords: new Set([Keyword.fromUtf8String("BOB")]),
  }
  const entryKeyword_ = new KeywordIndexEntry("BOB", "ROBERT")
  expect(entryKeyword_).toEqual(entryKeyword)

  const masterKey = new FindexKey(randomBytes(32))

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
    uidsAndValues: UidsAndValuesToUpsert,
  ): Promise<UidsAndValues> => {
    for (const { uid, newValue } of uidsAndValues) {
      entryTable[hexEncode(uid)] = newValue
    }
    return await Promise.resolve([])
  }

  const insertChains: InsertChains = async (
    uidsAndValues: UidsAndValues,
  ): Promise<void> => {
    for (const { uid, value } of uidsAndValues) {
      chainTable[hexEncode(uid)] = value
    }
    return await Promise.resolve()
  }

  await findex.upsert(
    [entryLocation, entryKeyword, arrayLocation],
    masterKey,
    label,
    fetchEntries,
    upsertEntries,
    insertChains,
  )

  const results0 = await findex.search(
    new Set(["ROBERT"]),
    masterKey,
    label,
    fetchEntries,
    fetchChains,
  )
  expect(results0.length).toEqual(2)

  const results1 = await findex.search(
    new Set([new TextEncoder().encode("ROBERT")]),
    masterKey,
    label,
    fetchEntries,
    fetchChains,
  )
  expect(results1.length).toEqual(2)

  const results2 = await findex.search(
    new Set(["BOB"]),
    masterKey,
    label,
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
        if (bytesEquals(uid, requestedUid)) {
          results.push({ uid, value })
          break
        }
      }
    }
    return results
  }
  const upsertCallback = async (
    table: UidsAndValues,
    uidsAndValues: UidsAndValuesToUpsert,
  ): Promise<UidsAndValues> => {
    const rejected = [] as UidsAndValues
    uidsAndValuesLoop: for (const {
      uid: newUid,
      oldValue,
      newValue,
    } of uidsAndValues) {
      for (const tableEntry of table) {
        if (bytesEquals(tableEntry.uid, newUid)) {
          if (bytesEquals(tableEntry.value, oldValue)) {
            tableEntry.value = newValue
          } else {
            rejected.push(tableEntry)
          }
          continue uidsAndValuesLoop
        }
      }

      // The uid doesn't exist yet.
      if (oldValue !== null) {
        throw new Error(
          "Rust shouldn't send us an oldValue if the table never contained a value… (except if there is a compact between)",
        )
      }

      table.push({ uid: newUid, value: newValue })
    }

    return rejected
  }
  const insertCallback = async (
    table: UidsAndValues,
    uidsAndValues: UidsAndValues,
  ): Promise<void> => {
    for (const { uid: newUid, value: newValue } of uidsAndValues) {
      for (const tableEntry of table) {
        if (bytesEquals(tableEntry.uid, newUid)) {
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
    async (uidsAndValues) => await insertCallback(chainTable, uidsAndValues),
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
  const insertCallback = async (
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
  const upsertCallback = async (
    table: string,
    uidsAndValues: UidsAndValuesToUpsert,
  ): Promise<UidsAndValues> => {
    const rejected = [] as UidsAndValues
    await Promise.all(
      uidsAndValues.map(async ({ uid, oldValue, newValue }) => {
        const changed: boolean = await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO ${table} (uid, value) VALUES (?, ?)  ON CONFLICT (uid)  DO UPDATE SET value = ? WHERE value = ?`,
            [uid, newValue, newValue, oldValue],
            function (err: any) {
              if (err !== null && typeof err !== "undefined") {
                reject(err)
              } else {
                resolve(this.changes === 1)
              }
            },
          )
        })

        if (!changed) {
          const valueInSqlite: Uint8Array = await new Promise(
            (resolve, reject) => {
              db.get(
                `SELECT value FROM ${table} WHERE uid = ?`,
                [uid],
                (err: any, row: { value: Uint8Array }) => {
                  if (err !== null && typeof err !== "undefined") {
                    reject(err)
                  } else {
                    resolve(row.value)
                  }
                },
              )
            },
          )

          rejected.push({ uid, value: valueInSqlite })
        }
      }),
    )

    return rejected
  }

  await run(
    async (uids) => await fetchCallback("entry_table", uids),
    async (uids) => await fetchCallback("chain_table", uids),
    async (uidsAndValues) => await upsertCallback("entry_table", uidsAndValues),
    async (uidsAndValues) => await insertCallback("chain_table", uidsAndValues),
  )
})

test("Redis", async () => {
  const client = createClient({
    scripts: {
      setIfSame: defineScript({
        NUMBER_OF_KEYS: 1,
        SCRIPT: `
          local value = redis.call('GET', KEYS[1]) 
          if (((value == false) and (ARGV[1] == "")) or (not(value == false) and (ARGV[1] == value))) 
            then return redis.call('SET', KEYS[1], ARGV[2])
            else return 'NA' end`,
        transformArguments(
          key: string,
          oldValue: Uint8Array | null,
          newValue: Uint8Array,
        ): string[] {
          return [
            key,
            oldValue === null ? "" : Buffer.from(oldValue).toString("base64"),
            Buffer.from(newValue).toString("base64"),
          ]
        },
        transformReply(reply: string): boolean {
          return reply !== "NA"
        },
      }),
    },
  })
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
      uidsAndValues: UidsAndValuesToUpsert,
    ): Promise<UidsAndValues> => {
      const rejected = [] as UidsAndValues
      await Promise.all(
        uidsAndValues.map(async ({ uid, oldValue, newValue }) => {
          const key = `findex.test.ts::${prefix}.${Buffer.from(uid).toString(
            "base64",
          )}`

          const updated = await client.setIfSame(key, oldValue, newValue)

          if (!updated) {
            const valueInRedis = await client.get(key)
            rejected.push({
              uid,
              value: Buffer.from(valueInRedis as string, "base64"),
            })
          }
        }),
      )

      return rejected
    }

    const insertCallback = async (
      prefix: string,
      uidsAndValues: UidsAndValues,
    ): Promise<void> => {
      if (uidsAndValues.length === 0) return

      const toSet = uidsAndValues.map(({ uid, value }) => [
        `findex.test.ts::${prefix}.${Buffer.from(uid).toString("base64")}`,
        Buffer.from(value).toString("base64"),
      ])

      await client.mSet(toSet as any)
    }

    await run(
      async (uids) => await fetchCallback("entry_table", uids),
      async (uids) => await fetchCallback("chain_table", uids),
      async (uidsAndValues) =>
        await upsertCallback("entry_table", uidsAndValues),
      async (uidsAndValues) =>
        await insertCallback("chain_table", uidsAndValues),
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
  insertChains: InsertChains,
): Promise<void> {
  const findex = await Findex()
  const masterKey = new FindexKey(randomBytes(32))
  const label = new Label(randomBytes(10))

  {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: IndexedValue.fromLocation(Location.fromUuid(user.id)),
        keywords: new Set([
          Keyword.fromUtf8String(user.firstName),
          Keyword.fromUtf8String(user.country),
        ]),
      })
    }

    await findex.upsert(
      newIndexedEntries,
      masterKey,
      label,
      fetchEntries,
      upsertEntries,
      insertChains,
    )

    const results = await findex.search(
      new Set([USERS[0].firstName]),
      masterKey,
      label,
      fetchEntries,
      fetchChains,
    )

    expect(results.length).toEqual(1)
    expect(results[0]).toEqual(
      IndexedValue.fromLocation(Location.fromUuid(USERS[0].id)),
    )
  }

  {
    // Test with multiple results.

    const results = await findex.search(
      new Set(["Spain"]),
      masterKey,
      label,
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
        ...generateAliases("SomeAlias"),
      ],
      masterKey,
      label,
      fetchEntries,
      upsertEntries,
      insertChains,
    )

    const searchAndCheck = async (keyword: string): Promise<void> => {
      const results = await findex.search(
        new Set([keyword]),
        masterKey,
        label,
        fetchEntries,
        fetchChains,
      )

      expect(results.length).toEqual(1)
      expect(results[0]).toEqual(
        IndexedValue.fromLocation(Location.fromUuid(USERS[0].id)),
      )
    }

    await searchAndCheck("Som")
    await searchAndCheck("Some")
    await searchAndCheck("SomeA")
    await searchAndCheck("SomeAl")
    await searchAndCheck("SomeAli")
    await searchAndCheck("SomeAlia")
  }

  {
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      Array.from(Array(100).keys()).map((index) => {
        return findex.upsert(
          [
            {
              indexedValue: IndexedValue.fromLocation(
                Location.fromUtf8String(index.toString()),
              ),
              keywords: new Set([Keyword.fromUtf8String("Concurrent")]),
            },
          ],
          masterKey,
          label,
          fetchEntries,
          upsertEntries,
          insertChains,
        )
      }),
    )

    const results = await findex.search(
      new Set(["Concurrent"]),
      masterKey,
      label,
      fetchEntries,
      fetchChains,
    )

    expect(results.length).toEqual(100)
  }
}

test("generateAliases", async () => {
  {
    const aliases = generateAliases("Thibaud")

    expect(aliases.length).toEqual(4)

    for (const alias of aliases) {
      expect(alias.indexedValue).toEqual(
        IndexedValue.fromNextWord(Keyword.fromUtf8String("Thibaud")),
      )
    }

    expect(aliases[0].keywords).toEqual(
      new Set([Keyword.fromUtf8String("Thi")]),
    )
    expect(aliases[1].keywords).toEqual(
      new Set([Keyword.fromUtf8String("Thib")]),
    )
    expect(aliases[2].keywords).toEqual(
      new Set([Keyword.fromUtf8String("Thiba")]),
    )
    expect(aliases[3].keywords).toEqual(
      new Set([Keyword.fromUtf8String("Thibau")]),
    )
  }

  {
    const aliases = generateAliases("Thibaud", 5)

    expect(aliases.length).toEqual(2)

    for (const alias of aliases) {
      expect(alias.indexedValue).toEqual(
        IndexedValue.fromNextWord(Keyword.fromUtf8String("Thibaud")),
      )
    }

    expect(aliases[0].keywords).toEqual(
      new Set([Keyword.fromUtf8String("Thiba")]),
    )
    expect(aliases[1].keywords).toEqual(
      new Set([Keyword.fromUtf8String("Thibau")]),
    )
  }
})

/**
 * @param a one Uint8Array
 * @param b one Uint8Array
 * @returns is equals
 */
function bytesEquals(a: Uint8Array | null, b: Uint8Array | null): boolean {
  if (a === null && b === null) return true
  if (a === null) return false
  if (b === null) return false

  return Buffer.from(a).toString("base64") === Buffer.from(b).toString("base64")
}
