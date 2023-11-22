// /* eslint-disable */

import { SymmetricKey } from "cloudproof_kms_js"
import {
  WasmCallbacks,
  WasmFindex,
  webassembly_logger_init,
} from "../pkg/findex/cloudproof_findex"
import { Callbacks } from "./callbacks"

import {
  FindexKey,
  IndexedEntry,
  IntermediateSearchResults,
  Interrupt,
  Keyword,
  Label,
  SearchResults,
  indexedEntriesToBytes,
} from "./types"

export interface InstantiatedFindex {
  /**
   * Add the given values to this Findex index for the corresponding
   * keywords.
   * @param {Uint8Array} key
   * @param {Uint8Array} label
   * @param {Array<{indexedValue: Uint8Array, keywords: Array<Uint8Array>}>} additions
   * @returns {Promise<Array<Uint8Array>>}
   */
  add: (
    key: Uint8Array,
    label: Uint8Array,
    additions: Array<{ indexedValue: Uint8Array; keywords: Uint8Array[] }>,
  ) => Promise<Uint8Array[]>

  /**
   * Remove the given values from this Findex index for the corresponding
   * keywords.
   * @param {Uint8Array} key
   * @param {Uint8Array} label
   * @param {Array<{indexedValue: Uint8Array, keywords: Array<Uint8Array>}>} deletions
   * @returns {Promise<Array<Uint8Array>>}
   */
  delete: (
    key: Uint8Array,
    label: Uint8Array,
    deletions: Array<{ indexedValue: Uint8Array; keywords: Uint8Array[] }>,
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
    label: Uint8Array,
    keywords: Uint8Array[],
    interrupt: Function,
  ) => Promise<Array<{ keyword: Uint8Array; results: Uint8Array[] }>>
}

/**
 * Findex definition
 * @returns {Promise<FindexBase>} results found at every node while the search walks the search graph
 */
export class FindexBase {
  _instantiatedFindex: InstantiatedFindex

  constructor(instantiatedFindex: InstantiatedFindex) {
    this._instantiatedFindex = instantiatedFindex
  }

  /**
   * Add the following entries in the index.
   * @param {FindexKey | SymmetricKey} findexKey Findex's key
   * @param {Label} label public label for the index
   * @param {IndexedEntry[]} additions new entries to upsert in indexes
   * @param options Additional optional options
   * @param options.verbose the optional verbose bool parameter
   * @returns {Keyword[]} the list of the newly inserted keywords in the index
   */
  public async add(
    findexKey: FindexKey | SymmetricKey | Uint8Array,
    label: Label | Uint8Array,
    additions: IndexedEntry[],
    options: { verbose?: false } = {},
  ): Promise<Keyword[]> {
    if (options.verbose !== undefined && options.verbose) {
      await webassembly_logger_init()
    }

    if (findexKey instanceof SymmetricKey) {
      findexKey = new FindexKey(findexKey.bytes())
    }
    if (findexKey instanceof Uint8Array) {
      findexKey = new FindexKey(findexKey)
    }

    if (label instanceof Uint8Array) {
      label = new Label(label)
    }

    const additionsBytes = indexedEntriesToBytes(additions, "additions")

    const newIds: Uint8Array[] = await this._instantiatedFindex.add(
      findexKey.bytes,
      label.bytes,
      additionsBytes,
    )

    return newIds.map((value: Uint8Array) => new Keyword(value))
  }

  /**
   * Delete the following entries from the index.
   * @param {FindexKey | SymmetricKey} findexKey Findex's key
   * @param {Label} label public label for the index
   * @param {IndexedEntry[]} deletions new entries to upsert in indexes
   * @param options Additional optional options
   * @param options.verbose the optional verbose bool parameter
   * @returns {Keyword[]} the list of the newly inserted keywords in the index
   */
  async delete(
    findexKey: FindexKey | SymmetricKey | Uint8Array,
    label: Label | Uint8Array,
    deletions: IndexedEntry[],
    options: { verbose?: false } = {},
  ): Promise<Keyword[]> {
    if (options.verbose !== undefined && options.verbose) {
      await webassembly_logger_init()
    }

    if (findexKey instanceof SymmetricKey) {
      findexKey = new FindexKey(findexKey.bytes())
    }
    if (findexKey instanceof Uint8Array) {
      findexKey = new FindexKey(findexKey)
    }

    if (label instanceof Uint8Array) {
      label = new Label(label)
    }

    const deletionBytes = indexedEntriesToBytes(deletions, "deletions")

    const newIds: Uint8Array[] = await this._instantiatedFindex.delete(
      findexKey.bytes,
      label.bytes,
      deletionBytes,
    )
    return newIds.map((value: Uint8Array) => new Keyword(value))
  }

  /**
   * Search indexed keywords and return the corresponding IndexedValues
   * @param {FindexKey | SymmetricKey} findexKey Findex's key
   * @param {Label} label public label for the index
   * @param keywords keywords to search inside the indexes
   * @param options Additional optional options to the search
   * @param options.userInterrupt the optional callback of found values as the search graph is walked. Returning `true` stops the walk
   * @param options.verbose the optional verbose bool parameter
   * @returns the search results
   */
  async search(
    findexKey: FindexKey | SymmetricKey | Uint8Array,
    label: Label | Uint8Array,
    keywords: Set<string | Uint8Array> | Array<string | Uint8Array>,
    options: {
      userInterrupt?: Interrupt
      verbose?: false
    } = {},
  ): Promise<SearchResults> {
    if (options.verbose !== undefined && options.verbose) {
      await webassembly_logger_init()
    }

    // convert key to a single representation
    if (findexKey instanceof SymmetricKey) {
      findexKey = new FindexKey(findexKey.bytes())
    }
    if (findexKey instanceof Uint8Array) {
      findexKey = new FindexKey(findexKey)
    }

    if (label instanceof Uint8Array) {
      label = new Label(label)
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
      findexKey.bytes,
      label.bytes,
      kws,
      async (
        indexedValuesPerKeywords: Array<{
          keyword: Uint8Array
          results: Uint8Array[]
        }>,
      ) => {
        return await userInterrupt(
          new IntermediateSearchResults(indexedValuesPerKeywords),
        )
      },
    )

    return new SearchResults(resultsPerKeywords)
  }
}

export class FindexWithWasmBackend extends FindexBase {
  constructor() {
    super(new WasmFindex()) // TODO: revisit this impl'.
  }

  public async createWithWasmBackend(
    entriesCallbacks: Callbacks,
    chainsCallbacks: Callbacks,
  ): Promise<void> {
    const entries = new WasmCallbacks()
    entries.delete = entriesCallbacks.delete
    entries.fetch = entriesCallbacks.fetch
    entries.insert = entriesCallbacks.insert
    entries.upsert = entriesCallbacks.upsert

    const chains = new WasmCallbacks()
    chains.delete = chainsCallbacks.delete
    chains.fetch = chainsCallbacks.fetch
    chains.insert = chainsCallbacks.insert
    chains.upsert = chainsCallbacks.upsert

    this._instantiatedFindex = await WasmFindex.new_with_wasm_backend(
      entries,
      chains,
    )
  }
}

export class FindexWithCloudBackend extends FindexBase {
  // TODO: rename to rest
  constructor() {
    super(new WasmFindex())
  }

  /**
   * Instantiates a Findex instance using the token and URL.
   * @param token findex server authorization token
   * @param url findex server
   * @returns initialized object
   */
  public async createWithCloudBackend(
    token: string,
    url: string,
  ): Promise<void> {
    const findex = await WasmFindex.new_with_rest_backend(token, url)
    this._instantiatedFindex = findex
  }
}
