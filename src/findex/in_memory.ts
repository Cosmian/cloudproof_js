import { logger } from "utils/logger"
import { DbInterface } from "./backend"
import { loadWasm } from "./init"
import { UidsAndValues } from "./types"

/**
 * @returns the callbacks
 */
export async function inMemoryDbInterfaceExample(): Promise<{
  entryInterface: DbInterface
  chainInterface: DbInterface
  dumpTables: () => void
  dropTables: () => Promise<void>
}> {
  await loadWasm()

  const entryTable: Map<string, Uint8Array> = new Map()
  const chainTable: Map<string, Uint8Array> = new Map()

  const fetch = async (
    uids: Uint8Array[],
    table: Map<string, Uint8Array>,
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
      const currentValue = entryTable.get(uid.toString())

      if (
        currentValue?.toString() ===
        mapOfOldValues.get(uid.toString())?.toString()
      ) {
        entryTable.set(uid.toString(), newValue)
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

  const insert = async (
    items: UidsAndValues,
    table: Map<string, Uint8Array>,
  ): Promise<void> => {
    for (const { uid: newUid, value: newValue } of items) {
      table.set(newUid.toString(), newValue)
    }
  }

  const dumpTables = (): void => {
    logger.log(() => `entry table length: ${entryTable.size}`)
    logger.log(() => `chain table length: ${chainTable.size}`)
  }

  const dropTables = async (): Promise<void> => {
    entryTable.clear()
    chainTable.clear()
  }

  const entryInterface = new DbInterface()
  entryInterface.fetch = async (uids: Uint8Array[]) =>
    await fetch(uids, entryTable)
  entryInterface.insert = async (entries: UidsAndValues) =>
    await insert(entries, entryTable)
  entryInterface.upsert = upsertEntries

  const chainInterface = new DbInterface()
  chainInterface.fetch = async (uids: Uint8Array[]) =>
    await fetch(uids, chainTable)
  chainInterface.insert = async (links: UidsAndValues) =>
    await insert(links, chainTable)

  return { entryInterface, chainInterface, dumpTables, dropTables }
}
