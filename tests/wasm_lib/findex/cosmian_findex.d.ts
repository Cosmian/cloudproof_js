/* tslint:disable */
/* eslint-disable */
/**
* @param {string} master_keys
* @param {Uint8Array} public_label_t_bytes
* @param {string} indexed_values_and_words
* @param {Function} fetch_entry
* @param {Function} upsert_entry
* @param {Function} upsert_chain
* @returns {Promise<void>}
*/
export function webassembly_upsert(master_keys: string, public_label_t_bytes: Uint8Array, indexed_values_and_words: string, fetch_entry: Function, upsert_entry: Function, upsert_chain: Function): Promise<void>;
/**
* @param {string} master_keys
* @param {Uint8Array} public_label_t_bytes
* @param {string} words
* @param {number} loop_iteration_limit
* @param {Function} fetch_entry
* @param {Function} fetch_chain
* @returns {Promise<Uint8Array>}
*/
export function webassembly_search(master_keys: string, public_label_t_bytes: Uint8Array, words: string, loop_iteration_limit: number, fetch_entry: Function, fetch_chain: Function): Promise<Uint8Array>;
