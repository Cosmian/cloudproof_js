import {
  FetchChains,
  FetchEntries,
  IndexedEntry,
  IndexedValue,
  FindexKey,
  SearchResults,
  Keyword,
  Label,
  Location,
  ProgressResults,
  Findex,
  FindexCloud,
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
import * as fs from "fs"
import * as os from "os"
import { fromByteArray, toByteArray } from "base64-js"

const FINDEX_TEST_KEY = "6hb1TznoNQFvCWisGWajkA=="
const FINDEX_TEST_LABEL = "Some Label"

test(
  "Findex Cloud",
  async () => {
    await runInFindexCloud()
  },
  { timeout: 60000 },
)

test("in memory", async () => {
  const callbacks = callbacksExamplesInMemory()

  await runWithFindexCallbacks(
    callbacks.fetchEntries,
    callbacks.fetchChains,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )
})

test("SQLite", async () => {
  const db = new Database(":memory:")

  const callbacks = callbacksExamplesBetterSqlite3(db)

  await runWithFindexCallbacks(
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
            oldValue === null ? "" : fromByteArray(oldValue),
            fromByteArray(newValue),
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
        uids.map((uid) => `findex.test.ts::${prefix}.${fromByteArray(uid)}`),
      )

      const results: UidsAndValues = []
      uids.forEach((uid, index) => {
        if (redisResults[index] !== null) {
          results.push({
            uid,
            value: Uint8Array.from(toByteArray(redisResults[index] as string)),
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
          const key = `findex.test.ts::${prefix}.${fromByteArray(uid)}`

          const updated = await client.setIfSame(key, oldValue, newValue)

          if (!updated) {
            const valueInRedis = await client.get(key)
            rejected.push({
              uid,
              value: toByteArray(valueInRedis as string),
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
        `findex.test.ts::${prefix}.${fromByteArray(uid)}`,
        fromByteArray(value),
      ])

      await client.mSet(toSet as any)
    }

    await runWithFindexCallbacks(
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
async function runWithFindexCallbacks(
  fetchEntries: FetchEntries,
  fetchChains: FetchChains,
  upsertEntries: UpsertEntries,
  insertChains: InsertChains,
): Promise<void> {
  const findex = await Findex()
  const masterKey = new FindexKey(randomBytes(16))

  await run(
    async (label, input) => {
      return await findex.search(
        masterKey,
        label,
        input,
        fetchEntries,
        fetchChains,
      )
    },
    async (label, input) => {
      return await findex.search(
        masterKey,
        label,
        input,
        fetchEntries,
        fetchChains,
        {
          progress: async (progressResults: ProgressResults) => {
            const locations = progressResults.getLocations(USERS[0].firstName)
            expect(locations.length).toEqual(1)
            expect(locations[0].toNumber()).toEqual(USERS[0].id)
            return true
          },
        },
      )
    },
    async (label, input) => {
      return await findex.upsert(
        masterKey,
        label,
        input,
        [],
        fetchEntries,
        upsertEntries,
        insertChains,
      )
    },
  )
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function runInFindexCloud(): Promise<void> {
  const baseUrl = `http://${process.env.FINDEX_CLOUD_HOST || "127.0.0.1"}:${
    process.env.FINDEX_CLOUD_PORT || "8080"
  }`

  let response
  try {
    response = await fetch(`${baseUrl}/indexes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test",
      }),
    })
  } catch (e) {
    if (
      e instanceof TypeError &&
      // @ts-expect-error
      (e.cause.message.includes("ECONNREFUSED") as boolean)
    ) {
      return
    } else {
      throw e
    }
  }

  const data = await response.json()

  const { generateNewToken, upsert, search } = await FindexCloud()

  const token = generateNewToken(
    data.public_id,
    Uint8Array.from(data.fetch_entries_key),
    Uint8Array.from(data.fetch_chains_key),
    Uint8Array.from(data.upsert_entries_key),
    Uint8Array.from(data.insert_chains_key),
  )

  await run(
    async (label, input) => {
      return await search(token, label, input, { baseUrl })
    },
    async (label, input) => {
      return await search(token, label, input, { baseUrl })
    },
    async (label, input) => {
      return await upsert(token, label, input, [], { baseUrl })
    },
  )
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

// eslint-disable-next-line jsdoc/require-jsdoc
async function run(
  search: (
    label: Parameters<Awaited<ReturnType<typeof Findex>>["search"]>[1],
    input: Parameters<Awaited<ReturnType<typeof Findex>>["search"]>[2],
  ) => ReturnType<Awaited<ReturnType<typeof Findex>>["search"]>,
  searchWithProgress: (
    label: Parameters<Awaited<ReturnType<typeof Findex>>["search"]>[1],
    input: Parameters<Awaited<ReturnType<typeof Findex>>["search"]>[2],
  ) => ReturnType<Awaited<ReturnType<typeof Findex>>["search"]>,
  upsert: (
    label: Parameters<Awaited<ReturnType<typeof Findex>>["upsert"]>[1],
    input: Parameters<Awaited<ReturnType<typeof Findex>>["upsert"]>[2],
  ) => ReturnType<Awaited<ReturnType<typeof Findex>>["upsert"]>,
): Promise<void> {
  const label = new Label(randomBytes(10))

  {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: Location.fromNumber(user.id),
        keywords: [user.firstName, user.country],
      })
    }

    await upsert(label, newIndexedEntries)

    // Test with progress callback

    const results = await searchWithProgress(label, [USERS[0].firstName])

    const locations = results.get(USERS[0].firstName)

    expect(locations.length).toEqual(1)
    expect(locations[0].toNumber()).toEqual(USERS[0].id)
  }

  {
    // Test with multiple results.

    const results = await search(label, ["Spain"])

    expect(
      results
        .get("Spain")
        .map((location) => location.toNumber())
        .sort((a, b) => a - b),
    ).toEqual(
      USERS.filter((user) => user.country === "Spain")
        .map((user) => user.id)
        .sort((a, b) => a - b),
    )
  }

  {
    // Test with multiple keywords.

    const results = await search(label, ["Spain", "France"])

    expect(
      results
        .get("Spain")
        .map((location) => location.toNumber())
        .sort((a, b) => a - b),
    ).toEqual(
      USERS.filter((user) => user.country === "Spain")
        .map((user) => user.id)
        .sort((a, b) => a - b),
    )

    expect(
      results
        .get("France")
        .map((location) => location.toNumber())
        .sort((a, b) => a - b),
    ).toEqual(
      USERS.filter((user) => user.country === "France")
        .map((user) => user.id)
        .sort((a, b) => a - b),
    )

    expect(
      results
        .locations()
        .map((location) => location.toNumber())
        .sort((a, b) => a - b),
    ).toEqual(
      USERS.filter(
        (user) => user.country === "France" || user.country === "Spain",
      )
        .map((user) => user.id)
        .sort((a, b) => a - b),
    )
  }

  {
    // Test upsert an alias to the first user.
    await upsert(label, [
      {
        indexedValue: Keyword.fromString(USERS[0].firstName),
        keywords: ["SomeAlias"],
      },
      ...generateAliases("SomeAlias"),
    ])

    const searchAndCheck = async (keyword: string): Promise<void> => {
      const results = await search(label, [keyword])

      const locations = results.get(keyword)
      expect(locations.length).toEqual(1)
      expect(locations[0].toNumber()).toEqual(USERS[0].id)
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
      return upsert(label, [
        {
          indexedValue: Location.fromNumber(id),
          keywords: ["Concurrent"],
        },
      ])
    }),
  )

  {
    const results = await search(label, ["Concurrent"])

    expect(results.total()).toEqual(100)
    const locations = results.locations()
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

test("SearchResults", async () => {
  {
    const results = new SearchResults([
      {
        keyword: Keyword.fromString("A").bytes,
        results: [Location.fromNumber(1).bytes],
      },
      {
        keyword: Keyword.fromString("B").bytes,
        results: [Location.fromNumber(2).bytes],
      },
    ])

    expect(results.toNumbers()).toEqual([1, 2])
  }
  {
    const results = new SearchResults([
      {
        keyword: Keyword.fromString("A").bytes,
        results: [Location.fromString("XXX").bytes],
      },
      {
        keyword: Keyword.fromString("B").bytes,
        results: [Location.fromString("YYY").bytes],
      },
    ])

    expect(results.toStrings()).toEqual(["XXX", "YYY"])
  }
  {
    const results = new SearchResults([
      {
        keyword: Keyword.fromString("A").bytes,
        results: [
          Location.fromUuid("933f6cee-5e0f-4cad-b5b3-56de0fe003d0").bytes,
        ],
      },
      {
        keyword: Keyword.fromString("B").bytes,
        results: [
          Location.fromUuid("8e36df4c-8b06-4271-872f-1b076fec552e").bytes,
        ],
      },
    ])

    expect(results.toUuidStrings()).toEqual([
      "933f6cee-5e0f-4cad-b5b3-56de0fe003d0",
      "8e36df4c-8b06-4271-872f-1b076fec552e",
    ])
  }
})

test("Location conversions", async () => {
  expect(Location.fromString("Hello World!").toString()).toEqual("Hello World!")
  expect(Location.fromNumber(1337).toNumber()).toEqual(1337)
  expect(
    Location.fromUuid("933f6cee-5e0f-4cad-b5b3-56de0fe003d0").toUuidString(),
  ).toEqual("933f6cee-5e0f-4cad-b5b3-56de0fe003d0")

  //
  // check that the formats are the same as Java
  //
  expect(Location.fromNumber(1337).bytes).toEqual(
    Uint8Array.from([0, 0, 0, 0, 0, 0, 5, 57]),
  )
  expect(
    new Location(Uint8Array.from([0, 0, 0, 0, 0, 0, 5, 57])).toNumber(),
  ).toEqual(1337)

  expect(
    Location.fromUuid("9e3bf22a-79bd-4d26-ba2b-d6a2f3a29c11").bytes,
  ).toEqual(
    Uint8Array.from([
      -98, 59, -14, 42, 121, -67, 77, 38, -70, 43, -42, -94, -13, -94, -100, 17,
    ]),
  )
  expect(
    new Location(
      Uint8Array.from([
        -98, 59, -14, 42, 121, -67, 77, 38, -70, 43, -42, -94, -13, -94, -100,
        17,
      ]),
    ).toUuidString(),
  ).toEqual("9e3bf22a-79bd-4d26-ba2b-d6a2f3a29c11")
})

test("upsert and search cycle", async () => {
  const findex = await Findex()
  const masterKey = new FindexKey(randomBytes(16))
  const label = new Label(randomBytes(10))
  const callbacks = callbacksExamplesInMemory()

  await findex.upsert(
    masterKey,
    label,
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
    [],
    callbacks.fetchEntries,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )

  await findex.search(
    masterKey,
    label,
    ["A"],
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
    masterKey,
    label,
    [entryLocation, entryKeyword, arrayLocation],
    [],
    callbacks.fetchEntries,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )

  const results0 = await findex.search(
    masterKey,
    label,
    new Set(["ROBERT"]),
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )
  expect(results0.total()).toEqual(2)

  const results1 = await findex.search(
    masterKey,
    label,
    new Set([new TextEncoder().encode("ROBERT")]),
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )
  expect(results1.total()).toEqual(2)

  const results2 = await findex.search(
    masterKey,
    label,
    new Set(["BOB"]),
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )
  expect(results2.total()).toEqual(2)

  // Test progress callback

  const resultsEarlyStop = await findex.search(
    masterKey,
    label,
    new Set(["BOB"]),
    callbacks.fetchEntries,
    callbacks.fetchChains,
    {
      progress: async (progressResults: ProgressResults) => {
        expect(progressResults.total()).toEqual(1)
        expect(progressResults.getKeywords("BOB")[0].toString()).toEqual(
          "ROBERT",
        )
        return false
      },
    },
  )
  expect(resultsEarlyStop.total()).toEqual(0)
})

// The goal of this test is to produce a file database.
// This database will be checked (search + upsert) in another step of the CI:
// cloudproof_java, cloudproof_flutter and cloudproof_python will verify than searching and upserting the database work
test("generate non regression database", async () => {
  const findex = await Findex()
  const masterKey = new FindexKey(toByteArray(FINDEX_TEST_KEY))
  const label = new Label(FINDEX_TEST_LABEL)

  const dbFilepath = "node_modules/sqlite.db"
  if (fs.existsSync(dbFilepath)) {
    fs.unlinkSync(dbFilepath)
  }
  const db = new Database(dbFilepath)
  const callbacks = callbacksExamplesBetterSqlite3(
    db,
    "entry_table",
    "chain_table",
  )

  {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: Location.fromNumber(user.id),
        keywords: [
          user.firstName,
          user.lastName,
          user.region,
          user.country,
          user.employeeNumber,
          user.email,
          user.phone,
          user.security,
        ],
      })
    }

    await findex.upsert(
      masterKey,
      label,
      newIndexedEntries,
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )

    const results = await findex.search(
      masterKey,
      label,
      ["France"],
      callbacks.fetchEntries,
      callbacks.fetchChains,
    )

    const locations = results.get("France")
    expect(locations.length).toEqual(30)
  }
})

/**
 * @param dbFilepath path of sqlite database
 * @returns nothing
 */
async function verify(dbFilepath: string): Promise<void> {
  const findex = await Findex()
  const masterKey = new FindexKey(toByteArray(FINDEX_TEST_KEY))
  const label = new Label(FINDEX_TEST_LABEL)
  const db = new Database(dbFilepath)
  const callbacks = callbacksExamplesBetterSqlite3(
    db,
    "entry_table",
    "chain_table",
  )

  //
  // Verifying search results
  //
  {
    const results = await findex.search(
      masterKey,
      label,
      ["France"],
      callbacks.fetchEntries,
      callbacks.fetchChains,
    )

    const locations = results.get("France")
    expect(locations.length).toEqual(30)
  }

  //
  // Upsert a single user
  //
  {
    const newIndexedEntries: IndexedEntry[] = []
    const newUser = {
      id: 10000,
      firstName: "another first name",
      lastName: "another last name",
      phone: "another phone",
      email: "another email",
      country: "France",
      region: "another region",
      employeeNumber: "another employee number",
      security: "confidential",
    }
    newIndexedEntries.push({
      indexedValue: Location.fromNumber(newUser.id),
      keywords: [
        newUser.firstName,
        newUser.lastName,
        newUser.phone,
        newUser.email,
        newUser.country,
        newUser.region,
        newUser.employeeNumber,
        newUser.security,
      ],
    })

    await findex.upsert(
      masterKey,
      label,
      newIndexedEntries,
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }

  //
  // Another search
  //
  {
    const results = await findex.search(
      masterKey,
      label,
      ["France"],
      callbacks.fetchEntries,
      callbacks.fetchChains,
    )

    const locations = results.get("France")
    expect(locations.length).toEqual(31)
  }
}

test("Verify Findex non-regression test", async () => {
  const testFolder = "tests/data/findex/non_regression/"
  const files = await fs.promises.readdir(testFolder)
  for (const file of files) {
    const testFilepath = testFolder + file
    const newFilepath = os.tmpdir() + "/" + file
    fs.copyFileSync(testFilepath, newFilepath)
    await verify(newFilepath)
  }
})

test("Verify base64 encoding", async () => {
  const keyword = new Keyword(randomBytes(128))
  keyword.toBase64()
})
