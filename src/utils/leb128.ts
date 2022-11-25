// Copy/paste from https://www.npmjs.com/package/leb128

/**
 * decodes a LEB128 encoded unsigned interger
 *
 * @param buffer the buffer of bytes to read
 * @returns the decoded number
 */
export function decode(buffer: Uint8Array): { result: number, tail: Uint8Array } {
  let result = 0
  let shift = 0
  let bytesRead = 0
  for (const byte of buffer) {
    bytesRead++;
    result |= (byte & 0x7f) << shift
    if ((0x80 & byte) === 0) break
    shift += 7
  }

  return {
    result,
    tail: Uint8Array.from(buffer.slice(bytesRead)),
  }
}

/**
 * encodes an unsigned integer to LEB128
 *
 * @param value the unsigned integer
 * @returns the LEB128 bytes
 */
export function encode(value: number): Uint8Array {
  const result = [];

  while (true) {
    let byte_ = value & 0x7f;
    value >>= 7;
    if (value !== 0) {
      byte_ = byte_ | 0x80;
    } 

    result.push(byte_);

    if (value === 0) {
      break;
    }
  }

  return Uint8Array.from(result)
};
