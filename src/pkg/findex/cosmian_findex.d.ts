/* tslint:disable */
/* eslint-disable */
/**
* Upsert a map of IndexedValue -> [Keywords] in the encrypted index
*
* # Parameters
* - `search_key`  : the search key (a.k.a `k`) bytes
* - `update_key`  : the update key (a.k.a `k*`) bytes
* - `label`       : the public label bytes
* - `indexed_values_and_words`: a map of IndexedValues bytes to their indexed
*   keywords bytes
* - `fetch_entries` : the callback to fetch from the entry table
* - `upsert_entries`: the callback to insert/update in the entry table
* - `upsert_chains` : the callback to insert/update in the chain table
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_chains
* @returns {Promise<void>}
*/
export function webassembly_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entries: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>, upsert_chains: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>): Promise<void>;
/**
* Build the graph of a `Word` and upsert it.
*
* A graph is built with the sub-words starting from 3 letters.
* If the `Word` is smaller than 3, the graph
* will be empty.
*
* Graph example for `robert`: `rob` -> `robe` -> `rober` -> `robert`
*
* *Note*: the `Location` associated to the `Word` needs to be upserted
* using a regular upsert.
*
* # Parameters
* - `search_key`  : the search key (a.k.a `k`) bytes
* - `update_key`  : the update key (a.k.a `k*`) bytes
* - `label`       : the public label bytes
* - `indexed_values_and_words`: a map of IndexedValues bytes to their indexed
*   keywords bytes
* - `fetch_entries` : the callback to fetch from the entry table
* - `upsert_entries`: the callback to insert/update in the entry table
* - `upsert_chains` : the callback to insert/update in the chain table
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_chains
* @returns {Promise<void>}
*/
export function webassembly_graph_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entries: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>, upsert_chains: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>): Promise<void>;
/**
* Search Keywords in the index, returning a list of IndexedValues
*
* # Parameters
* - `search_key`    : the search key (a.k.a `k`) bytes
* - `label`         : the public label bytes
* - `keywords`      : a list of keyword (bytes) to search
* - `max_results_per_word`: the maximum results returned for a keyword
* - `max_depth`: the maximum depth the search graph will be walked
* - `progress` : the progress callback called as a graph is walked; returning
*   `false` stops the walk
* - `fetch_entries` : the callback to fetch from the entry table
* - `fetch_chains` : the callback to fetch from the chain table
* @param {Uint8Array} search_key
* @param {Uint8Array} label_bytes
* @param {Array<Uint8Array>} keywords
* @param {number} max_results_per_word
* @param {number} max_depth
* @param {(indexedValues: Uint8Array[]) => Promise<Boolean>} progress
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_chains
* @returns {Promise<Array<Uint8Array>>}
*/
export function webassembly_search(search_key: Uint8Array, label_bytes: Uint8Array, keywords: Array<Uint8Array>, max_results_per_word: number, max_depth: number, progress: (indexedValues: Uint8Array[]) => Promise<Boolean>, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, fetch_chains: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>): Promise<Array<Uint8Array>>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly webassembly_upsert: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly webassembly_graph_upsert: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly webassembly_search: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly __wbindgen_export_0: (a: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: (a: number) => void;
  readonly __wbindgen_export_5: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
