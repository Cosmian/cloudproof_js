/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import {
  Findex,
  IndexedEntry,
  Label,
  SearchResults,
  newIndexedEntriesToIndexedValuesToKeywords,
} from "./findex"

import {
  webassembly_search_cloud,
  webassembly_upsert_cloud,
  webassembly_derive_new_token,
  webassembly_generate_new_token,
} from "../pkg/findex/cosmian_findex"

/**
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function FindexCloud() {
  await Findex()

  return {
    generateNewToken: (
      indexId: string,
      fetchEntriesKey: Uint8Array,
      fetchChainsKey: Uint8Array,
      upsertEntiesKey: Uint8Array,
      insertChainsKey: Uint8Array,
    ): string => {
      return webassembly_generate_new_token(
        indexId,
        fetchEntriesKey,
        fetchChainsKey,
        upsertEntiesKey,
        insertChainsKey,
      )
    },

    deriveNewToken: (
      token: string,
      permissions: {
        search: boolean,
        index: boolean,
      },
    ): string => {
      return webassembly_derive_new_token(token, permissions.search, permissions.index)
    },

    upsert: async (
      token: string,
      label: Uint8Array | Label,
      newIndexedEntries: IndexedEntry[],
    ) => {
      if (label instanceof Uint8Array) {
        label = new Label(label)
      }

      const indexedValuesAndWords =
        newIndexedEntriesToIndexedValuesToKeywords(newIndexedEntries)

      return await webassembly_upsert_cloud(
        token,
        label.bytes,
        indexedValuesAndWords,
      )
    },

    search: async (
      token: string,
      label: Uint8Array | Label,
      keywords: Set<string | Uint8Array> | Array<string | Uint8Array>,
      options: {
        maxResultsPerKeyword?: number
        maxGraphDepth?: number
        insecureFetchChainsBatchSize?: number
        baseUrl?: string
      } = {},
    ) => {
      if (label instanceof Uint8Array) {
        label = new Label(label)
      }

      const kws: Uint8Array[] = []
      for (const k of keywords) {
        kws.push(k instanceof Uint8Array ? k : new TextEncoder().encode(k))
      }

      const resultsPerKeywords = await webassembly_search_cloud(
        token,
        label.bytes,
        kws,
        typeof options.maxResultsPerKeyword === "undefined"
          ? 1000 * 1000
          : options.maxResultsPerKeyword,
        typeof options.maxGraphDepth === "undefined"
          ? 1000
          : options.maxGraphDepth,
        typeof options.insecureFetchChainsBatchSize === "undefined"
          ? 0
          : options.insecureFetchChainsBatchSize,
        options.baseUrl,
      )

      return new SearchResults(resultsPerKeywords)
    },
  }
}
