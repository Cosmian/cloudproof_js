import { parse as parseUuid, stringify as stringifyUuid } from "uuid"
import { fromByteArray } from "base64-js"
import { bytesEquals, hexEncode } from "../utils/utils"

export class Index {
  uid: Uint8Array
  value: Uint8Array

  constructor(uid: Uint8Array, value: Uint8Array) {
    this.uid = uid
    this.value = value
  }
}

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
    return fromByteArray(this.bytes)
  }

  getLocation(): Location | null {
    if (this.bytes[0] === IndexedValue.L_PREFIX) {
      return new Location(this.bytes.slice(1))
    }

    return null
  }

  getNextWord(): Keyword | null {
    if (this.bytes[0] === IndexedValue.W_PREFIX) {
      return new Keyword(this.bytes.slice(1))
    }

    return null
  }
}

export class Location {
  bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  static fromString(value: string): Location {
    return new Location(new TextEncoder().encode(value))
  }

  /**
   * Numbers are encoded in big-endian 8 bytes.
   * JS `number` type cannot encode the all 64 bits numbers because it uses floating point representation
   * that's why we use `BigInt` internally but we convert to `number` (it's theoretically wrong) because `number`
   * is easier to use in JS that BigInt. If we insert a really big 64bits number in Java for example, JS will
   * not be able to read it.
   * @param value number
   * @returns location
   */
  static fromNumber(value: number): Location {
    const buffer = new ArrayBuffer(8)
    new DataView(buffer).setBigInt64(0, BigInt(value), false)

    return new Location(new Uint8Array(buffer))
  }

  /**
   * Convert UUIDv4 only because they are more common.
   * @param uuidv4 uuid
   * @returns location
   */
  static fromUuid(uuidv4: string): Location {
    return new Location(Uint8Array.from(parseUuid(uuidv4)))
  }

  toString(): string {
    return new TextDecoder().decode(this.bytes)
  }

  toNumber(): number {
    if (this.bytes.length !== 8) {
      throw new Error(
        `The location is of length ${this.bytes.length}, 8 bytes expected for a number.`,
      )
    }

    return Number(new DataView(this.bytes.buffer).getBigInt64(0, false))
  }

  toUuidString(): string {
    return stringifyUuid(this.bytes)
  }
}

export class Keyword {
  bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  static fromString(value: string): Keyword {
    return new Keyword(new TextEncoder().encode(value))
  }

  static fromUuid(value: string): Keyword {
    return new Keyword(Uint8Array.from(parseUuid(value)))
  }

  toBase64(): string {
    return fromByteArray(this.bytes)
  }

  toString(): string {
    return new TextDecoder().decode(this.bytes)
  }
}

export class FindexKey {
  _bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this._bytes = bytes
  }

  toBase64(): string {
    return fromByteArray(this.bytes)
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

  static fromString(value: string): Label {
    return new Label(new TextEncoder().encode(value))
  }
}

/**
 * A new value to index for a given set of keywords:
 * IndexedValue -> Set<KeyWord>
 */
export interface IndexedEntry {
  indexedValue: IndexedValue | Location | Keyword
  keywords: Set<Keyword> | Keyword[] | string[]
}

/**
 * Generates aliases for a keyword to use in upsert
 * If keyword is "Thibaud" and minChars is 3 return these aliases ["Thi" => "Thib", "Thib" => "Thiba", "Thiba" => "Thibau", "Thibau" => "Thibaud"]
 * @param keyword Generate aliases to this keyword
 * @param minChars Start at this number of characters
 * @returns IndexedEntry to add with upsert
 */
