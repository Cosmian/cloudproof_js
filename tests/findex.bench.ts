import { randomBytes } from "crypto"
import { bench, describe } from "vitest"
import {
  Findex,
  FindexKey,
  IndexedEntry,
  IndexedValue,
  Keyword,
  Label,
  Location,
} from ".."
import { backendsExamplesInMemory } from "../dist/umd/findex/in_memory"
import { USERS } from "./data/users"

const backends = await backendsExamplesInMemory()
const key = new FindexKey(randomBytes(16))
const label = new Label(randomBytes(10))
const findex = new Findex(key, label)
await findex.instantiateCustomBackend(
  backends.entryBackend,
  backends.chainBackend,
)

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

    await findex.add(newIndexedEntries)
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

    await findex.add(newIndexedEntries)
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

  await findex.add(newIndexedEntries)

  bench("Search", async () => {
    await findex.search(new Set([USERS[0].firstName]))
  })
})
