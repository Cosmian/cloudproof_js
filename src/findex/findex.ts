// /* eslint-disable */

import { SymmetricKey } from "cloudproof_kms_js"
import {
  WasmCallbacks,
  WasmFindex,
  webassembly_logger_init,
} from "../pkg/findex/cloudproof_findex"
import { DbInterface } from "./backend"
import { loadWasm } from "./init"

import {
  IndexedEntry,
  Interrupt,
  Keyword,
  SearchResults,
  indexedEntriesToBytes,
} from "./types"

export interface InstantiatedFindex {
  /**
   * Add the given values to this Findex index for the corresponding
   * keywords.
   * @param {Uint8Array} key
   * @param {string} label
   * @param {Array<{indexedValue: Uint8Array, keywords: Array<Uint8Array>}>} associations
   * @returns {Promise<Array<Uint8Array>>}
   */
  add: (
    key: Uint8Array,
    label: string,
    associations: Array<{ indexedValue: Uint8Array; keywords: Uint8Array[] }>,
  ) => Promise<Uint8Array[]>

  /**
   * Remove the given values from this Findex index for the corresponding
   * keywords.
   * @param {Uint8Array} key
   * @param {Uint8Array} label
   * @param {Array<{indexedValue: Uint8Array, keywords: Array<Uint8Array>}>} associations
   * @returns {Promise<Array<Uint8Array>>}
   */
  delete: (
    key: Uint8Array,
    label: string,
    associations: Array<{ indexedValue: Uint8Array; keywords: Uint8Array[] }>,
  ) => Promise<Uint8Array[]>

  /**
   * Searches this Findex instance for the given keywords.
   *
   * The interrupt is called at each search graph level with the level's
   * results and allows interrupting the search.
   * @param {Uint8Array} key
   * @param {Uint8Array} label
   * @param {Array<Uint8Array>} keywords
   * @param {Function} interrupt
   * @returns {Promise<Array<{ keyword: Uint8Array, results: Array<Uint8Array> }>>}
   */
  search: (
    key: Uint8Array,
    label: string,
    keywords: Uint8Array[],
    interrupt?: Interrupt,
  ) => Promise<Array<{ keyword: Uint8Array; results: Uint8Array[] }>>
}

/**
 * Findex definition
 * @returns {Promise<Findex>} results found at every node while the search walks the search graph
 */
export class Findex {
  key: Uint8Array
  label: string
  _instantiatedFindex: InstantiatedFindex | null

  constructor(
    findexKey: SymmetricKey | Uint8Array,
    label: string,
  ) {
    if (findexKey instanceof SymmetricKey) {
      findexKey = findexKey.bytes()
    }

    this.key = findexKey
    this.label = label
    this._instantiatedFindex = null
  }

  /**
   * Instantiates a custom interface.
   * @param entryInterface Entry Table DB interface
   * @param chainInterface  Chain Table DB interface
   */
  public async instantiateCustomInterface(
    entryInterface: DbInterface,
    chainInterface?: DbInterface,
  ): Promise<void> {
    await loadWasm()
    const entries = new WasmCallbacks()
    entries.delete = entryInterface.delete
    entries.fetch = entryInterface.fetch
    entries.insert = entryInterface.insert
    entries.upsert = entryInterface.upsert

    const newInterface = chainInterface === undefined? entryInterface : chainInterface
    const chains = new WasmCallbacks()
    chains.delete = newInterface.delete
    chains.fetch = newInterface.fetch
    chains.insert = newInterface.insert
    chains.upsert = newInterface.upsert

    this._instantiatedFindex = await WasmFindex.new_with_custom_interface(
      entries,
      chains,
    )
  }

