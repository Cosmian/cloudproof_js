import { logger } from "utils/logger"
import { Backend } from "./backend"
import { loadWasm } from "./init"
import { UidsAndValues } from "./types"

/**
 * @returns the callbacks
 */
export async function backendsExamplesInMemory(): Promise<{
  entryBackend: Backend
  chainBackend: Backend
  dumpTables: () => void
  dropTables: () => Promise<void>
}> {
  await loadWasm()

  const entries: Map<string, Uint8Array> = new Map()
  const chains: Map<string, Uint8Array> = new Map()

  const fetchCallback = async (
    table: Map<string, Uint8Array>,
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    const results: UidsAndValues = []
    for (const requestedUid of uids) {
      const requestedValue = table.get(requestedUid.toString())
      if (requestedValue !== undefined) {
        results.push({ uid: requestedUid, value: requestedValue })
      }
    }
    return results
  }

  const upsertEntries = async (
    oldValues: UidsAndValues,
    newValues: UidsAndValues,
  ): Promise<UidsAndValues> => {
    const rejected = [] as UidsAndValues

    // Add old values in a map to efficiently search for matching UIDs.
    const mapOfOldValues = new Map()
    for (const { uid, value } of oldValues) {
      mapOfOldValues.set(uid.toString(), value)
    }

    for (const { uid, value: newValue } of newValues) {
      const currentValue = entries.get(uid.toString())

      if (
        currentValue?.toString() ===
        mapOfOldValues.get(uid.toString())?.toString()
      ) {
        entries.set(uid.toString(), newValue)
      } else if (currentValue === undefined) {
        throw new Error(
          "Rust shouldn't send us an oldValue if the table never contained a value… (except if there is a compact between)",
        )
      } else {
        rejected.push({ uid, value: currentValue })
      }
    }
    return rejected
  }

  const insertChains = async (uidsAndValues: UidsAndValues): Promise<void> => {
    for (const { uid: newUid, value: newValue } of uidsAndValues) {
      chains.set(newUid.toString(), newValue)
    }
  }

  const dumpTables = (): void => {
    logger.log(() => `entry table length: ${entries.size}`)
    logger.log(() => `chain table length: ${chains.size}`)
  }

  const dropTables = async (): Promise<void> => {
    entries.clear()
    chains.clear()
  }

  const entryCallbacks = new Backend()
  entryCallbacks.fetch = async (uids: Uint8Array[]) => {
    return await fetchCallback(entries, uids)
  }
  entryCallbacks.upsert = upsertEntries

  const chainCallbacks = new Backend()
  chainCallbacks.fetch = async (uids: Uint8Array[]) => {
    return await fetchCallback(chains, uids)
  }
  chainCallbacks.insert = insertChains

  return { entryBackend: entryCallbacks, chainBackend: chainCallbacks, dumpTables, dropTables }
}
