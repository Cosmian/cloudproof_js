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
  const callbacks = callbacksExamplesInMemory()
  const toUpsert = [
    { indexedValue: Location.fromNumber(42), keywords: ["Answer"] },
  ]
  const findex = await Findex()
  const masterKey = new FindexKey(randomBytes(16))
  const label = new Label(randomBytes(32))

  await findex.upsert(
    toUpsert,
    masterKey,
    label,
    callbacks.fetchEntries,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )

  // Master key size
  expect(async () => {
    await findex.upsert(
      toUpsert,
      new FindexKey(randomBytes(72)),
      label,
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "While parsing master key for Findex upsert, wrong size when parsing bytes: 72 given should be 16",
  )
  expect(async () => {
    await findex.search(
      "Answer",
      new FindexKey(randomBytes(13)),
      label,
      callbacks.fetchEntries,
      callbacks.fetchChains,
    )
  }).rejects.toThrow(
    "While parsing master key for Findex search, wrong size when parsing bytes: 13 given should be 16",
  )

  // toUpsert argument
  expect(async () => {
    await findex.upsert(
      undefined,
      masterKey,
      label,
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: `newIndexedEntries` should be an array, undefined received",
  )
  expect(async () => {
    await findex.upsert(
      [{}],
      masterKey,
      label,
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: all the `indexedValue` inside the `newIndexedEntries` array should be of type IndexedValue, Location or Keyword, undefined received (undefined).",
  )
  expect(async () => {
    await findex.upsert(
      [{ indexedValue: Location.fromNumber(42) }],
      masterKey,
      label,
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: all the elements inside the `newIndexedEntries` array should have an iterable property `keywords`, undefined received (undefined).",
  )
  expect(async () => {
    await findex.upsert(
      [
        {
          indexedValue: Location.fromNumber(42),
          keywords: [{ name: "Thibaud" }],
        },
      ],
      masterKey,
      label,
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    'During Findex upsert: all the `keywords` inside the `newIndexedEntries` array should be of type `Keyword` or string, object received ({"name":"Thibaud"}).',
  )

  // Callbacks are not functions
  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      null,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: TypeError: fetchEntries is not a function",
  )
  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      [1, 2, 3],
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: TypeError: fetchEntries is not a function",
  )

  // Callbacks return
  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      () => {},
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: return value of fetchEntries is of type undefined, array expected",
  )
  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      callbacks.fetchEntries,
      () => {
        return [undefined]
      },
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: inside array returned by upsertEntries, position 0 contains undefined, object expected.",
  )
  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      callbacks.fetchEntries,
      () => {
        return [{}]
      },
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: inside array returned by upsertEntries, position 0 contains an object without a `uid` property.",
  )
  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      (uids) => {
        return uids.map((uid) => ({
          uid,
          value: Uint8Array.from([]),
        }))
      },
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    /During Findex upsert: fail to decrypt one of the `value` returned by the fetch entries callback \(uid as hex was '[a-z0-9]+', value was empty\)/,
  )
  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      (uids) => {
        return uids.map((uid) => ({
          uid,
          value: Uint8Array.from([1, 2, 3, 4]),
        }))
      },
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    /During Findex upsert: fail to decrypt one of the `value` returned by the fetch entries callback \(uid as hex was '[a-z0-9]+', value as hex was '01020304'\)/,
  )

  expect(async () => {
    await findex.upsert(
      toUpsert,
      masterKey,
      label,
      (uids) => {
        return uids.map((uid) => ({
          uid: uid.slice(0, 12),
          value: Uint8Array.from([1, 2, 3, 4]),
        }))
      },
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    /During Findex upsert: cannot parse the `uid` returned by `fetchEntries` at position 0 \(wrong size when parsing bytes: 12 given should be 32\)\. `uid` as hex was '[a-z0-9]+'\./,
  )
})
