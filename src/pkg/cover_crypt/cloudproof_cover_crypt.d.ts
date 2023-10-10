/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} policy_bytes
* @param {string} access_policy
* @param {Uint8Array} public_key_bytes
* @param {Uint8Array} header_metadata
* @param {Uint8Array} authentication_data
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_header(policy_bytes: Uint8Array, access_policy: string, public_key_bytes: Uint8Array, header_metadata: Uint8Array, authentication_data: Uint8Array): Uint8Array;
/**
* Decrypt with a user decryption key an encrypted header
* of a resource encrypted using an hybrid crypto scheme.
* @param {Uint8Array} usk_bytes
* @param {Uint8Array} encrypted_header_bytes
* @param {Uint8Array} authentication_data
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_header(usk_bytes: Uint8Array, encrypted_header_bytes: Uint8Array, authentication_data: Uint8Array): Uint8Array;
/**
* Symmetrically Encrypt plaintext data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array} plaintext_bytes
* @param {Uint8Array} authentication_data
* @returns {Uint8Array}
*/
export function webassembly_encrypt_symmetric_block(symmetric_key_bytes: Uint8Array, plaintext_bytes: Uint8Array, authentication_data: Uint8Array): Uint8Array;
/**
* Symmetrically Decrypt encrypted data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array} encrypted_bytes
* @param {Uint8Array} authentication_data
* @returns {Uint8Array}
*/
export function webassembly_decrypt_symmetric_block(symmetric_key_bytes: Uint8Array, encrypted_bytes: Uint8Array, authentication_data: Uint8Array): Uint8Array;
/**
* Generates both a encrypted header and a DEM encryption of the `plaintext`,
* with the header metadata as associated data.
*
* - `metadata_bytes`      : serialized metadata
* - `policy_bytes`        : serialized policy
* - `attribute_bytes`     : serialized attributes to use in the encapsulation
* - `pk`                  : CoverCrypt public key
* - `plaintext`           : message to encrypt with the DEM
* - `header_metadata`     : additional data to symmetrically encrypt in the
*   header
* - `authentication_data` : optional data used for authentication
* @param {Uint8Array} policy_bytes
* @param {string} access_policy
* @param {Uint8Array} pk
* @param {Uint8Array} plaintext
* @param {Uint8Array} header_metadata
* @param {Uint8Array} authentication_data
* @returns {Uint8Array}
*/
export function webassembly_hybrid_encrypt(policy_bytes: Uint8Array, access_policy: string, pk: Uint8Array, plaintext: Uint8Array, header_metadata: Uint8Array, authentication_data: Uint8Array): Uint8Array;
/**
* Decrypt the DEM ciphertext with the header encapsulated symmetric key,
* with the header metadata as associated data.
*
* - `usk_bytes`           : serialized user secret key
* - `encrypted_bytes`     : concatenation of the encrypted header and the DEM
*   ciphertext
* - `authentication_data` : optional data used for authentication
*
* Return the decrypted data (additional data in header and cleartext) as a
* binary format: 1. LEB128 length of the additional data bytes
* 2. additional data bytes
* 3. cleartext bytes
* @param {Uint8Array} usk_bytes
* @param {Uint8Array} encrypted_bytes
* @param {Uint8Array} authentication_data
* @returns {Uint8Array}
*/
export function webassembly_hybrid_decrypt(usk_bytes: Uint8Array, encrypted_bytes: Uint8Array, authentication_data: Uint8Array): Uint8Array;
/**
* @param {string} name
* @param {({name: string, isHybridized: boolean})[]} attribute_properties
* @param {boolean} is_hierarchical
* @returns {string}
*/
export function webassembly_policy_axis(name: string, attribute_properties: ({name: string, isHybridized: boolean})[], is_hierarchical: boolean): string;
/**
* @param {number} nb_creations
* @returns {Uint8Array}
*/
export function webassembly_policy(nb_creations: number): Uint8Array;
/**
* @param {Uint8Array} policy
* @param {string} axis
* @returns {Uint8Array}
*/
export function webassembly_add_axis(policy: Uint8Array, axis: string): Uint8Array;
/**
* Rotates attributes, changing their underlying values with that of an unused
* slot
*
* - `attributes`  : user access policy (boolean expression as string)
* - `policy`      : global policy data (bytes)
*
* Returns the `rotated` policy
* @param {Array<string>} attributes
* @param {Uint8Array} policy
* @returns {Uint8Array}
*/
export function webassembly_rotate_attributes(attributes: Array<string>, policy: Uint8Array): Uint8Array;
/**
* Generate the master authority keys for supplied Policy
*
* - `policy`  : global policy data (JSON)
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
export function webassembly_generate_master_keys(policy_bytes: Uint8Array): Uint8Array;
/**
* Generate a user secret key.
*
* - `msk_bytes`           : master secret key in bytes
* - `access_policy_str`   : user access policy (boolean expression as string)
* - `policy`              : global policy data (JSON)
* @param {Uint8Array} msk_bytes
* @param {string} access_policy_str
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
export function webassembly_generate_user_secret_key(msk_bytes: Uint8Array, access_policy_str: string, policy_bytes: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly webassembly_encrypt_hybrid_header: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly webassembly_decrypt_hybrid_header: (a: number, b: number, c: number, d: number) => void;
  readonly webassembly_encrypt_symmetric_block: (a: number, b: number, c: number, d: number) => void;
  readonly webassembly_decrypt_symmetric_block: (a: number, b: number, c: number, d: number) => void;
  readonly webassembly_hybrid_encrypt: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly webassembly_hybrid_decrypt: (a: number, b: number, c: number, d: number) => void;
  readonly webassembly_policy_axis: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly webassembly_policy: (a: number, b: number) => void;
  readonly webassembly_add_axis: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly webassembly_rotate_attributes: (a: number, b: number, c: number, d: number) => void;
  readonly webassembly_generate_master_keys: (a: number, b: number, c: number) => void;
  readonly webassembly_generate_user_secret_key: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_2: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_3: (a: number) => void;
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
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
