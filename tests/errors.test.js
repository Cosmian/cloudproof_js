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
    masterKey,
    label,
    toUpsert,
    [],
    callbacks.fetchEntries,
    callbacks.upsertEntries,
    callbacks.insertChains,
  )

  // Master key size
  expect(async () => {
    await findex.upsert(
      new FindexKey(randomBytes(72)),
      label,
      toUpsert,
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "While parsing master key for Findex upsert, wrong size when parsing bytes: 72 given should be 16",
  )
  expect(async () => {
    await findex.search(
      new FindexKey(randomBytes(13)),
      label,
      "Answer",
      callbacks.fetchEntries,
      callbacks.fetchChains,
    )
  }).rejects.toThrow(
    "While parsing master key for Findex search, wrong size when parsing bytes: 13 given should be 16",
  )

  // toUpsert argument
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      undefined,
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: `additions` should be an array, undefined received",
  )
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      [{}],
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: all the `indexedValue` inside the `additions` array should be of type IndexedValue, Location or Keyword, undefined received (undefined).",
  )
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      [{ indexedValue: Location.fromNumber(42) }],
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: all the elements inside the `additions` array should have an iterable property `keywords`, undefined received (undefined).",
  )
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      [
        {
          indexedValue: Location.fromNumber(42),
          keywords: [{ name: "Thibaud" }],
        },
      ],
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    'During Findex upsert: all the `keywords` inside the `additions` array should be of type `Keyword` or string, object received ({"name":"Thibaud"}).',
  )

  // Callbacks are not functions
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      toUpsert,
      [],
      null,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: TypeError: fetchEntries is not a function",
  )
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      toUpsert,
      [],
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
      masterKey,
      label,
      toUpsert,
      [],
      () => {},
      callbacks.upsertEntries,
      callbacks.insertChains,
    )
  }).rejects.toThrow(
    "During Findex upsert: return value of fetchEntries is of type undefined, array expected",
  )
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      toUpsert,
      [],
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
      masterKey,
      label,
      toUpsert,
      [],
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
      masterKey,
      label,
      toUpsert,
      [],
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
    /During Findex upsert: fail to decrypt one of the `value` returned by the fetch entries callback \(uid was 'Uid\(\[([0-9]+(, )?)+\]\)', value was empty/,
  )
  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      toUpsert,
      [],
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
    /During Findex upsert: fail to decrypt one of the `value` returned by the fetch entries callback \(uid was 'Uid\(\[([0-9]+(, )?)+\]\)', value was '\[([0-9]+(, )?)+\]'/,
  )

  expect(async () => {
    await findex.upsert(
      masterKey,
      label,
      toUpsert,
      [],
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
