/* tslint:disable */
/* eslint-disable */
/**
* Encrypt with the public key a symmetric key
* @param {Uint8Array} policy_bytes
* @param {Uint8Array} public_key_bytes
* @param {string} attributes_str
* @param {Uint8Array} uid_bytes
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_header(policy_bytes: Uint8Array, public_key_bytes: Uint8Array, attributes_str: string, uid_bytes: Uint8Array): Uint8Array;
/**
* Prepare encryption cache (avoiding public key deserialization)
* @param {Uint8Array} policy_bytes
* @param {Uint8Array} public_key
* @returns {number}
*/
export function webassembly_create_encryption_cache(policy_bytes: Uint8Array, public_key: Uint8Array): number;
/**
* @param {number} cache_handle
*/
export function webassembly_destroy_encryption_cache(cache_handle: number): void;
/**
* Encrypt symmetric key
* @param {number} cache_handle
* @param {string} attributes_str
* @param {Uint8Array} uid_bytes
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_header_using_cache(cache_handle: number, attributes_str: string, uid_bytes: Uint8Array): Uint8Array;
/**
* Symmetrically Decrypt encrypted data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array | undefined} uid_bytes
* @param {number | undefined} block_number
* @param {Uint8Array} data_bytes
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_block(symmetric_key_bytes: Uint8Array, uid_bytes: Uint8Array | undefined, block_number: number | undefined, data_bytes: Uint8Array): Uint8Array;
/**
* Extract header from encrypted bytes
* @param {Uint8Array} encrypted_bytes
* @returns {number}
*/
export function webassembly_get_encrypted_header_size(encrypted_bytes: Uint8Array): number;
/**
* Decrypt with a user decryption key an encrypted header
* of a resource encrypted using an hybrid crypto scheme.
* @param {Uint8Array} user_decryption_key_bytes
* @param {Uint8Array} encrypted_header_bytes
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_header(user_decryption_key_bytes: Uint8Array, encrypted_header_bytes: Uint8Array): Uint8Array;
/**
* Prepare decryption cache (avoiding user decryption key deserialization)
* @param {Uint8Array} user_decryption_key
* @returns {number}
*/
export function webassembly_create_decryption_cache(user_decryption_key: Uint8Array): number;
/**
* @param {number} cache_handle
*/
export function webassembly_destroy_decryption_cache(cache_handle: number): void;
/**
* Decrypt ABE header
* @param {number} cache_handle
* @param {Uint8Array} encrypted_header
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_header_using_cache(cache_handle: number, encrypted_header: Uint8Array): Uint8Array;
/**
* Symmetrically Decrypt encrypted data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array | undefined} uid_bytes
* @param {number | undefined} block_number
* @param {Uint8Array} encrypted_bytes
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_block(symmetric_key_bytes: Uint8Array, uid_bytes: Uint8Array | undefined, block_number: number | undefined, encrypted_bytes: Uint8Array): Uint8Array;
/**
* Generate the master authority keys for supplied Policy
*
*  - `policy` : Policy to use to generate the keys (serialized from JSON)
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
export function webassembly_generate_master_keys(policy_bytes: Uint8Array): Uint8Array;
/**
* Generate a user private key.
*
* - `master_private_key_bytes`    : master private key in bytes
* - `access_policy`               : user access policy (boolean expression as
*   string)
* - `policy_bytes`                : global policy (serialized from JSON)
* @param {Uint8Array} master_private_key_bytes
* @param {string} access_policy_str
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
export function webassembly_generate_user_private_key(master_private_key_bytes: Uint8Array, access_policy_str: string, policy_bytes: Uint8Array): Uint8Array;
/**
* Rotate attributes, changing their underlying values with that of an unused
* slot
*
* - `attributes_bytes`           : user access policy (boolean expression as
*   string)
* - `policy_bytes`                : global policy (serialized from JSON)
* @param {Uint8Array} attributes_bytes
* @param {Uint8Array} policy_bytes
* @returns {string}
*/
export function webassembly_rotate_attributes(attributes_bytes: Uint8Array, policy_bytes: Uint8Array): string;
