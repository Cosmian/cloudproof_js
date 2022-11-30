import {
  Findex,
  FindexKey,
  IndexedEntry,
  IndexedValue,
  Keyword,
  Label,
  UidsAndValues,
  Location,
} from ".."
import { bench, describe } from "vitest"
import { USERS } from "./data/users"
import { randomBytes } from "crypto"

describe("Wasm loading", async () => {
  bench("Load Findex functions", async () => {
    await Findex()
  })
})

const findex = await Findex()
const masterKey = new FindexKey(randomBytes(32))
const label = new Label(randomBytes(10))

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

describe("Findex Upsert", async () => {
  bench("Upsert 10 users", async () => {
    const entryTable: UidsAndValues = []
    const chainTable: UidsAndValues = []

    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS.slice(0, 10)) {
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
      async (uids) => await fetchCallback(entryTable, uids),
      async (uidsAndValues) => await upsertCallback(entryTable, uidsAndValues),
      async (uidsAndValues) => await upsertCallback(chainTable, uidsAndValues),
    )
  })

  bench("Upsert 99 users", async () => {
    const entryTable: UidsAndValues = []
    const chainTable: UidsAndValues = []

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
      async (uids) => await fetchCallback(entryTable, uids),
      async (uidsAndValues) => await upsertCallback(entryTable, uidsAndValues),
      async (uidsAndValues) => await upsertCallback(chainTable, uidsAndValues),
    )
  })
})

describe("Findex Search", async () => {
  const entryTable: UidsAndValues = []
  const chainTable: UidsAndValues = []

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
    async (uids) => await fetchCallback(entryTable, uids),
    async (uidsAndValues) => await upsertCallback(entryTable, uidsAndValues),
    async (uidsAndValues) => await upsertCallback(chainTable, uidsAndValues),
  )

  bench("Search", async () => {
    await findex.search(
      new Set([USERS[0].firstName]),
      masterKey,
      label,
      1000,
      async (uids) => await fetchCallback(entryTable, uids),
      async (uids) => await fetchCallback(chainTable, uids),
    )
  })
})
