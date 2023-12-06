import { toByteArray } from "base64-js"
import Database from "better-sqlite3"
import { randomBytes } from "crypto"
import * as fs from "fs"
import * as os from "os"
import { expect, test } from "vitest"
import {
  DbInterface,
  Findex,
  IndexedEntry,
  IndexedValue,
  IntermediateSearchResults,
  Interrupt,
  Keyword,
  KeywordIndexEntry,
  Data,
  DataIndexEntry,
  SearchResults,
  sqliteDbInterfaceExample,
  inMemoryDbInterfaceExample,
  generateAliases,
  logger,
  ServerToken,
} from ".."
import { USERS } from "./data/users"

const FINDEX_TEST_KEY = "6hb1TznoNQFvCWisGWajkA=="
const FINDEX_TEST_LABEL = "Some Label"
const LOGGER_INIT = false

// eslint-disable-next-line jsdoc/require-jsdoc
async function run(
  findex: Findex,
  userInterrupt?: Interrupt,
  dumpTables?: () => void,
  dropTables?: () => Promise<void>,
): Promise<void> {
  {
    logger.log(
      () =>
        `test adding ${USERS.length}  users and searching for the first one`,
    )
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: Data.fromNumber(user.id),
        keywords: [user.firstName, user.country],
      })
    }

    await findex.add(newIndexedEntries, { verbose: LOGGER_INIT })
    await findex.add(newIndexedEntries, { verbose: LOGGER_INIT })

    if (dumpTables != null) {
      dumpTables()
    }

    const results = await findex.search(
      [USERS[0].firstName, USERS[0].country],
      { userInterrupt, verbose: LOGGER_INIT },
    )

    const data = results.get(USERS[0].firstName)

    expect(data.length).toEqual(1)
    expect(data[0].toNumber()).toEqual(USERS[0].id)
  }

  {
    logger.log(() => "checking results for 'Spain'")
    const results = await findex.search(["Spain"], {
      userInterrupt,
      verbose: LOGGER_INIT,
    })

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
    logger.log(() => "Test searching for Spain and France.")
    const results = await findex.search(["Spain", "France"], {
      userInterrupt,
    })

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
        .data()
        .map((data) => data.toNumber())
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
    logger.log(() => "Test upsert an alias to the first user.")
    await findex.add([
      {
        indexedValue: Keyword.fromString(USERS[0].firstName),
        keywords: ["SomeAlias"],
      },
      ...generateAliases("SomeAlias"),
    ])

    const searchAndCheck = async (keyword: string): Promise<void> => {
      const results = await findex.search([keyword])

      const data = results.get(keyword)
      expect(data.length).toEqual(1)
      expect(data[0].toNumber()).toEqual(USERS[0].id)
    }

    await searchAndCheck("Som")
    await searchAndCheck("Some")
    await searchAndCheck("SomeA")
    await searchAndCheck("SomeAl")
    await searchAndCheck("SomeAli")
    await searchAndCheck("SomeAlia")
  }

  if (dropTables != null) {
    await dropTables()
  }
  if (dumpTables != null) {
    dumpTables()
  }

  const sourceIds = Array.from(Array(100).keys()).map((id) => id * id)

  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    sourceIds.map((id) => {
      return findex.add([
        {
          indexedValue: Data.fromNumber(id),
          keywords: ["Concurrent"],
        },
      ])
    }),
  )

  {
    const results = await findex.search(["Concurrent"])

    if (dumpTables != null) {
      dumpTables()
    }

    expect(results.total()).toEqual(100)
    const data = results.data()
    const resultsIds = data
      .map((data) => data.toNumber())
      .sort((a, b) => a - b)
    expect(resultsIds).toEqual(sourceIds)
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function runWithFindexBackends(
  entryBackends: DbInterface,
  chainBackends: DbInterface,
  dumpTables?: () => void,
  dropTables?: () => Promise<void>,
): Promise<void> {
  const label = randomBytes(10).toString()
  const key = randomBytes(16)
  const findex = new Findex(key, label)
  await findex.instantiateCustomInterface(entryBackends, chainBackends)
  await run(
    findex,
    async (results: IntermediateSearchResults) => {
      try {
        const data = results.getData(USERS[0].firstName)
        expect(data.length).toEqual(1)
        expect(data[0].toNumber()).toEqual(USERS[0].id)
        return true
      } catch {
        return false
      }
    },
    dumpTables,
    dropTables,
  )
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function runInFindexCloud(): Promise<void> {
  const baseUrl = `http://${process.env.FINDEX_CLOUD_HOST ?? "127.0.0.1"}:${
    process.env.FINDEX_CLOUD_PORT ?? "8080"
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
  const label = randomBytes(10).toString()
  const key = randomBytes(16)
  const findex = new Findex(key, label)
  const token = await ServerToken.new(
    data.public_id,
    Uint8Array.from(data.fetch_entries_key),
    Uint8Array.from(data.fetch_chains_key),
    Uint8Array.from(data.upsert_entries_key),
    Uint8Array.from(data.insert_chains_key),
  )
  await findex.instantiateRestInterface(token, baseUrl, baseUrl)
  await run(findex)
}

test(
  "Findex Cloud",
  async () => {
    await runInFindexCloud()
  },
  { timeout: 60000 },
)

test("in memory", async () => {
  const backends = await inMemoryDbInterfaceExample()
  backends.dumpTables()
  await runWithFindexBackends(
    backends.entryInterface,
    backends.chainInterface,
    backends.dumpTables,
    backends.dropTables,
  )
  backends.dumpTables()
})

test("SQLite", async () => {
  const db = new Database(":memory:")
  const backends = await sqliteDbInterfaceExample(db)
  await runWithFindexBackends(backends.entryInterface, backends.chainInterface)
})

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
    const aliases = generateAliases("Thibaud", 3)

    expect(aliases.length).toEqual(4)

    checkAlias(aliases[0], "Thi", "Thib")
    checkAlias(aliases[1], "Thib", "Thiba")
    checkAlias(aliases[2], "Thiba", "Thibau")
  }
})

test("SearchResults", async () => {
  {
    const results = new SearchResults([
      {
        keyword: Keyword.fromString("A").bytes,
        results: [Data.fromNumber(1).bytes],
      },
      {
        keyword: Keyword.fromString("B").bytes,
        results: [Data.fromNumber(2).bytes],
      },
    ])

    expect(results.toNumbers()).toEqual([1, 2])
  }
  {
    const results = new SearchResults([
      {
        keyword: Keyword.fromString("A").bytes,
        results: [Data.fromString("XXX").bytes],
      },
      {
        keyword: Keyword.fromString("B").bytes,
        results: [Data.fromString("YYY").bytes],
      },
    ])

    expect(results.toStrings()).toEqual(["XXX", "YYY"])
  }
  {
    const results = new SearchResults([
      {
        keyword: Keyword.fromString("A").bytes,
        results: [
          Data.fromUuid("933f6cee-5e0f-4cad-b5b3-56de0fe003d0").bytes,
        ],
      },
      {
        keyword: Keyword.fromString("B").bytes,
        results: [
          Data.fromUuid("8e36df4c-8b06-4271-872f-1b076fec552e").bytes,
        ],
      },
    ])

    expect(results.toUuidStrings()).toEqual([
      "933f6cee-5e0f-4cad-b5b3-56de0fe003d0",
      "8e36df4c-8b06-4271-872f-1b076fec552e",
    ])
  }
})

test("Data conversions", async () => {
  expect(Data.fromString("Hello World!").toString()).toEqual("Hello World!")
  expect(Data.fromNumber(1337).toNumber()).toEqual(1337)
  expect(
    Data.fromUuid("933f6cee-5e0f-4cad-b5b3-56de0fe003d0").toUuidString(),
  ).toEqual("933f6cee-5e0f-4cad-b5b3-56de0fe003d0")

  //
  // check that the formats are the same as Java
  //
  expect(Data.fromNumber(1337).bytes).toEqual(
    Uint8Array.from([0, 0, 0, 0, 0, 0, 5, 57]),
  )
  expect(
    new Data(Uint8Array.from([0, 0, 0, 0, 0, 0, 5, 57])).toNumber(),
  ).toEqual(1337)

  expect(
    Data.fromUuid("9e3bf22a-79bd-4d26-ba2b-d6a2f3a29c11").bytes,
  ).toEqual(
    Uint8Array.from([
      -98, 59, -14, 42, 121, -67, 77, 38, -70, 43, -42, -94, -13, -94, -100, 17,
    ]),
  )
  expect(
    new Data(
      Uint8Array.from([
        -98, 59, -14, 42, 121, -67, 77, 38, -70, 43, -42, -94, -13, -94, -100,
        17,
      ]),
    ).toUuidString(),
  ).toEqual("9e3bf22a-79bd-4d26-ba2b-d6a2f3a29c11")
})

test("upsert and search cycle", async () => {
  const { entryInterface, chainInterface } = await inMemoryDbInterfaceExample()

  const key = randomBytes(16)
  const label = randomBytes(10).toString()
  const findex = new Findex(key, label)
  await findex.instantiateCustomInterface(entryInterface, chainInterface)

  await findex.add([
    {
      indexedValue: Keyword.fromString("B"),
      keywords: ["A"],
    },
    {
      indexedValue: Keyword.fromString("A"),
      keywords: ["B"],
    },
  ])

  await findex.search(["A"])
})

test("upsert and search memory", async () => {
  const { entryInterface, chainInterface } = await inMemoryDbInterfaceExample()

  const key = randomBytes(16)
  const label = "test"
  const findex = new Findex(key, label)

  await findex.instantiateCustomInterface(entryInterface, chainInterface)

  const entryData: IndexedEntry = {
    indexedValue: IndexedValue.fromData(Data.fromString("ROBERT file")),
    keywords: new Set([Keyword.fromString("ROBERT")]),
  }
  const entryData_ = new DataIndexEntry("ROBERT file", ["ROBERT"])
  expect(entryData_).toEqual(entryData)

  const arrayData: IndexedEntry = {
    indexedValue: IndexedValue.fromData(
      Data.fromString("ROBERT file array"),
    ),
    keywords: new Set([Keyword.fromString("ROBERT")]),
  }
  const arrayData_ = new DataIndexEntry("ROBERT file array", [
    new TextEncoder().encode("ROBERT"),
  ])
  expect(arrayData_).toEqual(arrayData)

  const entryKeyword: IndexedEntry = {
    indexedValue: IndexedValue.fromNextWord(Keyword.fromString("ROBERT")),
    keywords: new Set([Keyword.fromString("BOB")]),
  }
  const entryKeyword_ = new KeywordIndexEntry("BOB", "ROBERT")
  expect(entryKeyword_).toEqual(entryKeyword)

  await findex.add([entryData, entryKeyword, arrayData])

  const results0 = await findex.search(new Set(["ROBERT"]))
  expect(results0.total()).toEqual(2)

  const results1 = await findex.search(
    new Set([new TextEncoder().encode("ROBERT")]),
  )
  expect(results1.total()).toEqual(2)

  const results2 = await findex.search(new Set(["BOB"]))
  expect(results2.total()).toEqual(2)

  // Test progress callback

  const resultsEarlyStop = await findex.search(new Set(["BOB"]), {
    userInterrupt: async (results: IntermediateSearchResults) => {
      expect(results.total()).toEqual(1)
      expect(results.getKeywords("BOB")[0].toString()).toEqual("ROBERT")
      return true
    },
  })
  expect(resultsEarlyStop.total()).toEqual(0)
})

// The goal of this test is to produce a file database.
// This database will be checked (search + upsert) in another step of the CI:
// cloudproof_java, cloudproof_flutter and cloudproof_python will verify than searching and upserting the database work
test("generate non regression database", async () => {
  const dbFilepath = "node_modules/sqlite.db"
  if (fs.existsSync(dbFilepath)) {
    fs.unlinkSync(dbFilepath)
  }
  const db = new Database(dbFilepath)
  const { entryInterface, chainInterface } = await sqliteDbInterfaceExample(
    db,
    "entry_table",
    "chain_table",
  )

  const key = toByteArray(FINDEX_TEST_KEY)
  const label = FINDEX_TEST_LABEL
  const findex = new Findex(key, label)
  await findex.instantiateCustomInterface(entryInterface, chainInterface)

  {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: Data.fromNumber(user.id),
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

    await findex.add(newIndexedEntries)

    const results = await findex.search(["France"])

    const data = results.get("France")
    expect(data.length).toEqual(30)
  }
})

/**
 * @param dbFilepath path of sqlite database
 * @returns nothing
 */
async function verify(dbFilepath: string): Promise<void> {
  const db = new Database(dbFilepath)
  const backends = await sqliteDbInterfaceExample(
    db,
    "entry_table",
    "chain_table",
  )
  const key = toByteArray(FINDEX_TEST_KEY)
  const label = FINDEX_TEST_LABEL
  const findex = new Findex(key, label)

  await findex.instantiateCustomInterface(
    backends.entryInterface,
    backends.chainInterface,
  )

  //
  // Verifying search results
  //
  {
    const results = await findex.search(["France"])

    const data = results.get("France")
    expect(data.length).toEqual(30)
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
      indexedValue: Data.fromNumber(newUser.id),
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

    await findex.add(newIndexedEntries)
  }

  //
  // Another search
  //
  {
    const results = await findex.search(["France"])

    const data = results.get("France")
    expect(data.length).toEqual(31)
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
