/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {string} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_chains
* @returns {Promise<void>}
*/
export function webassembly_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: string, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entries: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>, upsert_chains: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>): Promise<void>;
/**
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {string} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_chains
* @returns {Promise<void>}
*/
export function webassembly_graph_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: string, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entries: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>, upsert_chains: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>): Promise<void>;
/**
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
