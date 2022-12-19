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
  callbacksExamplesBetterSqlite3,
  callbacksExamplesInMemory,
} from ".."
import { USERS } from "./data/users"
import { expect, test } from "vitest"
import { createClient, defineScript } from "redis"
import { randomBytes } from "crypto"
import Database from "better-sqlite3"

test("in memory", async () => {
  const callbacks = callbacksExamplesInMemory()

  await run(
    callbacks.fetchEntries,
    callbacks.fetchChains,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )
})

test("SQLite", async () => {
  const db = new Database(":memory:")

  const callbacks = callbacksExamplesBetterSqlite3(db)

  await run(
    callbacks.fetchEntries,
    callbacks.fetchChains,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )
})

test("Redis", async () => {
  let url
  if (typeof process.env.REDIS_HOST !== "undefined") {
    url = `redis://${process.env.REDIS_HOST}:6379`
  }

  const client = createClient({
    url,
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
  const masterKey = new FindexKey(randomBytes(16))
  const label = new Label(randomBytes(10))

  {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: Location.fromUuid(user.id),
        keywords: [user.firstName, user.country],
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
      [USERS[0].firstName],
      masterKey,
      label,
      fetchEntries,
      fetchChains,
    )

    const indexedValues = results.getAllIndexedValues(USERS[0].firstName)

    expect(indexedValues.length).toEqual(1)
    expect(indexedValues[0]).toEqual(
      IndexedValue.fromLocation(Location.fromUuid(USERS[0].id)),
    )

    const locations = results.get(USERS[0].firstName)

    expect(locations.length).toEqual(1)
    expect(locations[0].toUuidString()).toEqual(USERS[0].id)
  }

  {
    // Test with multiple results.

    const results = await findex.search(
      ["Spain"],
      masterKey,
      label,
      fetchEntries,
      fetchChains,
    )

    expect(results.total()).toEqual(30)
  }

  {
    // Test upsert an alias to the first user.
    await findex.upsert(
      [
        {
          indexedValue: Keyword.fromString(USERS[0].firstName),
          keywords: ["SomeAlias"],
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
        [keyword],
        masterKey,
        label,
        fetchEntries,
        fetchChains,
      )

      const indexedValues = results.getAllIndexedValues(keyword)
      expect(indexedValues.length).toEqual(1)
      expect(indexedValues[0]).toEqual(
        IndexedValue.fromLocation(Location.fromUuid(USERS[0].id)),
      )

      const locations = results.get(keyword)
      expect(locations.length).toEqual(1)
      expect(locations[0].toUuidString()).toEqual(USERS[0].id)
    }

    await searchAndCheck("Som")
    await searchAndCheck("Some")
    await searchAndCheck("SomeA")
    await searchAndCheck("SomeAl")
    await searchAndCheck("SomeAli")
    await searchAndCheck("SomeAlia")
  }

  const sourceIds = Array.from(Array(100).keys()).map((id) => id * id)

  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    sourceIds.map((id) => {
      return findex.upsert(
        [
          {
            indexedValue: Location.fromNumber(id),
            keywords: ["Concurrent"],
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
  {
    const results = await findex.search(
      ["Concurrent"],
      masterKey,
      label,
      fetchEntries,
      fetchChains,
    )

    expect(results.total()).toEqual(100)
  }

  {
    const results = await findex.search(
      ["Concurrent"],
      masterKey,
      label,
      fetchEntries,
      fetchChains,
    )

    expect(results.total()).toEqual(100)
    const locations = results.locations();
    const resultsIds = locations
      .map((location) => location.toNumber())
      .sort((a, b) => a - b)
    expect(resultsIds).toEqual(sourceIds)
  }
}

test("generateAliases", async () => {
  const checkAlias = (alias: IndexedEntry, from: string, to: string): void => {
    expect(alias.indexedValue).toEqual(
      IndexedValue.fromNextWord(Keyword.fromString(to)),
    )
    expect(alias.keywords).toEqual(new Set([Keyword.fromString(from)]))
  }

  {
    const aliases = generateAliases("Thibaud")

    expect(aliases.length).toEqual(4)

    checkAlias(aliases[0], "Thi", "Thib")
    checkAlias(aliases[1], "Thib", "Thiba")
    checkAlias(aliases[2], "Thiba", "Thibau")
    checkAlias(aliases[3], "Thibau", "Thibaud")
  }

  {
    const aliases = generateAliases("Thibaud", 5)

    expect(aliases.length).toEqual(2)

    checkAlias(aliases[0], "Thiba", "Thibau")
    checkAlias(aliases[1], "Thibau", "Thibaud")
  }

  {
    const aliases = generateAliases("Thibaud", 3, 5)

    expect(aliases.length).toEqual(3)

    checkAlias(aliases[0], "Thi", "Thib")
    checkAlias(aliases[1], "Thib", "Thiba")
    checkAlias(aliases[2], "Thiba", "Thibaud")
  }
})

test.skip("upsert and search cycle", async () => {
  const findex = await Findex()
  const masterKey = new FindexKey(randomBytes(16))
  const label = new Label(randomBytes(10))
  const callbacks = callbacksExamplesInMemory()

  await findex.upsert(
    [
      {
        indexedValue: Keyword.fromString("B"),
        keywords: ["A"],
      },
      {
        indexedValue: Keyword.fromString("A"),
        keywords: ["B"],
      },
    ],
    masterKey,
    label,
    callbacks.fetchEntries,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )

  await findex.search(
    ["A"],
    masterKey,
    label,
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )
})

test("upsert and search memory", async () => {
  const findex = await Findex()

  const entryLocation: IndexedEntry = {
    indexedValue: IndexedValue.fromLocation(Location.fromString("ROBERT file")),
    keywords: new Set([Keyword.fromString("ROBERT")]),
  }
  const entryLocation_ = new LocationIndexEntry("ROBERT file", ["ROBERT"])
  expect(entryLocation_).toEqual(entryLocation)

  const arrayLocation: IndexedEntry = {
    indexedValue: IndexedValue.fromLocation(
      Location.fromString("ROBERT file array"),
    ),
    keywords: new Set([Keyword.fromString("ROBERT")]),
  }
  const arrayLocation_ = new LocationIndexEntry("ROBERT file array", [
    new TextEncoder().encode("ROBERT"),
  ])
  expect(arrayLocation_).toEqual(arrayLocation)

  const entryKeyword: IndexedEntry = {
    indexedValue: IndexedValue.fromNextWord(Keyword.fromString("ROBERT")),
    keywords: new Set([Keyword.fromString("BOB")]),
  }
  const entryKeyword_ = new KeywordIndexEntry("BOB", "ROBERT")
  expect(entryKeyword_).toEqual(entryKeyword)

  const masterKey = new FindexKey(randomBytes(16))

  const label = new Label("test")
  const callbacks = callbacksExamplesInMemory()

  await findex.upsert(
    [entryLocation, entryKeyword, arrayLocation],
    masterKey,
    label,
    callbacks.fetchEntries,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )

  const results0 = await findex.search(
    new Set(["ROBERT"]),
    masterKey,
    label,
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )
  expect(results0.total()).toEqual(2)

  const results1 = await findex.search(
    new Set([new TextEncoder().encode("ROBERT")]),
    masterKey,
    label,
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )
  expect(results1.total()).toEqual(2)

  const results2 = await findex.search(
    new Set(["BOB"]),
    masterKey,
    label,
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )
  expect(results2.total()).toEqual(2)
})
