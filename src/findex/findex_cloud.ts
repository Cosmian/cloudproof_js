/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import {
  Findex,
  IndexedEntry,
  Label,
  SearchResults,
  indexedEntriesToBytes,
} from "./findex"

import {
  webassembly_search_cloud,
  webassembly_upsert_cloud,
  webassembly_derive_new_token,
  webassembly_generate_new_token,
} from "../pkg/findex/cloudproof_findex"

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
      upsertEntriesKey: Uint8Array,
      insertChainsKey: Uint8Array,
    ): string => {
      return webassembly_generate_new_token(
        indexId,
        fetchEntriesKey,
        fetchChainsKey,
        upsertEntriesKey,
        insertChainsKey,
      )
    },

    deriveNewToken: (
      token: string,
      permissions: {
        search: boolean
        index: boolean
      },
    ): string => {
      return webassembly_derive_new_token(
        token,
        permissions.search,
        permissions.index,
      )
    },

    upsert: async (
      token: string,
      label: Uint8Array | Label,
      additions: IndexedEntry[],
      deletions: IndexedEntry[],
      options: {
        baseUrl?: string
      } = {},
    ) => {
      if (label instanceof Uint8Array) {
        label = new Label(label)
      }

      const additionsBytes = indexedEntriesToBytes(additions, "additions")
      const deletionsBytes = indexedEntriesToBytes(deletions, "deletions")

      return await webassembly_upsert_cloud(
        token,
        label.bytes,
        additionsBytes,
        deletionsBytes,
        options.baseUrl,
      )
    },

    search: async (
      token: string,
      label: Uint8Array | Label,
      keywords: Set<string | Uint8Array> | Array<string | Uint8Array>,
      options: {
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
        options.baseUrl,
      )

      return new SearchResults(resultsPerKeywords)
    },
  }
}
