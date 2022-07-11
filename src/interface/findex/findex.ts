import { EntryTableUnchainedValue, Sse } from "../../crypto/sse/sse";
import { DBInterface } from "../db/dbInterface";
import { hexDecode, hexEncode } from "./../../utils/utils";

export class Findex {
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
