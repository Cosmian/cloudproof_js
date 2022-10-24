let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_30(arg0, arg1, arg2) {
    wasm.__wbindgen_export_3(arg0, arg1, addHeapObject(arg2));
}

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
module.exports.webassembly_upsert = function(search_key, update_key, label_bytes, indexed_values_and_words, fetch_entries, upsert_entries, upsert_chains) {
    const ret = wasm.webassembly_upsert(addHeapObject(search_key), addHeapObject(update_key), addHeapObject(label_bytes), addHeapObject(indexed_values_and_words), addHeapObject(fetch_entries), addHeapObject(upsert_entries), addHeapObject(upsert_chains));
    return takeObject(ret);
};

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
module.exports.webassembly_graph_upsert = function(search_key, update_key, label_bytes, indexed_values_and_words, fetch_entries, upsert_entries, upsert_chains) {
    const ret = wasm.webassembly_graph_upsert(addHeapObject(search_key), addHeapObject(update_key), addHeapObject(label_bytes), addHeapObject(indexed_values_and_words), addHeapObject(fetch_entries), addHeapObject(upsert_entries), addHeapObject(upsert_chains));
    return takeObject(ret);
};

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
module.exports.webassembly_search = function(search_key, label_bytes, keywords, max_results_per_word, max_depth, progress, fetch_entries, fetch_chains) {
    const ret = wasm.webassembly_search(addHeapObject(search_key), addHeapObject(label_bytes), addHeapObject(keywords), max_results_per_word, max_depth, addHeapObject(progress), addHeapObject(fetch_entries), addHeapObject(fetch_chains));
    return takeObject(ret);
};

let cachedUint32Memory0 = new Uint32Array();

