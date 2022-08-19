/* tslint:disable */
/* eslint-disable */
/**
* Generate the master authority keys for supplied Policy
*
*  - `policy_bytes` : Policy to use to generate the keys (serialized from
*    JSON)
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
export function webassembly_generate_master_keys(policy_bytes: Uint8Array): Uint8Array;
/**
* Generate a user private key.
*
* - `master_private_key_bytes`    : master private key in bytes
* - `access_policy_str`           : user access policy (boolean expression as
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
/**
* Extract header from encrypted bytes
* @param {Uint8Array} encrypted_bytes
* @returns {number}
*/
export function webassembly_get_encrypted_header_size(encrypted_bytes: Uint8Array): number;
/**
* @param {Uint8Array} metadata_bytes
* @param {Uint8Array} policy_bytes
* @param {Uint8Array} attributes_bytes
* @param {Uint8Array} public_key_bytes
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_header(metadata_bytes: Uint8Array, policy_bytes: Uint8Array, attributes_bytes: Uint8Array, public_key_bytes: Uint8Array): Uint8Array;
/**
* Decrypt with a user decryption key an encrypted header
* of a resource encrypted using an hybrid crypto scheme.
* @param {Uint8Array} user_decryption_key_bytes
* @param {Uint8Array} encrypted_header_bytes
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_header(user_decryption_key_bytes: Uint8Array, encrypted_header_bytes: Uint8Array): Uint8Array;
/**
* Symmetrically Encrypt plaintext data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array | undefined} uid_bytes
* @param {number | undefined} block_number
* @param {Uint8Array} plaintext_bytes
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_block(symmetric_key_bytes: Uint8Array, uid_bytes: Uint8Array | undefined, block_number: number | undefined, plaintext_bytes: Uint8Array): Uint8Array;
/**
* Symmetrically Decrypt encrypted data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array | undefined} uid_bytes
* @param {number | undefined} block_number
* @param {Uint8Array} encrypted_bytes
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_block(symmetric_key_bytes: Uint8Array, uid_bytes: Uint8Array | undefined, block_number: number | undefined, encrypted_bytes: Uint8Array): Uint8Array;
