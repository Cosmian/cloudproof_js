/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_chains
* @returns {Promise<void>}
*/
export function webassembly_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entries: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>, upsert_chains: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>): Promise<void>;
/**
* @param {Uint8Array} search_key
* @param {Uint8Array} update_key
* @param {Uint8Array} label_bytes
* @param {Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>} indexed_values_and_words
* @param {(uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>} fetch_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_entries
* @param {(uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>} upsert_chains
* @returns {Promise<void>}
*/
export function webassembly_graph_upsert(search_key: Uint8Array, update_key: Uint8Array, label_bytes: Uint8Array, indexed_values_and_words: Array<{indexedValue: Uint8Array, keywords: Uint8Array[]}>, fetch_entries: (uids: Uint8Array[]) => Promise<{uid: Uint8Array, value: Uint8Array}[]>, upsert_entries: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>, upsert_chains: (uidsAndValues: {uid: Uint8Array, value: Uint8Array}[]) => Promise<void>): Promise<void>;
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
