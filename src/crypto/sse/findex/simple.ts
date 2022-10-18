import { webassembly_search, webassembly_upsert } from "cosmian_findex"
import { SymmetricKey } from "../../../kms/objects/SymmetricKey"
import {
  deserializeHashMap,
  deserializeList,
  serializeHashMap,
} from "../../../utils/utils"

export class IndexedValue {
  static L_PREFIX = 108
  static W_PREFIX = 119

    bytes: Uint8Array
    constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

    static fromLocation(location: Location): IndexedValue {
        const prefix = new Uint8Array(location.bytes.length + 1)
        prefix[0] = IndexedValue.L_PREFIX
        for (let index = 0; index < location.bytes.length; index++) {
            prefix[index + 1] = location.bytes[index]
        }

        return new IndexedValue(prefix)
    }

    static fromNextWord(keyword: Keyword): IndexedValue {
        const prefix = new Uint8Array(keyword.bytes.length + 1)
        prefix[0] = IndexedValue.W_PREFIX
        for (let index = 0; index < keyword.bytes.length; index++) {
            prefix[index + 1] = keyword.bytes[index]
        }

        return new IndexedValue(prefix)
    }

    toBase64(): string {
        return Buffer.from(this.bytes).toString('base64')
    }
}

export class Location {
    bytes: Uint8Array
    constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

    static fromUtf8String(value: string): Location {
        return new Label((new TextEncoder()).encode(value))
    }
}
export class Keyword {
    bytes: Uint8Array
    constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

    static fromUtf8String(value: string): Keyword {
        return new Keyword((new TextEncoder()).encode(value))
    }

    toBase64(): string {
        return Buffer.from(this.bytes).toString('base64')
    }
}
export class FindexKey {
    bytes: Uint8Array
    constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

    toBase64(): string {
        return Buffer.from(this.bytes).toString('base64')
    }
}

export class Label {
    bytes: Uint8Array
    constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

    static fromUtf8String(label: string): Label {
        return new Label((new TextEncoder()).encode(label))
    }
}

export interface NewIndexedEntry {
    indexedValue: IndexedValue,
    keywords: Set<Keyword>,
}

export type UidsAndValues = Array<{ uid: Uint8Array, value: Uint8Array }>

export type FetchEntries = (uids: Uint8Array[]) => Promise<UidsAndValues>

export type FetchChains = (uids: Uint8Array[]) => Promise<UidsAndValues>

export type UpsertEntries = (uidsAndValues: UidsAndValues) => Promise<void>

export type UpsertChains = (uidsAndValues: UidsAndValues) => Promise<void>

/**
 * This function is responsible of the Findex-indexes creation
 *
 * @param {NewIndexedEntry[]} newIndexedEntries new entries to upsert in indexes
 * @param {FindexKey | SymmetricKey} searchKey Findex's read key
 * @param {FindexKey | SymmetricKey} updateKey Findex's write key
 * @param {Label} label public label for the index
 * @param {FetchEntries} fetchEntries callback to fetch the entries table
 * @param {UpsertEntries} upsertEntries callback to upsert inside entries table
 * @param {UpsertChains} upsertChains callback to upsert inside chains table
 */
export async function upsert(newIndexedEntries: NewIndexedEntry[], searchKey: FindexKey | SymmetricKey, updateKey: FindexKey | SymmetricKey, label: Label, fetchEntries: FetchEntries, upsertEntries: UpsertEntries, upsertChains: UpsertChains): Promise<void> {

    // convert key to a single representation
    if (searchKey instanceof SymmetricKey) {
        searchKey = new FindexKey(searchKey.bytes())
    }
    if (updateKey instanceof SymmetricKey) {
        updateKey = new FindexKey(updateKey.bytes())
    }

    const newIndexedEntriesBase64: { [key: string]: string[] } = {}
    for (const newIndexedEntry of newIndexedEntries) {
        newIndexedEntriesBase64[newIndexedEntry.indexedValue.toBase64()] = [...newIndexedEntry.keywords].map((keyword) => keyword.toBase64())
    }


    await webassembly_upsert(
        JSON.stringify({ k: updateKey.toBase64(), k_star: searchKey.toBase64() }),
        label.bytes,
        JSON.stringify(newIndexedEntriesBase64),
        async (serializedUids: Uint8Array) => {
            const uids = deserializeList(serializedUids)
            const result = await fetchEntries(uids)
            return serializeHashMap(result)
        },
        async (serializedUidsAndValues: Uint8Array) => {
            const uidsAndValues = deserializeHashMap(serializedUidsAndValues)
            await upsertEntries(uidsAndValues)
            return uidsAndValues.length
        },
        async (serializedUidsAndValues: Uint8Array) => {
            const uidsAndValues = deserializeHashMap(serializedUidsAndValues)
            await upsertChains(uidsAndValues)
            return uidsAndValues.length
        },
    )
}

/**
 * This function is used to search indexed words among Entry Table and Chain Table indexes
 *
 * @param {Set<string>} keywords words to search inside the indexes
 * @param {FindexKey | SymmetricKey} searchKey Findex's read key
 * @param {Label} label public label for the index
 * @param {number} maxResultsPerKeyword the maximum number of results per keyword
 * @param {FetchEntries} fetchEntries callback to fetch the entries table
 * @param {FetchChains} fetchChains callback to fetch the chains table
 * @returns {Promise<IndexedValue[]>} a list of `IndexedValue`
 */
export async function search(keywords: Set<string>, searchKey: FindexKey | SymmetricKey, label: Label, maxResultsPerKeyword: number, fetchEntries: FetchEntries, fetchChains: FetchChains): Promise<IndexedValue[]> {

    // convert key to a single representation
    if (searchKey instanceof SymmetricKey) {
        searchKey = new FindexKey(searchKey.bytes())
    }

    const serializedIndexedValues = await webassembly_search(
        searchKey.bytes,
        label.bytes,
        JSON.stringify([...keywords]),
        maxResultsPerKeyword,
        1000,
        () => true,
        async (serializedUids: Uint8Array) => {
            const uids = deserializeList(serializedUids)
            const result = await fetchEntries(uids)
            return serializeHashMap(result)
        },
        async (serializedUids: Uint8Array) => {
            const uids = deserializeList(serializedUids)
            const result = await fetchChains(uids)
            return serializeHashMap(result)
        },
    )

    return deserializeList(serializedIndexedValues).map((bytes) => new IndexedValue(bytes))
}
