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
* - `attributes_bytes`    : user access policy (boolean expression as string)
* - `policy_bytes`        : global policy (serialized from JSON)
* @param {Uint8Array} attributes_bytes
* @param {Uint8Array} policy_bytes
* @returns {string}
*/
export function webassembly_rotate_attributes(attributes_bytes: Uint8Array, policy_bytes: Uint8Array): string;
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
* @param {Uint8Array} usk_bytes
* @param {Uint8Array} encrypted_header_bytes
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_header(usk_bytes: Uint8Array, encrypted_header_bytes: Uint8Array): Uint8Array;
/**
* Symmetrically Encrypt plaintext data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array} plaintext_bytes
* @param {Uint8Array} associated_data
* @returns {Uint8Array}
*/
export function webassembly_encrypt_symmetric_block(symmetric_key_bytes: Uint8Array, plaintext_bytes: Uint8Array, associated_data: Uint8Array): Uint8Array;
/**
* Symmetrically Decrypt encrypted data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array} encrypted_bytes
* @param {Uint8Array} associated_data
* @returns {Uint8Array}
*/
export function webassembly_decrypt_symmetric_block(symmetric_key_bytes: Uint8Array, encrypted_bytes: Uint8Array, associated_data: Uint8Array): Uint8Array;
/**
* Generates both a encrypted header and a DEM encryption of the `plaintext`,
* with the header metadata as associated data.
*
* - `metadata_bytes`  : serialized metadata
* - `policy_bytes`    : serialized policy
* - `attribute_bytes` : serialized attributes to use in the encapsulation
* - `pk`              : CoverCrypt public key
* - `plaintext`       : message to encrypt with the DEM
* @param {Uint8Array} metadata_bytes
* @param {Uint8Array} policy_bytes
* @param {Uint8Array} attributes_bytes
* @param {Uint8Array} pk
* @param {Uint8Array} plaintext
* @returns {Uint8Array}
*/
export function webassembly_hybrid_encrypt(metadata_bytes: Uint8Array, policy_bytes: Uint8Array, attributes_bytes: Uint8Array, pk: Uint8Array, plaintext: Uint8Array): Uint8Array;
/**
* Decrypt the DEM ciphertext with the header encapsulated symmetric key,
* with the header metadata as associated data.
*
* - `usk_bytes`       : serialized user private key
* - `encrypted_bytes` : concatenation of the encrypted header and the DEM ciphertext
* @param {Uint8Array} usk_bytes
* @param {Uint8Array} encrypted_bytes
* @returns {Uint8Array}
*/
export function webassembly_hybrid_decrypt(usk_bytes: Uint8Array, encrypted_bytes: Uint8Array): Uint8Array;
