import { randomBytes } from "crypto"
import { expect, test } from "vitest"
import { Findex, FindexKey, Label, Location } from ".."

const { FindexWithWasmBackend, callbacksExamplesInMemory } = await Findex()

test("errors", async () => {
  const callbacks = await callbacksExamplesInMemory()
  const toUpsert = [
    { indexedValue: Location.fromNumber(42), keywords: ["Answer"] },
  ]
  const findex = new FindexWithWasmBackend()
  await findex.createWithWasmBackend(
    callbacks.entryCallbacks,
    callbacks.chainCallbacks,
  )
  const findexKey = new FindexKey(randomBytes(16))
  const label = new Label(randomBytes(32))

  await findex.add(findexKey, label, toUpsert)

  await findex.delete(findexKey, label, toUpsert)

  await findex.add(findexKey, label, toUpsert)

  // Master key size
  expect(async () => {
    await findex.add(new FindexKey(randomBytes(72)), label, toUpsert)
  }).rejects.toThrow(
    "Findex add: failed parsing key: try from slice error: could not convert slice to array",
  )
  expect(async () => {
    await findex.search(new FindexKey(randomBytes(13)), label, "Answer")
  }).rejects.toThrow(
    "Findex search: While parsing key for Findex search, try from slice error: could not convert slice to array",
  )

  // toUpsert argument
  expect(async () => {
    await findex.add(findexKey, label, undefined)
  }).rejects.toThrow(
    "During Findex upsert: `additions` should be an array, undefined received",
  )

  expect(async () => {
    await findex.add(findexKey, label, [{}])
  }).rejects.toThrow(
    "During Findex upsert: all the `indexedValue` inside the `additions` array should be of type IndexedValue, Location or Keyword, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add(findexKey, label, [
      { indexedValue: Location.fromNumber(42) },
    ])
  }).rejects.toThrow(
    "During Findex upsert: all the elements inside the `additions` array should have an iterable property `keywords`, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add(findexKey, label, [
      {
        indexedValue: Location.fromNumber(42),
        keywords: [{ name: "Thibaud" }],
      },
    ])
  }).rejects.toThrow(
    'During Findex upsert: all the `keywords` inside the `additions` array should be of type `Keyword` or string, object received ({"name":"Thibaud"}).',
  )
})
