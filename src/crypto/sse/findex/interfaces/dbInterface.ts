export interface DBInterface {
    // Callbacks abstract declaration
    fetchEntry(serializedUids: Uint8Array): Promise<Uint8Array>;
    fetchChain(serializedUids: Uint8Array): Promise<Uint8Array>;
    upsertEntry(serializedEntries: Uint8Array): Promise<number>;
    upsertChain(serializedEntries: Uint8Array): Promise<number>;

    // DB main functions
    getEntryTableEntriesById(uids: Uint8Array[]): Promise<{ uid: Uint8Array; value: Uint8Array; }[]>
    getChainTableEntriesById(uids: Uint8Array[]): Promise<{ uid: Uint8Array; value: Uint8Array; }[]>
    upsertEntryTableEntries(entries: { uid: Uint8Array; value: Uint8Array; }[]): Promise<number>
    upsertChainTableEntries(entries: { uid: Uint8Array; value: Uint8Array; }[]): Promise<number>
}
