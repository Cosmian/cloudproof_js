import { SymmetricKey } from "../../../kms/objects/SymmetricKey"
import {
  deserializeHashMap,
  deserializeList,
  initFindex,
  serializeHashMap,
} from "../../../utils/utils"
import { webassembly_search, webassembly_upsert } from 'cosmian_findex';
import { bytesToBase64 }from "byte-base64";

/* tslint:disable:max-classes-per-file */
export class IndexedValue {
  static L_PREFIX = 108
  static W_PREFIX = 119

  bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  static fromLocation(location: Location): IndexedValue {
    const prefix = new Uint8Array(location.bytes.length + 1)
    prefix[0] = IndexedValue.L_PREFIX
    for (let index = 0; index < location.bytes.length; index++) {
      prefix[index + 1] = location.bytes[index]
    }

    return new IndexedValue(prefix)
  }

  static fromNextWord(keyword: Keyword): IndexedValue {
    const prefix = new Uint8Array(keyword.bytes.length + 1)
    prefix[0] = IndexedValue.W_PREFIX
    for (let index = 0; index < keyword.bytes.length; index++) {
      prefix[index + 1] = keyword.bytes[index]
    }

    return new IndexedValue(prefix)
  }

  toBase64(): string {
    return bytesToBase64(this.bytes)
  }
}

export class Location {
  bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  static fromUtf8String(value: string): Location {
    return new Label(new TextEncoder().encode(value))
  }
}
export class Keyword {
  bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  static fromUtf8String(value: string): Keyword {
    return new Keyword(new TextEncoder().encode(value))
  }

  toBase64(): string {
    return bytesToBase64(this.bytes)
  }
}
export class FindexKey {
  bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  toBase64(): string {
    return bytesToBase64(this.bytes)
  }
}

export class Label {
  bytes: Uint8Array
  constructor(value: string | Uint8Array) {
    if (value instanceof Uint8Array) {
      this.bytes = value
    } else {
      this.bytes = new TextEncoder().encode(value)
    }
  }

  static fromUtf8String(label: string): Label {
    return new Label(new TextEncoder().encode(label))
  }
}

/**
 * A new value to index for a given set of keywords:
 * IndexedValue -> Set<KeyWord>
 */
export interface IndexedEntry {
  indexedValue: IndexedValue
  keywords: Set<Keyword>
}

/**
 * A helper class to create a {@link IndexedEntry} when
 * indexing a {@link Location} with keywords supplied
 * as arrays of strings or bytes
 */
export class LocationIndexEntry implements IndexedEntry {
  indexedValue: IndexedValue
  keywords: Set<Keyword>
  constructor(
    location: string | Uint8Array,
    keywords: string[] | Uint8Array[]
  ) {
    if (location instanceof Uint8Array) {
      this.indexedValue = IndexedValue.fromLocation(new Location(location))
    } else {
      this.indexedValue = IndexedValue.fromLocation(
        new Location(new TextEncoder().encode(location))
      )
    }
    this.keywords = new Set(
      keywords.map((v) => {
        if (v instanceof Uint8Array) {
          return new Keyword(v)
        }
        return new Keyword(new TextEncoder().encode(v))
      })
    )
  }
}

/**
 * A helper class to create a {@link IndexedEntry} when
 * indexing a {@link Keyword} to point to another {@link Keyword}
 */
export class KeywordIndexEntry implements IndexedEntry {
  indexedValue: IndexedValue
  keywords: Set<Keyword>
  constructor(source: string | Uint8Array, destination: string | Uint8Array) {
    if (destination instanceof Uint8Array) {
      this.indexedValue = IndexedValue.fromNextWord(new Keyword(destination))
    } else {
      this.indexedValue = IndexedValue.fromNextWord(
        new Keyword(new TextEncoder().encode(destination))
      )
    }
    if (source instanceof Uint8Array) {
      this.keywords = new Set([new Keyword(source)])
    } else {
      this.keywords = new Set([new Keyword(new TextEncoder().encode(source))])
    }
  }
}

/**
 * Represents a `(uid, value)` tuple, i.e. a line, in the Entry or Chain table
 */
export type UidsAndValues = Array<{ uid: Uint8Array, value: Uint8Array }>

/**
 * Fetch a uid in the Entry table and return the (uid, value) column
 */
export type FetchEntries = (uids: Uint8Array[]) => Promise<UidsAndValues>

/**
 * Fetch a uid in the Chain table and return the (uid, value) column
 */
export type FetchChains = (uids: Uint8Array[]) => Promise<UidsAndValues>

/**
 * Insert, or update an existing, (uid, value) line in the Entry table
 */
