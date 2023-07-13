import { bytesEquals } from "../utils/utils"
import {
  FetchChains,
  FetchEntries,
  InsertChains,
  UidsAndValues,
  UidsAndValuesToUpsert,
  UpsertEntries,
} from "./init"

/**
 * @returns the callbacks
 */
export function callbacksExamplesInMemory(): {
  fetchEntries: FetchEntries
  fetchChains: FetchChains
  upsertEntries: UpsertEntries
  insertChains: InsertChains
} {
  const entries: UidsAndValues = []
  const chains: UidsAndValues = []

  const fetchCallback = async (
    table: UidsAndValues,
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    const results: UidsAndValues = []
    for (const requestedUid of uids) {
      for (const { uid, value } of table) {
        if (bytesEquals(uid, requestedUid)) {
          results.push({ uid, value })
          break
        }
      }
    }
    return results
  }
  const upsertEntries = async (
    uidsAndValues: UidsAndValuesToUpsert,
  ): Promise<UidsAndValues> => {
    const rejected = [] as UidsAndValues
    uidsAndValuesLoop: for (const {
      uid: newUid,
      oldValue,
      newValue,
    } of uidsAndValues) {
      for (const tableEntry of entries) {
        if (bytesEquals(tableEntry.uid, newUid)) {
          if (bytesEquals(tableEntry.value, oldValue)) {
            tableEntry.value = newValue
          } else {
            rejected.push(tableEntry)
          }
          continue uidsAndValuesLoop
        }
      }

      // The uid doesn't exist yet.
      if (oldValue !== null) {
        throw new Error(
          "Rust shouldn't send us an oldValue if the table never contained a value… (except if there is a compact between)",
        )
      }

      entries.push({ uid: newUid, value: newValue })
    }

    return rejected
  }
  const insertChains = async (uidsAndValues: UidsAndValues): Promise<void> => {
    for (const { uid: newUid, value: newValue } of uidsAndValues) {
      for (const tableEntry of chains) {
        if (bytesEquals(tableEntry.uid, newUid)) {
          tableEntry.value = newValue
          break
        }
      }

      // The uid doesn't exist yet.
      chains.push({ uid: newUid, value: newValue })
    }
  }

  return {
    fetchEntries: async (uids: Uint8Array[]) =>
      await fetchCallback(entries, uids),
    fetchChains: async (uids: Uint8Array[]) =>
      await fetchCallback(chains, uids),
    upsertEntries,
    insertChains,
  }
}
