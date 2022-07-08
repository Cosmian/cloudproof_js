export interface DBInterface {

  getEntryTableEntries(uids: string[]): Promise<{ UID: string; Value: string; }[]>

  getChainTableEntries(uids: string[]): Promise<{ UID: string; Value: string; }[]>

}
