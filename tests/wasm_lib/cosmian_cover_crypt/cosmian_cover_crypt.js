let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

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

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

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

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
* Generate the master authority keys for supplied Policy
*
*  - `policy_bytes` : Policy to use to generate the keys (serialized from JSON)
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
module.exports.webassembly_generate_master_keys = function(policy_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_generate_master_keys(retptr, addHeapObject(policy_bytes));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

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
/**
* Generate a user secret key.
*
* - `msk_bytes`           : master secret key in bytes
* - `access_policy_str`   : user access policy (boolean expression as string)
* - `policy_bytes`        : global policy (serialized from JSON)
* @param {Uint8Array} msk_bytes
* @param {string} access_policy_str
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
module.exports.webassembly_generate_user_secret_key = function(msk_bytes, access_policy_str, policy_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(access_policy_str, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.webassembly_generate_user_secret_key(retptr, addHeapObject(msk_bytes), ptr0, len0, addHeapObject(policy_bytes));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

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
module.exports.webassembly_rotate_attributes = function(attributes_bytes, policy_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_rotate_attributes(retptr, addHeapObject(attributes_bytes), addHeapObject(policy_bytes));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr0 = r0;
        var len0 = r1;
        if (r3) {
            ptr0 = 0; len0 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr0, len0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_2(ptr0, len0);
    }
};

/**
* Converts a boolean expression containing an access policy
* into a JSON access policy which can be used in Vendor Attributes
* @param {string} boolean_expression
* @returns {string}
*/
module.exports.webassembly_parse_boolean_access_policy = function(boolean_expression) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(boolean_expression, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.webassembly_parse_boolean_access_policy(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr1 = r0;
        var len1 = r1;
        if (r3) {
            ptr1 = 0; len1 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_2(ptr1, len1);
    }
};

/**
* @param {Uint8Array} policy_bytes
* @param {string} access_policy
* @param {Uint8Array} public_key_bytes
* @param {Uint8Array} additional_data
* @param {Uint8Array} authenticated_data
* @returns {Uint8Array}
*/
module.exports.webassembly_encrypt_hybrid_header = function(policy_bytes, access_policy, public_key_bytes, additional_data, authenticated_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(access_policy, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.webassembly_encrypt_hybrid_header(retptr, addHeapObject(policy_bytes), ptr0, len0, addHeapObject(public_key_bytes), addHeapObject(additional_data), addHeapObject(authenticated_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* Decrypt with a user decryption key an encrypted header
* of a resource encrypted using an hybrid crypto scheme.
* @param {Uint8Array} usk_bytes
* @param {Uint8Array} encrypted_header_bytes
* @param {Uint8Array} authenticated_data
* @returns {Uint8Array}
*/
module.exports.webassembly_decrypt_hybrid_header = function(usk_bytes, encrypted_header_bytes, authenticated_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_decrypt_hybrid_header(retptr, addHeapObject(usk_bytes), addHeapObject(encrypted_header_bytes), addHeapObject(authenticated_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* Symmetrically Encrypt plaintext data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array} plaintext_bytes
* @param {Uint8Array} authenticated_data
* @returns {Uint8Array}
*/
module.exports.webassembly_encrypt_symmetric_block = function(symmetric_key_bytes, plaintext_bytes, authenticated_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_encrypt_symmetric_block(retptr, addHeapObject(symmetric_key_bytes), addHeapObject(plaintext_bytes), addHeapObject(authenticated_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* Symmetrically Decrypt encrypted data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array} encrypted_bytes
* @param {Uint8Array} authenticated_data
* @returns {Uint8Array}
*/
module.exports.webassembly_decrypt_symmetric_block = function(symmetric_key_bytes, encrypted_bytes, authenticated_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_decrypt_symmetric_block(retptr, addHeapObject(symmetric_key_bytes), addHeapObject(encrypted_bytes), addHeapObject(authenticated_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* Generates both a encrypted header and a DEM encryption of the `plaintext`,
* with the header metadata as associated data.
*
* - `metadata_bytes`      : serialized metadata
* - `policy_bytes`        : serialized policy
* - `attribute_bytes`     : serialized attributes to use in the encapsulation
* - `pk`                  : CoverCrypt public key
* - `plaintext`           : message to encrypt with the DEM
* - `additional_data`     : additional data to symmetrically encrypt in the header
* - `autenticated_data`   : data authenticated with the symmetric encryption
* @param {Uint8Array} policy_bytes
* @param {string} access_policy
* @param {Uint8Array} pk
* @param {Uint8Array} plaintext
* @param {Uint8Array} additional_data
* @param {Uint8Array} authenticated_data
* @returns {Uint8Array}
*/
module.exports.webassembly_hybrid_encrypt = function(policy_bytes, access_policy, pk, plaintext, additional_data, authenticated_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(access_policy, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.webassembly_hybrid_encrypt(retptr, addHeapObject(policy_bytes), ptr0, len0, addHeapObject(pk), addHeapObject(plaintext), addHeapObject(additional_data), addHeapObject(authenticated_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* Decrypt the DEM ciphertext with the header encapsulated symmetric key,
* with the header metadata as associated data.
*
* - `usk_bytes`           : serialized user secret key
* - `encrypted_bytes`     : concatenation of the encrypted header and the DEM ciphertext
* - `autenticated_data`   : data authenticated with the symmetric encryption
* @param {Uint8Array} usk_bytes
* @param {Uint8Array} encrypted_bytes
* @param {Uint8Array} authenticated_data
* @returns {Uint8Array}
*/
module.exports.webassembly_hybrid_decrypt = function(usk_bytes, encrypted_bytes, authenticated_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_hybrid_decrypt(retptr, addHeapObject(usk_bytes), addHeapObject(encrypted_bytes), addHeapObject(authenticated_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_3(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbindgen_is_null = function(arg0) {
    const ret = getObject(arg0) === null;
    return ret;
};

module.exports.__wbg_randomFillSync_6894564c2c334c42 = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbg_getRandomValues_805f1c3d65988a5a = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

module.exports.__wbg_crypto_e1d53a1d73fb10b8 = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbg_process_038c26bf42b093f8 = function(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

module.exports.__wbg_versions_ab37218d2f0b24a8 = function(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

module.exports.__wbg_node_080f4b19d15bc1fe = function(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_string = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

module.exports.__wbg_msCrypto_6e7d3e1f92610cbb = function(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbg_require_78a3dcfbdba9cbce = function() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_function = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

module.exports.__wbg_newnoargs_b5b063fc6c2f0376 = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_call_97ae9d8645dc388b = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_object_clone_ref = function(arg0) {
    const ret = getObject(arg0);
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

module.exports.__wbg_call_168da88779e35f61 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

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

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'cosmian_cover_crypt_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;