export function generateAliases(
  keyword: string,
  minChars: number = 3,
): IndexedEntry[] {
  const entries = []

  for (let charsIndex = minChars; charsIndex < keyword.length; charsIndex++) {
    entries.push({
      indexedValue: IndexedValue.fromNextWord(
        Keyword.fromString(keyword.slice(0, charsIndex + 1)),
      ),
      keywords: new Set([Keyword.fromString(keyword.slice(0, charsIndex))]),
    })
  }

  return entries
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
    keywords: string[] | Uint8Array[],
  ) {
    if (location instanceof Uint8Array) {
      this.indexedValue = IndexedValue.fromLocation(new Location(location))
    } else {
      this.indexedValue = IndexedValue.fromLocation(
        new Location(new TextEncoder().encode(location)),
      )
    }
    this.keywords = new Set(
      keywords.map((v) => {
        if (v instanceof Uint8Array) {
          return new Keyword(v)
        }
        return new Keyword(new TextEncoder().encode(v))
      }),
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
        new Keyword(new TextEncoder().encode(destination)),
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
export type Fetch = (uids: Uint8Array[]) => Promise<UidsAndValues>

/**
 * Insert, or update an existing, (uid, value) line in the Entry table
 */
export type Upsert = (
  old_values: UidsAndValues,
  new_values: UidsAndValues,
) => Promise<UidsAndValues>

/**
 * Insert, or update an existing, (uid, value) line in the Chain table
 */
export type Insert = (uidsAndValues: UidsAndValues) => Promise<void>

/**
 * Called with results found at every node while the search walks the search graph.
 * Returning false, stops the walk.
 */
export type Interrupt = (
  indexedValues: IntermediateSearchResults,
) => Promise<boolean>

export class SearchResults {
  locationsPerKeywords: Array<{
    keyword: Uint8Array
    locations: Location[]
  }>

  constructor(
    resultsPerKeywords: Array<{ keyword: Uint8Array; results: Uint8Array[] }>,
  ) {
    this.locationsPerKeywords = resultsPerKeywords.map(
      ({ keyword, results }) => ({
        keyword,
        locations: results.map((bytes) => new Location(bytes)),
      }),
    )
  }

  get(keyword: string | Uint8Array): Location[] {
    const keywordAsBytes =
      typeof keyword === "string" ? new TextEncoder().encode(keyword) : keyword

    for (const { keyword: keywordInResults, locations } of this
      .locationsPerKeywords) {
      if (bytesEquals(keywordAsBytes, keywordInResults)) {
        return locations
      }
    }

    const keywordAsString =
      keyword instanceof Uint8Array ? hexEncode(keyword) : keyword
    throw new Error(`Cannot find ${keywordAsString} inside the search results.`)
  }

  locations(): Location[] {
    return Array.from(this)
  }

  toNumbers(): number[] {
    return this.locations().map((location) => location.toNumber())
  }

  toStrings(): string[] {
    return this.locations().map((location) => location.toString())
  }

  toUuidStrings(): string[] {
    return this.locations().map((location) => location.toUuidString())
  }

  total(): number {
    return this.locations().length
  }

  *[Symbol.iterator](): Generator<Location, void, void> {
    const alreadyYields = new Set() // Do not yield multiple times the same location if returned from multiple keywords

    for (const { locations } of this.locationsPerKeywords) {
      for (const location of locations) {
        const locationEncoded = hexEncode(location.bytes)

        if (!alreadyYields.has(locationEncoded)) {
          alreadyYields.add(locationEncoded)
          yield location
        }
      }
    }
  }
}

export class IntermediateSearchResults {
  indexedValuesPerKeywords: Array<{
    keyword: Uint8Array
    indexedValues: IndexedValue[]
  }>

  constructor(
    resultsPerKeywords: Array<{ keyword: Uint8Array; results: Uint8Array[] }>,
  ) {
    this.indexedValuesPerKeywords = resultsPerKeywords.map(
      ({ keyword, results }) => ({
        keyword,
        indexedValues: results.map((bytes) => new IndexedValue(bytes)),
      }),
    )
  }

  getLocations(keyword: string | Uint8Array): Location[] {
    return this.getAllIndexedValues(keyword)
      .map((result) => result.getLocation())
      .filter((location) => location !== null) as Location[]
  }

  getKeywords(keyword: string | Uint8Array): Keyword[] {
    return this.getAllIndexedValues(keyword)
      .map((result) => result.getNextWord())
      .filter((kw) => kw !== null) as Keyword[]
  }

  getAllIndexedValues(keyword: string | Uint8Array): IndexedValue[] {
    const keywordAsBytes =
      typeof keyword === "string" ? new TextEncoder().encode(keyword) : keyword

    for (const { keyword: keywordInResults, indexedValues } of this
      .indexedValuesPerKeywords) {
      if (bytesEquals(keywordAsBytes, keywordInResults)) {
        return indexedValues
      }
    }

    const keywordAsString =
      keyword instanceof Uint8Array ? hexEncode(keyword) : keyword
    throw new Error(`Cannot find ${keywordAsString} inside the search results.`)
  }

  indexedValues(): IndexedValue[] {
    return Array.from(this)
  }

  total(): number {
    return this.indexedValues().length
  }

  *[Symbol.iterator](): Generator<IndexedValue, void, void> {
    const alreadyYields = new Set() // Do not yield multiple times the same location if returned from multiple keywords

    for (const { indexedValues } of this.indexedValuesPerKeywords) {
      for (const indexedValue of indexedValues) {
        const ivEncoded = hexEncode(indexedValue.bytes)

        if (!alreadyYields.has(ivEncoded)) {
          alreadyYields.add(ivEncoded)
          yield indexedValue
        }
      }
    }
  }
}

/**
 *
 * @param indexedEntries JS new indexed entries
 * @param debugName Name of the parameter to show in errors
 * @returns wasm formatted indexed values to keywords
 */
export function indexedEntriesToBytes(
  indexedEntries: IndexedEntry[],
  debugName: string,
): Array<{
  indexedValue: Uint8Array
  keywords: Uint8Array[]
}> {
  if (!Array.isArray(indexedEntries)) {
    throw new Error(
      `During Findex upsert: \`${debugName}\` should be an array, ${typeof indexedEntries} received.`,
    )
  }

  return indexedEntries.map(({ indexedValue, keywords }) => {
    let indexedValueBytes
    if (indexedValue instanceof IndexedValue) {
      indexedValueBytes = indexedValue.bytes
    } else if (indexedValue instanceof Location) {
      indexedValueBytes = IndexedValue.fromLocation(indexedValue).bytes
    } else if (indexedValue instanceof Keyword) {
      indexedValueBytes = IndexedValue.fromNextWord(indexedValue).bytes
    } else {
      throw new Error(
        `During Findex upsert: all the \`indexedValue\` inside the \`${debugName}\` array should be of type IndexedValue, Location or Keyword, ${typeof indexedValue} received (${JSON.stringify(
          indexedValue,
        )}).`,
      )
    }

    if (!(Symbol.iterator in Object(keywords))) {
      throw new Error(
        `During Findex upsert: all the elements inside the \`${debugName}\` array should have an iterable property \`keywords\`, ${typeof keywords} received (${JSON.stringify(
          keywords,
        )}).`,
      )
    }

    return {
      indexedValue: indexedValueBytes,
      keywords: [...keywords].map((keyword) => {
        if (keyword instanceof Keyword) {
          return keyword.bytes
        } else if (typeof keyword === "string") {
          return Keyword.fromString(keyword).bytes
        } else {
          throw new Error(
            `During Findex upsert: all the \`keywords\` inside the \`${debugName}\` array should be of type \`Keyword\` or string, ${typeof keyword} received (${JSON.stringify(
              keyword,
            )}).`,
          )
        }
      }),
    }
  })
}
