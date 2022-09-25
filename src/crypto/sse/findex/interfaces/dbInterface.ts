import { Index } from '.'

export interface DBInterface {
  // Callbacks abstract declaration
  fetchEntry: (serializedUids: Uint8Array) => Promise<Uint8Array>
  fetchChain: (serializedUids: Uint8Array) => Promise<Uint8Array>
  upsertEntry: (serializedEntries: Uint8Array) => Promise<number>
  upsertChain: (serializedEntries: Uint8Array) => Promise<number>

  // DB main functions
  getEntryTableEntriesById: (uids: Uint8Array[]) => Promise<Index[]>
  getChainTableEntriesById: (uids: Uint8Array[]) => Promise<Index[]>
  upsertEntryTableEntries: (entries: Index[]) => Promise<number>
  upsertChainTableEntries: (entries: Index[]) => Promise<number>
}