export type UpsertEntries = (uidsAndValues: UidsAndValues) => Promise<void>

/**
 * Insert, or update an existing, (uid, value) line in the Chain table
 */
export type UpsertChains = (uidsAndValues: UidsAndValues) => Promise<void>

/**
 * Insert or update existing (a.k.a upsert) entries in the index
 *
 * @param {IndexedEntry[]} newIndexedEntries new entries to upsert in indexes
 * @param {FindexKey | SymmetricKey} searchKey Findex's read key
 * @param {FindexKey | SymmetricKey} updateKey Findex's write key
 * @param {Label} label public label for the index
 * @param {FetchEntries} fetchEntries callback to fetch the entries table
 * @param {UpsertEntries} upsertEntries callback to upsert inside entries table
 * @param {UpsertChains} upsertChains callback to upsert inside chains table
 */
export async function upsert(
  newIndexedEntries: IndexedEntry[],
  searchKey: FindexKey | SymmetricKey,
  updateKey: FindexKey | SymmetricKey,
  label: Label,
  fetchEntries: FetchEntries,
  upsertEntries: UpsertEntries,
  upsertChains: UpsertChains
): Promise<void> {
  await initFindex();

  // convert key to a single representation
  if (searchKey instanceof SymmetricKey) {
    searchKey = new FindexKey(searchKey.bytes())
  }
  if (updateKey instanceof SymmetricKey) {
    updateKey = new FindexKey(updateKey.bytes())
  }

  const newIndexedEntriesBase64: { [key: string]: string[] } = {}
  for (const newIndexedEntry of newIndexedEntries) {
    newIndexedEntriesBase64[newIndexedEntry.indexedValue.toBase64()] = [
      ...newIndexedEntry.keywords,
    ].map((keyword) => keyword.toBase64())
  }

  await webassembly_upsert(
    searchKey.bytes,
    updateKey.bytes,
    label.bytes,
    JSON.stringify(newIndexedEntriesBase64),
    async (serializedUids: Uint8Array) => {
      const uids = deserializeList(serializedUids)
      const result = await fetchEntries(uids)
      return serializeHashMap(result)
    },
    async (serializedUidsAndValues: Uint8Array) => {
      const uidsAndValues = deserializeHashMap(serializedUidsAndValues)
      await upsertEntries(uidsAndValues)
      return uidsAndValues.length
    },
    async (serializedUidsAndValues: Uint8Array) => {
      const uidsAndValues = deserializeHashMap(serializedUidsAndValues)
      await upsertChains(uidsAndValues)
      return uidsAndValues.length
    }
  )
}

/**
 * Search indexed keywords and return the corresponding IndexedValues
 *
 * @param {Set<string>} keywords keywords to search inside the indexes
 * @param {FindexKey | SymmetricKey} searchKey Findex's read key
 * @param {Label} label public label for the index
 * @param {FetchEntries} fetchEntries callback to fetch the entries table
 * @param {FetchChains} fetchChains callback to fetch the chains table
 * @param options
 * @param options.maxResultsPerKeyword
 * @param options.maxDepth follow the index graph at this max depth
 * @returns {Promise<IndexedValue[]>} a list of `IndexedValue`
 */
export async function search(
  keywords: Set<string | Uint8Array> | Array<string | Uint8Array>,
  searchKey: FindexKey | SymmetricKey,
  label: Label,
  fetchEntries: FetchEntries,
  fetchChains: FetchChains,
  options: { 
    maxResultsPerKeyword?: number,
    maxDepth?: number,
  } = {},
): Promise<IndexedValue[]> {
  await initFindex();

  // convert key to a single representation
  if (searchKey instanceof SymmetricKey) {
    searchKey = new FindexKey(searchKey.bytes())
  }

  const serializedIndexedValues = await webassembly_search(
    searchKey.bytes,
    label.bytes,
    [...keywords].map((keyword) => keyword instanceof Uint8Array ? keyword :new TextEncoder().encode(keyword)),
    options.maxResultsPerKeyword === undefined ? 0 : options.maxResultsPerKeyword,
    options.maxDepth === undefined ? 1000 : options.maxDepth,
    () => true,
    async (serializedUids: Uint8Array) => {
      const uids = deserializeList(serializedUids)
      const result = await fetchEntries(uids)
      return serializeHashMap(result)
    },
    async (serializedUids: Uint8Array) => {
      const uids = deserializeList(serializedUids)
      const result = await fetchChains(uids)
      return serializeHashMap(result)
    }
  )

  return deserializeList(serializedIndexedValues).map(
    (bytes) => new IndexedValue(bytes)
  )
}
