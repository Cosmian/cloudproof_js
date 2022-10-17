import { webassembly_search, webassembly_upsert } from "cosmian_findex";
import { deserializeHashMap, deserializeList, serializeHashMap } from "utils/utils";

export class IndexedValue {
    static L_PREFIX = 108;
    static W_PREFIX = 119;

    bytes: Uint8Array;
    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    static fromLocation(location: Location): IndexedValue {
        let prefix = new Uint8Array(location.bytes.length + 1);
        prefix[0] = IndexedValue.L_PREFIX;
        for (let index = 0; index < location.bytes.length; index++) {
            prefix[index + 1] = location.bytes[index];
        }

        return new IndexedValue(prefix);
    }

    static fromNextWord(keyword: Keyword): IndexedValue {
        let prefix = new Uint8Array(keyword.bytes.length + 1);
        prefix[0] = IndexedValue.W_PREFIX;
        for (let index = 0; index < keyword.bytes.length; index++) {
            prefix[index + 1] = keyword.bytes[index];
        }

        return new IndexedValue(prefix);
    }

    toBase64(): string {
        return Buffer.from(this.bytes).toString('base64');
    }
}

export class Location {
    bytes: Uint8Array;
    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    static fromUtf8String(value: string): Location {
        return new Label((new TextEncoder()).encode(value));
    }
}
export class Keyword {
    bytes: Uint8Array;
    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    static fromUtf8String(value: string): Keyword {
        return new Keyword((new TextEncoder()).encode(value));
    }

    toBase64(): string {
        return Buffer.from(this.bytes).toString('base64');
    }
}
export class Key {
    bytes: Uint8Array;
    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    toBase64(): string {
        return Buffer.from(this.bytes).toString('base64');
    }
}

export class Label {
    bytes: Uint8Array;
    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    static fromUtf8String(label: string): Label {
        return new Label((new TextEncoder()).encode(label));
    }
}

export interface NewIndexedEntry {
    indexedValue: IndexedValue,
    keywords: Set<Keyword>,
}

export type UidsAndValues = Array<{ uid: Uint8Array, value: Uint8Array }>;

export interface FetchEntries {
    (uids: Uint8Array[]): Promise<UidsAndValues>;
}

export interface FetchChains {
    (uids: Uint8Array[]): Promise<UidsAndValues>;
}

export interface UpsertEntries {
    (uidsAndValues: UidsAndValues): Promise<void>;
}

export interface UpsertChains {
    (uidsAndValues: UidsAndValues): Promise<void>;
}

export async function upsert(newIndexedEntries: NewIndexedEntry[], searchKey: Key, updateKey: Key, label: Label, fetchEntries: FetchEntries, upsertEntries: UpsertEntries, upsertChains: UpsertChains) {
    let newIndexedEntriesBase64: { [key: string]: string[] } = {};
    for (let newIndexedEntry of newIndexedEntries) {
        newIndexedEntriesBase64[newIndexedEntry.indexedValue.toBase64()] = [...newIndexedEntry.keywords].map((keyword) => keyword.toBase64());
    }


    await webassembly_upsert(
        JSON.stringify({ k: updateKey.toBase64(), k_star: searchKey.toBase64() }),
        label.bytes,
        JSON.stringify(newIndexedEntriesBase64),
        async (serializedUids: Uint8Array) => {
            const uids = deserializeList(serializedUids);
            const result = await fetchEntries(uids);
            return serializeHashMap(result);
        },
        async (serializedUidsAndValues: Uint8Array) => {
            const uidsAndValues = deserializeHashMap(serializedUidsAndValues);
            await upsertEntries(uidsAndValues);
            return uidsAndValues.length;
        },
        async (serializedUidsAndValues: Uint8Array) => {
            const uidsAndValues = deserializeHashMap(serializedUidsAndValues);
            await upsertChains(uidsAndValues);
            return uidsAndValues.length;
        },
    );
}

export async function search(keywords: Set<string>, searchKey: Key, label: Label, maxResultsPerKeyword: number, fetchEntries: FetchEntries, fetchChains: FetchChains): Promise<IndexedValue[]> {
    let serializedIndexedValues = await webassembly_search(
        searchKey.bytes,
        label.bytes,
        JSON.stringify([...keywords]),
        maxResultsPerKeyword,
        1000,
        () => true,
        async (serializedUids: Uint8Array) => {
            const uids = deserializeList(serializedUids);
            const result = await fetchEntries(uids);
            return serializeHashMap(result);
        },
        async (serializedUids: Uint8Array) => {
            const uids = deserializeList(serializedUids);
            const result = await fetchChains(uids);
            return serializeHashMap(result);
        },
    );

    return deserializeList(serializedIndexedValues).map((bytes) => new IndexedValue(bytes));
}