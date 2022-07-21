import { compute_entry_uids_aes256 } from "../../../wasm_lib/findex/findex";
import { EntryTableUnchainedValue, Sse } from "../../crypto/sse/sse";
import { DBInterface } from "../db/dbInterface";
import { hexDecode, hexEncode } from "./../../utils/utils";

export class Findex {

  public static async upsert(db: DBInterface, masterKeys: Object, users: { id?: string, firstName: string, lastName: string, phone: string, email: string, country: string, region: string, employeeNumber: string, security: string }[]): Promise<any> {

    const fetchEntry = async (uids_json: string): Promise<string> => {
      const uids = JSON.parse(uids_json);
      const result = await db.getEntryTableEntries(uids);
      const formattedResult = result.reduce((acc, el) => {
        return {...acc };
      }, {})
      return JSON.stringify(formattedResult);
    }

    const upsertEntry = async (x: string): Promise<number> => {
      const elements: { UID: string,  Value: string } = JSON.parse(x);
      let formattedElements: { UID: string, Value: string}[]  = [];
      for (const [key, value] of Object.entries(elements)) {
        formattedElements= [...formattedElements, { 'UID': key, 'Value': value}]
      }
      await db.upsertEntryTableEntries(formattedElements);
      console.log("POST", formattedElements)
      return formattedElements.length;
    }

    const upsertChain = async (x: string): Promise<number> => {
      const elements: { UID: string, Value: string } = JSON.parse(x);
      let formattedElements: { UID: string, Value: string }[] = [];
      for (const [key, value] of Object.entries(elements)) {
        formattedElements = [...formattedElements, { 'UID': key, 'Value': value }]
      }
      await db.upsertChainTableEntries(formattedElements);
      console.log("POST", formattedElements)
      return formattedElements.length;
    }

    let dbUsers = {};
    users.map((user) => {
      const userId = user.id;
      delete user.id;
      dbUsers = {
        ...dbUsers,
        ...(userId ? { [userId]: [user.firstName, user.lastName, user.phone, user.email, user.country, user.region, user.employeeNumber, user.security ] } : {})
      };
    });
    const res = compute_entry_uids_aes256(JSON.stringify(masterKeys), JSON.stringify(dbUsers), fetchEntry, upsertEntry, upsertChain);
    return res;
  }

  public static async query(k1: string, k2: string, words: string[], db: DBInterface, loopIterationLimit: number): Promise<{ word: string; dbUids: string[]; }[]> {
    const entryTableUids: string[] = words.map((word: string) => hexEncode(Sse.computeEntryTableUid(hexDecode(k1), word)));

    const entryTableValues: ({ UID: string; Value: string; } | null)[] = await db.getEntryTableEntries(entryTableUids);
    const entryElements: ({ UID: string; Value: string; word: string; } | null)[] = entryTableValues.map(element => element ? {...element, word: words[entryTableUids.indexOf(element.UID)] } : null);

    const unchainedValues: (EntryTableUnchainedValue | null)[] = entryElements.map((entry) => {
      if (!entry || !entry.Value) {
        return null;
      }
      return Sse.unchainEntryTableValue(entry.word, hexDecode(k2), hexDecode(entry.Value), loopIterationLimit);
    });

    let chainTableEntries: { word: string, kword: Uint8Array, chainTableValues: Uint8Array[] }[] = [];
    for (const [index, values] of unchainedValues.entries()) {
      const word = words[index];
      const kword = unchainedValues[index]?.kWord;
      if (values) {
        const chainTableEntriesStr: { UID: string; Value: string; }[] = await db.getChainTableEntries(values.chainTableUids.filter(value => value).map(uid => hexEncode(uid)))
        const chainTableValues: Uint8Array[] = chainTableEntriesStr.map(entry => hexDecode(entry.Value));
        if (word && kword && chainTableValues) {
          chainTableEntries = [...chainTableEntries, ...[{ word, kword, chainTableValues }]];
        }
      }
    };

    const uids: { word: string, dbUids: string[] }[] = chainTableEntries.reduce((acc, entry) => {
      const dbUids: string[] = Sse.getDatabaseUids(entry.kword, entry.chainTableValues).map(uid => hexEncode(uid));
      const word: string = entry.word;
      return [...acc, ...[{ word, dbUids }]];
    }, [] as { word: string, dbUids: string[] }[])

    return uids;
  };
}
