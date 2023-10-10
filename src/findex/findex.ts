import {
  FindexKey,
  indexedEntriesToBytes,
  IndexedEntry,
  Keyword,
  Label,
  SearchResults,
} from "./types"
import {
  WasmCallbacks,
  WasmFindex,
  webassembly_logger_init,
} from "../pkg/findex/cloudproof_findex"
import { IntermediateSearchResults, Interrupt } from "./types"
import { loadWasm } from "./init"
import { SymmetricKey } from "cloudproof_kms_js"

let loggerInit = false

/**
 * Findex definition
 * @returns {Promise<Findex>} results found at every node while the search walks the search graph
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export class Findex {
  readonly wasmFindex: WasmFindex

  private constructor(wasm_findex: WasmFindex) {
    this.wasmFindex = wasm_findex
  }

  /**
   * Instantiates a Findex instance usin the given callbacks.
   */
  static async new_with_wasm_backend(
    entry_callbacks: WasmCallbacks,
    chain_callbacks: WasmCallbacks,
  ) {
    await loadWasm()
    return new Findex(
      await WasmFindex.new_with_wasm_backend(entry_callbacks, chain_callbacks),
    )
  }

  /**
   * Instantiates a Findex instance using the token and URL.
   */
  static async new_with_cloud_backend(token: string, url: string) {
    await loadWasm()
    return new Findex(await WasmFindex.new_with_rest_backend(token, url))
  }

  /**
   * Add the following entries in the index.
   *
   * @param {FindexKey | SymmetricKey} masterKey Findex's key
   * @param {Label} label public label for the index
   * @param {IndexedEntry[]} additions new entries to upsert in indexes
   * @param options Additional optional options
   * @param options.verbose the optional verbose bool parameter
   * @returns {Keyword[]} the list of the newly inserted keywords in the index
   */
  async add(
    masterKey: FindexKey | SymmetricKey | Uint8Array,
    label: Label | Uint8Array,
    additions: IndexedEntry[],
    options: { verbose?: false } = {},
  ): Promise<Keyword[]> {
    if (options.verbose === undefined && !loggerInit) {
      await webassembly_logger_init()
      loggerInit = true
    }

    if (masterKey instanceof SymmetricKey) {
      masterKey = new FindexKey(masterKey.bytes())
    }
    if (masterKey instanceof Uint8Array) {
      masterKey = new FindexKey(masterKey)
    }

    if (label instanceof Uint8Array) {
      label = new Label(label)
    }

    const additionsBytes = indexedEntriesToBytes(additions, "additions")

    const newIds: Uint8Array[] = await this.wasmFindex.add(
      masterKey.bytes,
      label.bytes,
      additionsBytes,
    )

    return newIds.map((value: Uint8Array) => new Keyword(value))
  }

  /**
   * Delete the following entries from the index.
   *
   * @param {FindexKey | SymmetricKey} masterKey Findex's key
   * @param {Label} label public label for the index
   * @param {IndexedEntry[]} deletions new entries to upsert in indexes
   * @param options Additional optional options
   * @param options.verbose the optional verbose bool parameter
   * @returns {Keyword[]} the list of the newly inserted keywords in the index
   */
  async delete(
    masterKey: FindexKey | SymmetricKey | Uint8Array,
    label: Label | Uint8Array,
    deletions: IndexedEntry[],
    options: { verbose?: false } = {},
  ): Promise<Keyword[]> {
    if (options.verbose === undefined && !loggerInit) {
      await webassembly_logger_init()
      loggerInit = true
    }

    if (masterKey instanceof SymmetricKey) {
      masterKey = new FindexKey(masterKey.bytes())
    }
    if (masterKey instanceof Uint8Array) {
      masterKey = new FindexKey(masterKey)
    }

    if (label instanceof Uint8Array) {
      label = new Label(label)
    }

    const deletionBytes = indexedEntriesToBytes(deletions, "deletions")

    const newIds: Uint8Array[] = await this.wasmFindex.delete(
      masterKey.bytes,
      label.bytes,
      deletionBytes,
    )
    return newIds.map((value: Uint8Array) => new Keyword(value))
  }

  /**
   * Search indexed keywords and return the corresponding IndexedValues
   * @param {FindexKey | SymmetricKey} masterKey Findex's key
   * @param {Label} label public label for the index
   * @param keywords keywords to search inside the indexes
   * @param options Additional optional options to the search
   * @param options.userInterrupt the optional callback of found values as the search graph is walked. Returning `true` stops the walk
   * @param options.verbose the optional verbose bool parameter
   * @returns the search results
   */
  async search(
    masterKey: FindexKey | SymmetricKey | Uint8Array,
    label: Label | Uint8Array,
    keywords: Set<string | Uint8Array> | Array<string | Uint8Array>,
    options: {
      userInterrupt?: Interrupt
      verbose?: false
    } = {},
  ): Promise<SearchResults> {
    if (options.verbose === undefined && !loggerInit) {
      await webassembly_logger_init()
      loggerInit = true
    }

    // convert key to a single representation
    if (masterKey instanceof SymmetricKey) {
      masterKey = new FindexKey(masterKey.bytes())
    }
    if (masterKey instanceof Uint8Array) {
      masterKey = new FindexKey(masterKey)
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
        ? async (_) => false
        : options.userInterrupt

    const resultsPerKeywords = await this.wasmFindex.search(
      masterKey.bytes,
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
