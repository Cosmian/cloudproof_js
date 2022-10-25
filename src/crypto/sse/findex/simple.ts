import { webassembly_search, webassembly_upsert } from "cosmian_findex"
import { initFindex } from "../../../utils/utils"
import { SymmetricKey } from "../../../kms/objects/SymmetricKey"
import { Index } from "./interfaces"

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
    return Buffer.from(this.bytes).toString("base64")
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
    return Buffer.from(this.bytes).toString("base64")
  }
}
export class FindexKey {
  _bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this._bytes = bytes
  }

  toBase64(): string {
    return Buffer.from(this.bytes).toString("base64")
  }

  public get bytes(): Uint8Array {
    return this._bytes
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
export type UidsAndValues = Index[]

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
 * Called with results found at every node while the search walks the search graph.
 * Returning false, stops the walk.
 */
export type Progress = (indexedValues: IndexedValue[]) => Promise<boolean>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function Findex() {
  await initFindex();

  return {
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
    upsert: async (
      newIndexedEntries: IndexedEntry[],
      searchKey: FindexKey | SymmetricKey,
      updateKey: FindexKey | SymmetricKey,
      label: Label,
      fetchEntries: FetchEntries,
      upsertEntries: UpsertEntries,
      upsertChains: UpsertChains
    ):  Promise<void> => {
      // convert key to a single representation
      if (searchKey instanceof SymmetricKey) {
        searchKey = new FindexKey(searchKey.bytes())
      }
      if (updateKey instanceof SymmetricKey) {
        updateKey = new FindexKey(updateKey.bytes())
      }

      const indexedValuesAndWords: Array<{ indexedValue: Uint8Array, keywords: Uint8Array[] }> = []
      for (const newIndexedEntry of newIndexedEntries) {
        const keywords: Uint8Array[] = []
        newIndexedEntry.keywords.forEach(kw => {
          keywords.push(kw.bytes)
        })
        indexedValuesAndWords.push({
          indexedValue: newIndexedEntry.indexedValue.bytes,
          keywords
        })
      }

      return await webassembly_upsert(
        searchKey.bytes,
        updateKey.bytes,
        label.bytes,
        indexedValuesAndWords,
        async (uids: Uint8Array[]) => {
          return await fetchEntries(uids)
        },
        async (uidsAndValues: UidsAndValues) => {
          return await upsertEntries(uidsAndValues)
        },
        async (uidsAndValues: UidsAndValues) => {
          return await upsertChains(uidsAndValues)
        }
      )
    },

    /**
     * Search indexed keywords and return the corresponding IndexedValues
     *
     * @param {Set<string>} keywords keywords to search inside the indexes
     * @param {FindexKey | SymmetricKey} searchKey Findex's read key
     * @param {Label} label public label for the index
     * @param {number} maxResultsPerKeyword the maximum number of results per keyword
     * @param {FetchEntries} fetchEntries callback to fetch the entries table
     * @param {FetchChains} fetchChains callback to fetch the chains table
     * @param {Progress} progress the optional callback of found values as the search graph is walked. 
     *    Returning false stops the walk
     * @returns {Promise<IndexedValue[]>} a list of `IndexedValue`
     */
    search: async (
      keywords: Set<string | Uint8Array>,
      searchKey: FindexKey | SymmetricKey,
      label: Label,
      maxResultsPerKeyword: number,
      fetchEntries: FetchEntries,
      fetchChains: FetchChains,
      progress?: Progress
    ): Promise<IndexedValue[]> => {
      // convert key to a single representation
      if (searchKey instanceof SymmetricKey) {
        searchKey = new FindexKey(searchKey.bytes())
      }

      const kws: Uint8Array[] = []
      for (const k of keywords) {
        kws.push(k instanceof Uint8Array ? k : new TextEncoder().encode(k))
      }

      const progress_: Progress =
        (typeof progress === "undefined") ?
          async (indexedValues_: IndexedValue[]) => true
          :
          progress


      const serializedIndexedValues = await webassembly_search(
        searchKey.bytes,
        label.bytes,
        kws,
        maxResultsPerKeyword,
        1000,
        async (serializedIndexedValues: Uint8Array[]) => {
          const indexedValues = serializedIndexedValues.map(bytes => {
            return new IndexedValue(bytes)
          })
          return await progress_(indexedValues)
        },
        async (uids: Uint8Array[]) => {
          return await fetchEntries(uids)
        },
        async (uids: Uint8Array[]) => {
          return await fetchChains(uids)
        }
      )

      return serializedIndexedValues.map(bytes => new IndexedValue(bytes))
    }
  };
};

