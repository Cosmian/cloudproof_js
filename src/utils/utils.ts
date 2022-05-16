/**
 * Hex encode an array of bytes
 * @param array the bytes
 * @returns the hex encoded string
 */
export function hexEncode(array: Uint8Array): string {
    return array.reduce((prev, current) => {
        return prev + current.toString(16).padStart(2,'0')
    }, "")

}

/**
 * Hex decode to an array of bytes
 * @param hexString the hex encoded string
 * @returns the decoded array of bytes
 */
export function hexDecode(hexString: string): Uint8Array {
    return new Uint8Array(hexString.split(/(\w\w)/g)
        .filter(p => !!p)
        .map(c => parseInt(c, 16)))

    // The regex passed to split captures groups of two characters,
    // but this form of split will intersperse them with empty strings
    // (the stuff "between" the captured groups, which is nothing!).
    // So filter is used to remove the empty strings
}

/**
 * Convert a u32 represented as a 4-bytes value in big endian to a u32 value
 *
 * @param bytes this a 4-bytes value representing an u32 in big endian
 * @returns the u32 value
 */
export function fromBeBytes(bytes: Uint8Array): number {
    // Create a buffer
    const buf = new ArrayBuffer(4);
    // Create a data view of it
    const view = new DataView(buf);
    // set bytes
    bytes.forEach((b, i) => {
        view.setUint8(i, b);
    });

    // Read the bits as a float; note that by doing this, we're implicitly
    // converting it from a 32-bit float into JavaScript's native 64-bit double
    return view.getUint32(0);
}

/**
 * Convert a u32 value to a u32 represented as a 4-bytes value in big endian
 *
 * @param myNumber a u32 value
 * @returns the u32 represented as a 4-bytes value in big endian
 */
export function toBeBytes(myNumber: number): Uint8Array {
    // Convert symmetric key length to 4-bytes array
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, myNumber, false);
    return new Uint8Array(arr, 0)
}
