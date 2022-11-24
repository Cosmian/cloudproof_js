// Copy/paste from https://www.npmjs.com/package/leb128

/**
 * decodes a LEB128 encoded unsigned interger
 *
 * @param buffer the buffer of bytes to read
 * @returns the decoded number
 */
export function decode(buffer: Uint8Array): number {
  let result = 0
  let shift = 0
  for (const byte of buffer) {
    result |= (byte & 0x7f) << shift
    if ((0x80 & byte) === 0) break
    shift += 7
  }

  return result
}

/**
 * encodes an unsigned integer to LEB128
 *
 * @param value the unsigned integer
 * @returns the LEB128 bytes
 */
export function encode(value: number): Uint8Array {
  const result = [];

  while (value !== 0) {
    let byte_ = value & 0x7f;
    value >>= 7;
    if (value !== 0) {
      byte_ = byte_ | 0x80;
    } 

    result.push(byte_);
  }

  return Uint8Array.from(result)
};
