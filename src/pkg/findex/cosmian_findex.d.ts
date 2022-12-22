/* tslint:disable */
/* eslint-disable */
/**
* See [`FindexSearch::search()`](crate::core::FindexSearch::search).
*
* # Parameters
*
* - `master_key`              : master key
* - `label_bytes`             : bytes of the public label used for hashing
* - `keywords`                : list of keyword bytes to search
* - `max_results_per_keyword` : maximum results returned for a keyword
* - `max_depth`               : maximum recursion level allowed
* - `progress`                : progress callback
* - `fetch_entries`           : callback to fetch from the Entry Table
* - `fetch_chains`            : callback to fetch from the Chain Table
* @param {Uint8Array} master_key
* @param {Uint8Array} label_bytes
* @param {Array<Uint8Array>} keywords
* @param {number} max_results_per_keyword
* @param {number} max_depth
* @param {(indexedValues: Uint8Array[]) => Promise<Boolean>} progress
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entry
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_chain
* @returns {Promise<Array<{ keyword: Uint8Array, results: Array<Uint8Array> }>>}
*/
export function webassembly_search(master_key: Uint8Array, label_bytes: Uint8Array, keywords: Array<Uint8Array>, max_results_per_keyword: number, max_depth: number, progress: (indexedValues: Uint8Array[]) => Promise<Boolean>, fetch_entry: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, fetch_chain: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>): Promise<Array<{ keyword: Uint8Array, results: Array<Uint8Array> }>>;
/**
* See [`FindexUpsert::upsert()`](crate::core::FindexUpsert::upsert).
*
* # Parameters
*
* - `master_key`                  : master key
* - `label_bytes`                 : public label used for hashing
* - `indexed_value_to_keywords`   : map of `IndexedValue`s to `Keyword` bytes
* - `fetch_entries`               : the callback to fetch from the entry table
* - `upsert_entries`              : the callback to upsert in the entry table
* - `insert_chains`               : the callback to insert in the chain table
* @param {Uint8Array} master_key
* @param {Uint8Array} label_bytes
* @param {Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>} indexed_values_to_keywords
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entry
* @param {(uidsAndValues: {uid: Uint8Array, oldValue: Uint8Array | null, newValue: Uint8Array}[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} upsert_entry
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} insert_chain
* @returns {Promise<void>}
*/
export function webassembly_upsert(master_key: Uint8Array, label_bytes: Uint8Array, indexed_values_to_keywords: Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>, fetch_entry: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entry: (uidsAndValues: {uid: Uint8Array, oldValue: Uint8Array | null, newValue: Uint8Array}[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, insert_chain: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>): Promise<void>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly webassembly_search: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly webassembly_upsert: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
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
