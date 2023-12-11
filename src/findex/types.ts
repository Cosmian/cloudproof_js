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

  static fromData(data: Data): IndexedValue {
    const prefix = new Uint8Array(data.bytes.length + 1)
    prefix[0] = IndexedValue.L_PREFIX
    for (let index = 0; index < data.bytes.length; index++) {
      prefix[index + 1] = data.bytes[index]
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

  getData(): Data | null {
    if (this.bytes[0] === IndexedValue.L_PREFIX) {
      return new Data(this.bytes.slice(1))
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

export class Data {
  bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  static fromString(value: string): Data {
    return new Data(new TextEncoder().encode(value))
  }

  /**
   * Numbers are encoded in big-endian 8 bytes.
   * JS `number` type cannot encode the all 64 bits numbers because it uses floating point representation
   * that's why we use `BigInt` internally but we convert to `number` (it's theoretically wrong) because `number`
   * is easier to use in JS that BigInt. If we insert a really big 64bits number in Java for example, JS will
   * not be able to read it.
   * @param value number
   * @returns data
   */
  static fromNumber(value: number): Data {
    const buffer = new ArrayBuffer(8)
    new DataView(buffer).setBigInt64(0, BigInt(value), false)

    return new Data(new Uint8Array(buffer))
  }

  /**
   * Convert UUIDv4 only because they are more common.
   * @param uuidv4 uuid
   * @returns data
   */
  static fromUuid(uuidv4: string): Data {
    return new Data(Uint8Array.from(parseUuid(uuidv4)))
  }

  toString(): string {
    return new TextDecoder().decode(this.bytes)
  }

  toNumber(): number {
    if (this.bytes.length !== 8) {
      throw new Error(
        `The data is of length ${this.bytes.length}, 8 bytes expected for a number.`,
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

/**
 * A new value to index for a given set of keywords:
 * IndexedValue -> Set<KeyWord>
 */
export interface IndexedEntry {
  indexedValue: IndexedValue | Data | Keyword
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
 * indexing a {@link Data} with keywords supplied
 * as arrays of strings or bytes
 */
export class DataIndexEntry implements IndexedEntry {
  indexedValue: IndexedValue
  keywords: Set<Keyword>
  constructor(data: string | Uint8Array, keywords: string[] | Uint8Array[]) {
    if (data instanceof Uint8Array) {
      this.indexedValue = IndexedValue.fromData(new Data(data))
    } else {
      this.indexedValue = IndexedValue.fromData(
        new Data(new TextEncoder().encode(data)),
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
  dataPerKeywords: Array<{
    keyword: Uint8Array
    data: Data[]
  }>

  constructor(
    resultsPerKeywords: Array<{ keyword: Uint8Array; results: Uint8Array[] }>,
  ) {
    this.dataPerKeywords = resultsPerKeywords.map(({ keyword, results }) => ({
      keyword,
      data: results.map((bytes) => new Data(bytes)),
    }))
  }

  get(keyword: string | Uint8Array): Data[] {
    const keywordAsBytes =
      typeof keyword === "string" ? new TextEncoder().encode(keyword) : keyword

    for (const { keyword: keywordInResults, data } of this.dataPerKeywords) {
      if (bytesEquals(keywordAsBytes, keywordInResults)) {
        return data
      }
    }

    const keywordAsString =
      keyword instanceof Uint8Array ? hexEncode(keyword) : keyword
    throw new Error(`Cannot find ${keywordAsString} inside the search results.`)
  }

  data(): Data[] {
    return Array.from(this)
  }

  toNumbers(): number[] {
    return this.data().map((data) => data.toNumber())
  }

  toStrings(): string[] {
    return this.data().map((data) => data.toString())
  }

  toUuidStrings(): string[] {
    return this.data().map((data) => data.toUuidString())
  }

  total(): number {
    return this.data().length
  }

  *[Symbol.iterator](): Generator<Data, void, void> {
    const alreadyYields = new Set() // Do not yield multiple times the same data if returned from multiple keywords

    for (const { data } of this.dataPerKeywords) {
      for (const datum of data) {
        const DatumEncoded = hexEncode(datum.bytes)

        if (!alreadyYields.has(DatumEncoded)) {
          alreadyYields.add(DatumEncoded)
          yield datum
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

  getData(keyword: string | Uint8Array): Data[] {
    return this.getAllIndexedValues(keyword)
      .map((result) => result.getData())
      .filter((data) => data !== null) as Data[]
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
    const alreadyYields = new Set() // Do not yield multiple times the same data if returned from multiple keywords

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
    } else if (indexedValue instanceof Data) {
      indexedValueBytes = IndexedValue.fromData(indexedValue).bytes
    } else if (indexedValue instanceof Keyword) {
      indexedValueBytes = IndexedValue.fromNextWord(indexedValue).bytes
    } else {
      throw new Error(
        `During Findex upsert: all the \`indexedValue\` inside the \`${debugName}\` array should be of type IndexedValue, Data or Keyword, ${typeof indexedValue} received (${JSON.stringify(
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
