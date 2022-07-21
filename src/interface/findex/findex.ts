import { webassemby_search, webassemby_upsert } from "../../../wasm_lib/findex/findex";
import { deserializeHashMap, deserializeList, hexDecodeBytes, hexEncodeBytes, serializeHashMap, serializeList } from "../../utils/utils";
import { DBInterface } from "../db/dbInterface";

type MasterKeys = {
  k: string,
  k_star: string,
}

export class Findex {
  db: DBInterface;

  constructor(db: DBInterface) {
    this.db = db;
  }

  fetchEntry = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids: Uint8Array[] = deserializeList(serializedUids);
    const uidsHex = uids.map(uid => hexEncodeBytes(uid));
    const result = await this.db.getEntryTableEntries(uidsHex);
    const formattedResult: { uid: Uint8Array, value: Uint8Array}[] = result.reduce((acc: { uid: Uint8Array, value: Uint8Array }[], el) => {
      const uid: Uint8Array = hexDecodeBytes(el.uid);
      const value: Uint8Array = hexDecodeBytes(el.value);
      return [...acc, { uid, value} ];
    }, []);
    return serializeHashMap(formattedResult);
  }

  fetchChain = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids = deserializeList(serializedUids);
    const uidsHex = uids.map(uid => hexEncodeBytes(uid));
    const result = await this.db.getChainTableEntries(uidsHex);
    const formattedResult = result.reduce((acc: Uint8Array[], el) => {
      const value: Uint8Array = hexDecodeBytes(el.value);
      return [...acc, value];
    }, []);
    return serializeList(formattedResult);
  }

  upsertEntry = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries)
    let formattedElements: { uid: string, value: string }[] = [];
    for (const item of items) {
      formattedElements = [...formattedElements, { 'uid': hexEncodeBytes(item.key), 'value': hexEncodeBytes(item.value) }]
    }
    await this.db.upsertEntryTableEntries(formattedElements);
    return formattedElements.length;
  }

  upsertChain = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries)
    let formattedElements: { uid: string, value: string }[] = [];
    for (const item of items) {
      formattedElements = [...formattedElements, { 'uid': hexEncodeBytes(item.key), 'value': hexEncodeBytes(item.value) }]
    }
    await this.db.upsertChainTableEntries(formattedElements);
    return formattedElements.length;
  }

  public async upsert(masterKeys: MasterKeys, users: { [key: string]: string; }[]): Promise<any> {
    await this.db.deleteAllChainTableEntries();
    await this.db.deleteAllEntryTableEntries();
    let dbUsers = {};
    users.map((user) => {
      const userId = user.id;
      delete user.id;
      dbUsers = {
        ...dbUsers,
        ...(userId ? { [userId]: [user.firstName, user.lastName, user.phone, user.email, user.country, user.region, user.employeeNumber, user.security ] } : {})
      };
    });
    try {
      const res = webassemby_upsert(JSON.stringify(masterKeys), JSON.stringify(dbUsers), this.fetchEntry, this.upsertEntry, this.upsertChain);
      console.log("Elements upserted.")
      return res;
    } catch (e) {
      console.log("Error upserting : ", e)
    }
  }

  public async search(masterKeys: MasterKeys, words: string[]): Promise<any> {
    try {
      const res = await webassemby_search(JSON.stringify(masterKeys), JSON.stringify(words), -2, this.fetchEntry, this.fetchChain);
      const queryUids = JSON.parse(res);
      return queryUids;
    } catch (e) {
      console.log("Error searching : ", e)
    }
  }
}
