/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} bytes
* @returns {string}
*/
export function webassembly_hex_encode(bytes: Uint8Array): string;
/**
* Decode an hex string into a an array of bytes
* @param {string} hex
* @returns {Uint8Array}
*/
export function webassembly_hex_decode(hex: string): Uint8Array;
/**
* @param {Uint8Array} key
* @param {string} word
* @returns {Uint8Array}
*/
export function webassembly_hmac_sha256(key: Uint8Array, word: string): Uint8Array;
/**
* Unchain the entry table value in order to recover the chain table UIDs.
* While the break point is not reached, this function iterates on
* chain-table UIDs and returns the list of consecutive found UIDs.
*
* # Arguments
*
* * `word`: the break point
* * `k2`: the key used to AES256-GCM-decrypt the entry value
* * `entry_table_value`: the encrypted value matching the entry table UID. The
*   value contains the AES-nonce at the end.
* * `loop_iteration_limit`: limit parameter to avoid unexpected infinite loop
*
* # Returns a list of chain table UIDs
*
* # Errors
*
* AES256-GCM decryption can fail
* Reached number iteration
* @param {string} word
* @param {Uint8Array} k2
* @param {Uint8Array} entry_table_value
* @param {number} loop_iteration_limit
* @returns {Uint8Array}
*/
export function webassembly_unchain_entry_table_value(word: string, k2: Uint8Array, entry_table_value: Uint8Array, loop_iteration_limit: number): Uint8Array;
/**
* This WebAssembly function aims to wrap the function
* `crate::aesgcm_decrypt`: please refer to that function documentation
* @param {Uint8Array} key
* @param {Uint8Array} nonce
* @param {Uint8Array} ciphertext
* @returns {Uint8Array}
*/
export function webassembly_aesgcm_decrypt(key: Uint8Array, nonce: Uint8Array, ciphertext: Uint8Array): Uint8Array;
