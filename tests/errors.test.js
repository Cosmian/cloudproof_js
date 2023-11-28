import { randomBytes } from "crypto"
import { expect, test } from "vitest"
import {
  backendsExamplesInMemory,
  Findex,
  FindexKey,
  Label,
  Location,
} from ".."

test("errors", async () => {
  const backends = await backendsExamplesInMemory()
  const toUpsert = [
    { indexedValue: Location.fromNumber(42), keywords: ["Answer"] },
  ]

  const key = new FindexKey(randomBytes(16))
  const label = new Label(randomBytes(32))
  const findex = new Findex(key, label)
  await findex.instantiateCustomBackend(
    backends.entryBackend,
    backends.chainBackend,
  )

  // Master key size
  expect(async () => {
    const key = new FindexKey(randomBytes(72))
    const label = new Label(randomBytes(32))
    const findex = new Findex(key, label)
    await findex.instantiateCustomBackend(
      backends.entryBackend,
      backends.chainBackend,
    )
    await findex.add(toUpsert)
  }).rejects.toThrow(
    "Findex add: failed parsing key: try from slice error: could not convert slice to array",
  )

  expect(async () => {
    const key = new FindexKey(randomBytes(13))
    const label = new Label(randomBytes(32))
    const findex = new Findex(key, label)
    await findex.instantiateCustomBackend(
      backends.entryBackend,
      backends.chainBackend,
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
    "During Findex upsert: all the `indexedValue` inside the `additions` array should be of type IndexedValue, Location or Keyword, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add([{ indexedValue: Location.fromNumber(42) }])
  }).rejects.toThrow(
    "During Findex upsert: all the elements inside the `additions` array should have an iterable property `keywords`, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add([
      {
        indexedValue: Location.fromNumber(42),
        keywords: [{ name: "Thibaud" }],
      },
    ])
  }).rejects.toThrow(
    'During Findex upsert: all the `keywords` inside the `additions` array should be of type `Keyword` or string, object received ({"name":"Thibaud"}).',
  )
})
