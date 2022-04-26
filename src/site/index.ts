import * as lib from "../lib"


/**
 * Hex Encode a string
 * @param s the string to encode
 * @returns the hex encoding of th UTF-8 bytes of the string
 */
function hexEncodeString(s: string): string {
	return lib.hexEncode(new TextEncoder().encode(s))
}

/**
 * Hex decode an hex string
 * @param hex the hex string
 * @returns the string from the utf-8 decoded bytes of the hex string
 */
function hexDecodeString(hex: string): string {
	return new TextDecoder().decode(lib.hexDecode(hex).buffer)
}


// expose the functions to the DOM / HTML
(window as any).hexEncodeString = hexEncodeString;
(window as any).hexDecodeString = hexDecodeString
