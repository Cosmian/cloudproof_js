/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {string} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {Function} upsert_entry
* @param {Function} upsert_chain
* @returns {Promise<void>}
*/
export function webassembly_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: string, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entry: Function, upsert_chain: Function): Promise<void>;
/**
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {string} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {Function} upsert_entry
* @param {Function} upsert_chain
* @returns {Promise<void>}
*/
export function webassembly_graph_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: string, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entry: Function, upsert_chain: Function): Promise<void>;
/**
* @param {Uint8Array} search_key
* @param {Uint8Array} label_bytes
* @param {Array<Uint8Array>} keywords
* @param {number} max_results_per_word
* @param {number} max_depth
* @param {Function} progress
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {Function} fetch_chain
* @returns {Promise<Uint8Array>}
*/
export function webassembly_search(search_key: Uint8Array, label_bytes: Uint8Array, keywords: Array<Uint8Array>, max_results_per_word: number, max_depth: number, progress: Function, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, fetch_chain: Function): Promise<Uint8Array>;
