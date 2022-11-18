// Copy/paste from https://www.npmjs.com/package/leb128

/**
 * decodes a LEB128 encoded interger
 *
 * @param buffer the buffer of bytes to read
 * @returns the decoded number
 */
export function decode(buffer: Uint8Array): number {
  let result = 0;
  let shift = 0;
  for (const byte of buffer) {
    result |= (byte & 0x7f) << shift;
    if ((0x80 & byte) === 0)
      break;
    shift += 7;
  }

  return result
}
