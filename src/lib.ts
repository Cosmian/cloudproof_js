
/**
 * Hex encode an array of bytes
 * @param array the bytes
 * @returns the hex encoded string
 */
export function hexEncode(array: Uint8Array): string {
    return array.reduce((prev, current) => {
        return prev + current.toString(16)
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