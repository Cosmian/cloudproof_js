export interface DBInterface {

  getEntryTableEntries(uids: string[]): Promise<{ UID: string; Value: string; }[]>

  getChainTableEntries(uids: string[]): Promise<{ UID: string; Value: string; }[]>

  upsertEntryTableEntries(entries: { UID: string; Value: string; }[]): Promise<number>

  upsertChainTableEntries(entries: { UID: string; Value: string; }[]): Promise<number>

}
