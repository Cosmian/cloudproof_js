import { randomBytes } from "crypto"
import { expect, test } from "vitest"
import { inMemoryDbInterfaceExample, Findex, Data } from ".."

test("errors", async () => {
  const interfaces = await inMemoryDbInterfaceExample()
  const toUpsert = [{ indexedValue: Data.fromNumber(42), keywords: ["Answer"] }]

  const key = randomBytes(16)
  const label = randomBytes(32).toString()
  const findex = new Findex(key, label)
  await findex.instantiateCustomInterface(
    interfaces.entryInterface,
    interfaces.chainInterface,
  )

  // Master key size
  expect(async () => {
    const key = randomBytes(72)
    const label = randomBytes(32).toString()
    const findex = new Findex(key, label)
    await findex.instantiateCustomInterface(
      interfaces.entryInterface,
      interfaces.chainInterface,
    )
    await findex.add(toUpsert)
  }).rejects.toThrow(
    "Findex add: failed parsing key: try from slice error: could not convert slice to array",
  )

  expect(async () => {
    const key = randomBytes(13)
    const label = randomBytes(32).toString()
    const findex = new Findex(key, label)
    await findex.instantiateCustomInterface(
      interfaces.entryInterface,
      interfaces.chainInterface,
    )
    await findex.search("Answer")
  }).rejects.toThrow(
    "Findex search: While parsing key for Findex search, try from slice error: could not convert slice to array",
  )

  // toUpsert argument
  expect(async () => {
    await findex.add(undefined)
  }).rejects.toThrow(
    "During Findex upsert: `additions` should be an array, undefined received",
  )

  expect(async () => {
    await findex.add([{}])
  }).rejects.toThrow(
    "During Findex upsert: all the `indexedValue` inside the `additions` array should be of type IndexedValue, Data or Keyword, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add([{ indexedValue: Data.fromNumber(42) }])
  }).rejects.toThrow(
    "During Findex upsert: all the elements inside the `additions` array should have an iterable property `keywords`, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add([
      {
        indexedValue: Data.fromNumber(42),
        keywords: [{ name: "Thibaud" }],
      },
    ])
  }).rejects.toThrow(
    'During Findex upsert: all the `keywords` inside the `additions` array should be of type `Keyword` or string, object received ({"name":"Thibaud"}).',
  )
})
