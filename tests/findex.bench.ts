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

const callbacks = await callbacksExamplesInMemory()
const findex = await Findex.new_with_wasm_backend(
  callbacks.entryCallbacks,
  callbacks.chainCallbacks,
)
const masterKey = new FindexKey(randomBytes(16))
const label = new Label(randomBytes(10))

describe("Findex Upsert", async () => {
  bench("Upsert 10 users", async () => {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS.slice(0, 10)) {
      newIndexedEntries.push({
        indexedValue: IndexedValue.fromLocation(Location.fromNumber(user.id)),
        keywords: new Set([
          Keyword.fromString(user.firstName),
          Keyword.fromString(user.country),
        ]),
      })
    }

    await findex.add(masterKey, label, newIndexedEntries)
  })

  bench("Upsert 99 users", async () => {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS) {
      newIndexedEntries.push({
        indexedValue: IndexedValue.fromLocation(Location.fromNumber(user.id)),
        keywords: new Set([
          Keyword.fromString(user.firstName),
          Keyword.fromString(user.country),
        ]),
      })
    }

    await findex.add(masterKey, label, newIndexedEntries)
  })
})

describe("Findex Search", async () => {
  const newIndexedEntries: IndexedEntry[] = []
  for (const user of USERS) {
    newIndexedEntries.push({
      indexedValue: IndexedValue.fromLocation(Location.fromNumber(user.id)),
      keywords: new Set([
        Keyword.fromString(user.firstName),
        Keyword.fromString(user.country),
      ]),
    })
  }

  await findex.add(masterKey, label, newIndexedEntries)

  bench("Search", async () => {
    await findex.search(masterKey, label, new Set([USERS[0].firstName]))
  })
})
