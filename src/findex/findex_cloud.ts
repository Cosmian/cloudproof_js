/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import { fromByteArray, toByteArray } from "base64-js"
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
} from "../pkg/findex/cosmian_findex"

export interface FindexCloudToken {
  publicId: string
  findexMasterKey: Uint8Array

  fetchEntriesKey: Uint8Array | null
  fetchChainsKey: Uint8Array | null
  upsertEntriesKey: Uint8Array | null
  insertChainsKey: Uint8Array | null
}

/**
 * Transform a string to a token object
 */
function tokenToString(token: FindexCloudToken): string {
  const masterKeyAndPrivateKey = new Uint8Array([
    ...token.findexMasterKey,
    ...(token.fetchEntriesKey !== null ? [0, ...token.fetchEntriesKey] : []),
    ...(token.fetchChainsKey !== null ? [1, ...token.fetchChainsKey] : []),
    ...(token.upsertEntriesKey !== null ? [2, ...token.upsertEntriesKey] : []),
    ...(token.insertChainsKey !== null ? [3, ...token.insertChainsKey] : []),
  ])

  return token.publicId + fromByteArray(masterKeyAndPrivateKey)
}

/**
 * Transform a token to a string
 */
function tokenFromString(tokenAsString: string): FindexCloudToken {
  const publicId = tokenAsString.slice(0, 5)
  const bytes = toByteArray(tokenAsString.slice(5))
  const findexMasterKey = bytes.slice(0, 16)
  let callbacksKeys = bytes.slice(16)

  const token: FindexCloudToken = {
    publicId,
    findexMasterKey,

    fetchEntriesKey: null,
    fetchChainsKey: null,
    upsertEntriesKey: null,
    insertChainsKey: null,
  }

  while (callbacksKeys.length > 0) {
    const prefix = callbacksKeys[0]
    const value = callbacksKeys.slice(1, 16 + 1)
    callbacksKeys = callbacksKeys.slice(16 + 1)

    if (prefix === 0) {
      token.fetchEntriesKey = value
    } else if (prefix === 1) {
      token.fetchChainsKey = value
    } else if (prefix === 2) {
      token.upsertEntriesKey = value
    } else if (prefix === 3) {
      token.insertChainsKey = value
    }
  }

  return token
}

/**
 * Create a new token with reduced permissions
 */
function deriveNewToken(
  token: FindexCloudToken,
  permissions: {
    search: boolean
    index: boolean
  } = {
    search: false,
    index: false,
  },
): FindexCloudToken {
  const newToken: FindexCloudToken = {
    publicId: token.publicId,
    findexMasterKey: token.findexMasterKey,
    fetchEntriesKey: null,
    fetchChainsKey: null,
    upsertEntriesKey: null,
    insertChainsKey: null,
  }

  if (permissions.search) {
    newToken.fetchEntriesKey = token.fetchEntriesKey
    newToken.fetchChainsKey = token.fetchChainsKey
  }

  if (permissions.index) {
    newToken.fetchChainsKey = token.fetchChainsKey
    newToken.upsertEntriesKey = token.upsertEntriesKey
    newToken.insertChainsKey = token.insertChainsKey
  }

  return newToken
}

/**
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function FindexCloud() {
  await Findex()

  return {
    tokenToString,
    tokenFromString,
    deriveNewToken,

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
