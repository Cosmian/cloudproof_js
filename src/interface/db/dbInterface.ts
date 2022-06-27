export interface DBInterface {

  getEntryTableEntries(uids: string[]): Promise<{ uid: string; Value: string; }[]>

  getChainTableEntries(uids: string[]): Promise<{ uid: string; Value: string; }[]>

}
