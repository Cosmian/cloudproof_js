import {
  Findex,
  FindexKey,
  IndexedEntry,
  IndexedValue,
  Keyword,
  Label,
  Location,
  callbacksExamplesInMemory,
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

describe("Findex Upsert", async () => {
  bench("Upsert 10 users", async () => {
    const callbacks = callbacksExamplesInMemory()

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
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  })

  bench("Upsert 99 users", async () => {
    const callbacks = callbacksExamplesInMemory()

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
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  })
})

describe("Findex Search", async () => {
  const callbacks = callbacksExamplesInMemory()

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
    callbacks.fetchEntries,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )

  bench("Search", async () => {
    await findex.search(
      new Set([USERS[0].firstName]),
      masterKey,
      label,
      callbacks.fetchEntries,
      callbacks.fetchChains,
    )
  })
})
