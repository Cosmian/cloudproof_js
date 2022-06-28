import { Sse, EntryTableUnchainedValue } from "../../crypto/sse/sse"
import { webassembly_hex_decode as hex_decode, webassembly_hex_encode as hex_encode} from "../../../wasm_lib/sse"
import { DBInterface } from "../db/dbInterface";

export class Findex {
  public static async query(k1: string, k2: string, words: string[], db: DBInterface, loopIterationLimit: number): Promise<{ word: string; dbUids: string[]; }[]> {
    const entryTableUids:  Uint8Array[] = words.map((word: string) => Sse.computeEntryTableUid(hex_decode(k1), word));

    const entryTableValues: ({ uid: string; Value: string; } | null)[] = await db.getEntryTableEntries(entryTableUids.map(uid => hex_encode(uid)));

    const unchainedValues: (EntryTableUnchainedValue | null)[] = entryTableValues.map((entry, index) => {
      if (!entry || !entry.Value) {
        return null;
      }
      return Sse.unchainEntryTableValue(words[index], hex_decode(k2), hex_decode(entry.Value), loopIterationLimit);
    });

    let chainTableEntries: { word: string, kword: Uint8Array, chainTableValues: Uint8Array[] }[] = [];
    for (const [index, values] of unchainedValues.entries()) {
      const word = words[index];
      const kword = unchainedValues[index]?.kWord;
      if (values) {
        const chainTableEntriesStr: { uid: string; Value: string; }[] = await db.getChainTableEntries(values.chainTableUids.filter(value => value).map(uid => hex_encode(uid)))
        const chainTableValues: Uint8Array[] = chainTableEntriesStr.map(entry => hex_decode(entry.Value));
        if (word && kword && chainTableValues) {
          chainTableEntries = [...chainTableEntries, ...[{ word, kword, chainTableValues }]];
        }
      }
    };

    const uids: { word: string, dbUids: string[] }[] = chainTableEntries.reduce((acc, entry) => {
      const dbUids: string[] = Sse.getDatabaseUids(entry.kword, entry.chainTableValues).map(uid => hex_encode(uid));
      const word: string = entry.word;
      return [...acc, ...[{ word, dbUids }]];
    }, [] as { word: string, dbUids: string[] }[])

    return uids;
  };
}