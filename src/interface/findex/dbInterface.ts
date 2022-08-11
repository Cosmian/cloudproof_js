export interface DBInterface {
    getEntryTableEntriesById(uids: string[]): Promise<{ uid: string; value: string; }[]>

    getChainTableEntriesById(uids: string[]): Promise<{ uid: string; value: string; }[]>

    upsertEntryTableEntries(entries: { uid: string; value: string; }[]): Promise<number>

    upsertChainTableEntries(entries: { uid: string; value: string; }[]): Promise<number>
}
