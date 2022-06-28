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
* Handler for `console.log` invocations.
*
* If a test is currently running it takes the `args` array and stringifies
* it and appends it to the current output of the test. Otherwise it passes
* the arguments to the original `console.log` function, psased as
* `original`.
* @param {Array<any>} args
*/
export function __wbgtest_console_log(args: Array<any>): void;
/**
* Handler for `console.debug` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_debug(args: Array<any>): void;
/**
* Handler for `console.info` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_info(args: Array<any>): void;
/**
* Handler for `console.warn` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_warn(args: Array<any>): void;
/**
* Handler for `console.error` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_error(args: Array<any>): void;
/**
* Runtime test harness support instantiated in JS.
*
* The node.js entry script instantiates a `Context` here which is used to
* drive test execution.
*/
export class WasmBindgenTestContext {
  free(): void;
/**
* Creates a new context ready to run tests.
*
* A `Context` is the main structure through which test execution is
* coordinated, and this will collect output and results for all executed
* tests.
*/
  constructor();
/**
* Inform this context about runtime arguments passed to the test
* harness.
*
* Eventually this will be used to support flags, but for now it's just
* used to support test filters.
* @param {any[]} args
*/
  args(args: any[]): void;
/**
* Executes a list of tests, returning a promise representing their
* eventual completion.
*
* This is the main entry point for executing tests. All the tests passed
* in are the JS `Function` object that was plucked off the
* `WebAssembly.Instance` exports list.
*
* The promise returned resolves to either `true` if all tests passed or
* `false` if at least one test failed.
* @param {any[]} tests
* @returns {Promise<any>}
*/
  run(tests: any[]): Promise<any>;
}