function getUint32Memory0() {
    if (cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* Handler for `console.log` invocations.
*
* If a test is currently running it takes the `args` array and stringifies
* it and appends it to the current output of the test. Otherwise it passes
* the arguments to the original `console.log` function, psased as
* `original`.
* @param {Array<any>} args
*/
module.exports.__wbgtest_console_log = function(args) {
    try {
        wasm.__wbgtest_console_log(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
};

/**
* Handler for `console.debug` invocations. See above.
* @param {Array<any>} args
*/
module.exports.__wbgtest_console_debug = function(args) {
    try {
        wasm.__wbgtest_console_debug(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
};

/**
* Handler for `console.info` invocations. See above.
* @param {Array<any>} args
*/
module.exports.__wbgtest_console_info = function(args) {
    try {
        wasm.__wbgtest_console_info(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
};

/**
* Handler for `console.warn` invocations. See above.
* @param {Array<any>} args
*/
module.exports.__wbgtest_console_warn = function(args) {
    try {
        wasm.__wbgtest_console_warn(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
};

/**
* Handler for `console.error` invocations. See above.
* @param {Array<any>} args
*/
module.exports.__wbgtest_console_error = function(args) {
    try {
        wasm.__wbgtest_console_error(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
};

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_5(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
function __wbg_adapter_90(arg0, arg1, arg2, arg3, arg4) {
    wasm.__wbindgen_export_6(arg0, arg1, addHeapObject(arg2), arg3, addHeapObject(arg4));
}

function __wbg_adapter_119(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_7(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
* Runtime test harness support instantiated in JS.
*
* The node.js entry script instantiates a `Context` here which is used to
* drive test execution.
*/
class WasmBindgenTestContext {

    static __wrap(ptr) {
        const obj = Object.create(WasmBindgenTestContext.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbindgentestcontext_free(ptr);
    }
    /**
    * Creates a new context ready to run tests.
    *
    * A `Context` is the main structure through which test execution is
    * coordinated, and this will collect output and results for all executed
    * tests.
    */
    constructor() {
        const ret = wasm.wasmbindgentestcontext_new();
        return WasmBindgenTestContext.__wrap(ret);
    }
    /**
    * Inform this context about runtime arguments passed to the test
    * harness.
    *
    * Eventually this will be used to support flags, but for now it's just
    * used to support test filters.
    * @param {any[]} args
    */
    args(args) {
        const ptr0 = passArrayJsValueToWasm0(args, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasmbindgentestcontext_args(this.ptr, ptr0, len0);
    }
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
    run(tests) {
        const ptr0 = passArrayJsValueToWasm0(tests, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmbindgentestcontext_run(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
}
module.exports.WasmBindgenTestContext = WasmBindgenTestContext;

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbindgen_object_clone_ref = function(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_boolean_get = function(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

module.exports.__wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

module.exports.__wbg_log_d59c74802fa44fe2 = function(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbg_String_0713d2a3d2b5f6b1 = function(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_getElementById_4c39186cc7ced742 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
};

module.exports.__wbg_settextcontent_344de5dc2a8e15ca = function(arg0, arg1, arg2) {
    getObject(arg0).textContent = getStringFromWasm0(arg1, arg2);
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_number_new = function(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

module.exports.__wbg_self_74338d9cb12c5d75 = function(arg0) {
    const ret = getObject(arg0).self;
    return addHeapObject(ret);
};

module.exports.__wbindgen_jsval_eq = function(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

module.exports.__wbg_static_accessor_document_0187e21f53c04a48 = function() {
    const ret = document;
    return addHeapObject(ret);
};

module.exports.__wbg_textcontent_46a9e23ba5cbd900 = function(arg0, arg1) {
    const ret = getObject(arg1).textContent;
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_stack_2ac21c4ea9c454f4 = function(arg0) {
    const ret = getObject(arg0).stack;
    return addHeapObject(ret);
};

module.exports.__wbg_stack_475ccfd121fab8c9 = function(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_new_abda76e883ba8a5f = function() {
    const ret = new Error();
    return addHeapObject(ret);
};

module.exports.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_export_4(arg0, arg1);
    }
};

module.exports.__wbg_randomFillSync_065afffde01daa66 = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbg_getRandomValues_b99eec4244a475bb = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

module.exports.__wbindgen_boolean_get = function(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

module.exports.__wbg_randomFillSync_065afffde01daa66 = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbg_getRandomValues_b99eec4244a475bb = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

module.exports.__wbg_process_0cc2ada8524d6f83 = function(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbg_versions_c11acceab27a6c87 = function(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

module.exports.__wbg_node_7ff1ce49caf23815 = function(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_string = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

module.exports.__wbg_static_accessor_NODE_MODULE_cf6401cc1091279e = function() {
    const ret = module;
    return addHeapObject(ret);
};

module.exports.__wbg_require_a746e79b322b9336 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_crypto_2036bed7c44c25e7 = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_a21fc88caf1ecdc8 = function(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbg_get_57245cc7d7c7619d = function(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

module.exports.__wbg_length_6e3bbe7c8bd4dbd8 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_new_1d9a920c6bfc44a8 = function() {
    const ret = new Array();
    return addHeapObject(ret);
};

module.exports.__wbg_newnoargs_b5b063fc6c2f0376 = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_next_aaef7c8aa5e212ac = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_done_1b73b0672e15f234 = function(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

module.exports.__wbg_value_1ccc36bc03462d71 = function(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

module.exports.__wbg_get_765201544a2b6869 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_call_97ae9d8645dc388b = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_new_0b9bfdd97583284e = function() {
    const ret = new Object();
    return addHeapObject(ret);
};

module.exports.__wbg_self_6d479506f72c6a71 = function() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_window_f2557cc78490aceb = function() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_globalThis_7f206bda628d5286 = function() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_global_ba75c50d1cf384f4 = function() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_from_7ce3cb27cb258569 = function(arg0) {
    const ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_forEach_ce1177df15902e0c = function(arg0, arg1, arg2) {
    try {
        var state0 = {a: arg1, b: arg2};
        var cb0 = (arg0, arg1, arg2) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_90(a, state0.b, arg0, arg1, arg2);
            } finally {
                state0.a = a;
            }
        };
        getObject(arg0).forEach(cb0);
    } finally {
        state0.a = state0.b = 0;
    }
};

module.exports.__wbg_push_740e4b286702d964 = function(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

module.exports.__wbg_entries_5e3f03f9df6bb58a = function(arg0) {
    const ret = getObject(arg0).entries();
    return addHeapObject(ret);
};

module.exports.__wbg_values_e42671acbf11ec04 = function(arg0) {
    const ret = getObject(arg0).values();
    return addHeapObject(ret);
};

module.exports.__wbg_message_fe2af63ccc8985bc = function(arg0) {
    const ret = getObject(arg0).message;
    return addHeapObject(ret);
};

module.exports.__wbg_name_48eda3ae6aa697ca = function(arg0) {
    const ret = getObject(arg0).name;
    return addHeapObject(ret);
};

module.exports.__wbg_call_168da88779e35f61 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_new_9962f939219f1820 = function(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_119(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

module.exports.__wbg_resolve_99fe17964f31ffc0 = function(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_then_11f7a54d67b4bfad = function(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_then_cedad20fbbd9418a = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

module.exports.__wbg_buffer_3f3d764d4747d564 = function(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

module.exports.__wbg_newwithbyteoffsetandlength_d9aa266703cb98be = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_new_8c3f0052272a457a = function(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_set_83db9690f9353e79 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_length_9e1ae1900cb0fbd5 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_newwithlength_f5933855e4f48a19 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_subarray_58ad4efbb5bcb886 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_set_bf3f89b92d5a34bf = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper398 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 125, __wbg_adapter_30);
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'cosmian_findex_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

