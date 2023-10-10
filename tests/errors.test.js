import {
  FindexKey,
  Label,
  Location,
  Findex,
  callbacksExamplesInMemory,
} from ".."
import { expect, test } from "vitest"
import { randomBytes } from "crypto"

test("errors", async () => {
  const callbacks = await callbacksExamplesInMemory()
  const toUpsert = [
    { indexedValue: Location.fromNumber(42), keywords: ["Answer"] },
  ]
  const findex = await Findex.new_with_wasm_backend(
    callbacks.entryCallbacks,
    callbacks.chainCallbacks,
  )
  const masterKey = new FindexKey(randomBytes(16))
  const label = new Label(randomBytes(32))

  await findex.add(masterKey, label, toUpsert)

  await findex.delete(masterKey, label, toUpsert)

  await findex.add(masterKey, label, toUpsert)

  // Master key size
  expect(async () => {
    await findex.add(new FindexKey(randomBytes(72)), label, toUpsert)
  }).rejects.toThrow(
    "While parsing master key for Findex upsert, wrong size when parsing bytes: 72 given should be 16",
  )
  expect(async () => {
    await findex.search(new FindexKey(randomBytes(13)), label, "Answer")
  }).rejects.toThrow(
    "While parsing master key for Findex search, wrong size when parsing bytes: 13 given should be 16",
  )

  // toUpsert argument
  expect(async () => {
    await findex.add(masterKey, label, undefined)
  }).rejects.toThrow(
    "During Findex upsert: `additions` should be an array, undefined received",
  )

  expect(async () => {
    await findex.add(masterKey, label, [{}])
  }).rejects.toThrow(
    "During Findex upsert: all the `indexedValue` inside the `additions` array should be of type IndexedValue, Location or Keyword, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add(masterKey, label, [
      { indexedValue: Location.fromNumber(42) },
    ])
  }).rejects.toThrow(
    "During Findex upsert: all the elements inside the `additions` array should have an iterable property `keywords`, undefined received (undefined).",
  )

  expect(async () => {
    await findex.add(masterKey, label, [
      {
        indexedValue: Location.fromNumber(42),
        keywords: [{ name: "Thibaud" }],
      },
    ])
  }).rejects.toThrow(
    'During Findex upsert: all the `keywords` inside the `additions` array should be of type `Keyword` or string, object received ({"name":"Thibaud"}).',
  )
})
