"use strict";
exports.__esModule = true;
exports.hexDecode = exports.hexEncode = void 0;
/**
 * Hex encode an array of bytes
 * @param array the bytes
 * @returns the hex encoded string
 */
function hexEncode(array) {
    return array.reduce(function (prev, current) {
        return prev + current.toString(16);
    }, "");
}
exports.hexEncode = hexEncode;
/**
 * Hex decode to an array of bytes
 * @param hexString the hex encoded string
 * @returns the decoded array of bytes
 */
function hexDecode(hexString) {
    return new Uint8Array(hexString.split(/(\w\w)/g)
        .filter(function (p) { return !!p; })
        .map(function (c) { return parseInt(c, 16); }));
    // The regex passed to split captures groups of two characters, 
    // but this form of split will intersperse them with empty strings 
    // (the stuff "between" the captured groups, which is nothing!).
    // So filter is used to remove the empty strings
}
exports.hexDecode = hexDecode;