  /**
   * Instantiates a REST backend using the given token and URL.
   * @param token findex server authorization token
   * @param entryUrl findex server
   */
  public async instantiateRestInterface(
    token: string,
    entryUrl: string,
    chainUrl?: string,
  ): Promise<void> {
    await loadWasm()
    const newUrl = chainUrl === undefined? entryUrl : chainUrl
    const findex = await WasmFindex.new_with_rest_interface(token, entryUrl, newUrl)
    this._instantiatedFindex = findex
  }

  /**
   * Add the given associations to the index.
   * @param {IndexedEntry[]} associations new entries to upsert in indexes
   * @param options Additional optional options
   * @param options.verbose the optional verbose bool parameter
   * @returns {Keyword[]} the list of the newly inserted keywords in the index
   * @throws when the backend is not instantiated
   */
  public async add(
    associations: IndexedEntry[],
    options: { verbose?: false } = {},
  ): Promise<Keyword[]> {
    if (this._instantiatedFindex instanceof WasmFindex) {
      if (options.verbose !== undefined && options.verbose) {
        await webassembly_logger_init()
      }

      const additionsBytes = indexedEntriesToBytes(associations, "additions")

      const newIds: Uint8Array[] = await this._instantiatedFindex.add(
        this.key,
        this.label,
        additionsBytes,
      )

      return newIds.map((value: Uint8Array) => new Keyword(value))
    } else {
      throw new Error("Instantiate a backend before calling `add`")
    }
  }

  /**
   * Delete the given associations from the index.
   * @param {IndexedEntry[]} associations new entries to upsert in indexes
   * @param options Additional optional options
   * @param options.verbose the optional verbose bool parameter
   * @returns {Keyword[]} the list of the newly inserted keywords in the index
   * @throws when the backend is not instantiated
   */
  async delete(
    associations: IndexedEntry[],
    options: { verbose?: false } = {},
  ): Promise<Keyword[]> {
    if (this._instantiatedFindex instanceof WasmFindex) {
      if (options.verbose !== undefined && options.verbose) {
        await webassembly_logger_init()
      }

      if (options.verbose !== undefined && options.verbose) {
        await webassembly_logger_init()
      }

      const deletionBytes = indexedEntriesToBytes(associations, "deletions")

      const newIds: Uint8Array[] = await this._instantiatedFindex.delete(
        this.key,
        this.label,
        deletionBytes,
      )
      return newIds.map((value: Uint8Array) => new Keyword(value))
    } else {
      throw new Error("Instantiate a backend before calling `delete`")
    }
  }

  /**
   * Search for the given keywords in the index and return the corresponding
   * data.
   * @param keywords keywords to search inside the indexes
   * @param options Additional optional options to the search
   * @param options.userInterrupt the optional callback of found values as the search graph is walked. Returning `true` stops the walk
   * @param options.verbose the optional verbose bool parameter
   * @returns the search results
   * @throws when the backend is not instantiated
   */
  async search(
    keywords: Set<string | Uint8Array> | Array<string | Uint8Array>,
    options: {
      userInterrupt?: Interrupt
      verbose?: false
    } = {},
  ): Promise<SearchResults> {
    if (this._instantiatedFindex instanceof WasmFindex) {
      if (options.verbose !== undefined && options.verbose) {
        await webassembly_logger_init()
      }

      if (options.verbose !== undefined && options.verbose) {
        await webassembly_logger_init()
      }

      const kws: Uint8Array[] = []
      for (const k of keywords) {
        if (k instanceof Uint8Array) {
          kws.push(k)
        } else {
          kws.push(Keyword.fromString(k).bytes)
        }
      }

      // Never interrupt the search if no interrupt function is passed.
      const userInterrupt: Interrupt =
        typeof options.userInterrupt === "undefined"
          ? async () => false
          : options.userInterrupt

      const resultsPerKeywords = await this._instantiatedFindex.search(
        this.key,
        this.label,
        kws,
        userInterrupt,
      )

      return new SearchResults(resultsPerKeywords)
    } else {
      throw new Error("Instantiate a backend before calling `search`")
    }
  }
}
