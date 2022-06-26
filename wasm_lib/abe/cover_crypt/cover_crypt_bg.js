import * as wasm from './cover_crypt_bg.wasm';

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

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
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

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
* Generate the master authority keys for supplied Policy
*
*  - `policy_bytes` : Policy to use to generate the keys (serialized from
*    JSON)
* @param {Uint8Array} policy_bytes
* @returns {Uint8Array}
*/
export function webassembly_generate_master_keys(policy_bytes) {
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
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

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
export function webassembly_generate_user_private_key(master_private_key_bytes, access_policy_str, policy_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(access_policy_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.webassembly_generate_user_private_key(retptr, addHeapObject(master_private_key_bytes), ptr0, len0, addHeapObject(policy_bytes));
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
}

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
export function webassembly_rotate_attributes(attributes_bytes, policy_bytes) {
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
        wasm.__wbindgen_free(ptr0, len0);
    }
}

/**
* Extract header from encrypted bytes
* @param {Uint8Array} encrypted_bytes
* @returns {number}
*/
export function webassembly_get_encrypted_header_size(encrypted_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_get_encrypted_header_size(retptr, addHeapObject(encrypted_bytes));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return r0 >>> 0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* @param {Uint8Array} metadata_bytes
* @param {Uint8Array} policy_bytes
* @param {Uint8Array} attributes_bytes
* @param {Uint8Array} public_key_bytes
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_header(metadata_bytes, policy_bytes, attributes_bytes, public_key_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_encrypt_hybrid_header(retptr, addHeapObject(metadata_bytes), addHeapObject(policy_bytes), addHeapObject(attributes_bytes), addHeapObject(public_key_bytes));
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
}

/**
* Decrypt with a user decryption key an encrypted header
* of a resource encrypted using an hybrid crypto scheme.
* @param {Uint8Array} user_decryption_key_bytes
* @param {Uint8Array} encrypted_header_bytes
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_header(user_decryption_key_bytes, encrypted_header_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_decrypt_hybrid_header(retptr, addHeapObject(user_decryption_key_bytes), addHeapObject(encrypted_header_bytes));
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
}

function isLikeNone(x) {
    return x === undefined || x === null;
}
/**
* Symmetrically Encrypt plaintext data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array | undefined} uid_bytes
* @param {number | undefined} block_number
* @param {Uint8Array} plaintext_bytes
* @returns {Uint8Array}
*/
export function webassembly_encrypt_hybrid_block(symmetric_key_bytes, uid_bytes, block_number, plaintext_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_encrypt_hybrid_block(retptr, addHeapObject(symmetric_key_bytes), isLikeNone(uid_bytes) ? 0 : addHeapObject(uid_bytes), !isLikeNone(block_number), isLikeNone(block_number) ? 0 : block_number, addHeapObject(plaintext_bytes));
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
}

/**
* Symmetrically Decrypt encrypted data in a block.
* @param {Uint8Array} symmetric_key_bytes
* @param {Uint8Array | undefined} uid_bytes
* @param {number | undefined} block_number
* @param {Uint8Array} encrypted_bytes
* @returns {Uint8Array}
*/
export function webassembly_decrypt_hybrid_block(symmetric_key_bytes, uid_bytes, block_number, encrypted_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.webassembly_decrypt_hybrid_block(retptr, addHeapObject(symmetric_key_bytes), isLikeNone(uid_bytes) ? 0 : addHeapObject(uid_bytes), !isLikeNone(block_number), isLikeNone(block_number) ? 0 : block_number, addHeapObject(encrypted_bytes));
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
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_654a7797990fb8db() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_getRandomValues_fb6b088efb6bead2() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_process_70251ed1291754d5(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_versions_b23f2588cdb2ddbb(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_61b8c9a82499895d(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_static_accessor_NODE_MODULE_33b45247c55045b0() {
    const ret = module;
    return addHeapObject(ret);
};

export function __wbg_require_2a93bc09fee45aca() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_crypto_2f56257a38275dbd(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_msCrypto_d07655bf62361f21(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_newnoargs_e23b458e372830de(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_ae78342adc33730a() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_self_99737b4dcdf6f0d8() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_9b61fbbf3564c4fb() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_8e275ef40caea3a3() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_5de1e0f82bddcd27() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_buffer_7af23f65f6c64548(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_ce1e75f0ce5f7974(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_cc9018bd6f283b6f(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_f25e869e4565d2a2(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_0acb1cf9bbaf8519(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithlength_8f0657faca9f1422(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_da527dbd24eafb6b(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

