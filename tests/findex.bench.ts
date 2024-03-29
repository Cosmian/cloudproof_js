import { randomBytes } from "crypto"
import { bench, describe } from "vitest"
import { Findex, IndexedEntry, IndexedValue, Keyword, Data } from ".."
import { inMemoryDbInterfaceExample } from "../dist/umd/findex/in_memory"
import { USERS } from "./data/users"

const interfaces = await inMemoryDbInterfaceExample()
const key = randomBytes(16)
const label = randomBytes(10).toString()
const findex = new Findex(key, label)
await findex.instantiateCustomInterface(
  interfaces.entryInterface,
  interfaces.chainInterface,
)

describe("Findex Upsert", async () => {
  bench("Upsert 10 users", async () => {
    const newIndexedEntries: IndexedEntry[] = []
    for (const user of USERS.slice(0, 10)) {
      newIndexedEntries.push({
        indexedValue: IndexedValue.fromData(Data.fromNumber(user.id)),
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
        indexedValue: IndexedValue.fromData(Data.fromNumber(user.id)),
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
      indexedValue: IndexedValue.fromData(Data.fromNumber(user.id)),
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
