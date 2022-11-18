// Copy/paste from https://www.npmjs.com/package/leb128

// since stream in nodejs don't really work the way I would want them too
class FakeStream {
  buffer: Buffer
  _bytesRead: number

  constructor(buf = Buffer.from([])) {
    this.buffer = buf
    this._bytesRead = 0
  }

  read(size: number): Buffer {
    const data = this.buffer.slice(0, size)
    this.buffer = this.buffer.slice(size)
    this._bytesRead += size
    return data
  }

  write(buf: Buffer | number[]): void {
    buf = Buffer.from(buf)
    this.buffer = Buffer.concat([this.buffer, buf])
  }
}

/**
 * @param stream stream of bytes
 * @returns the number read
 */
function read(stream: FakeStream): number {
  let num = 0
  let shift = 0
  let byt
  while (true) {
    byt = stream.read(1)[0]
    num |= (byt & 0x7f) << shift
    if (byt >> 7 === 0) {
      break
    } else {
      shift += 7
    }
  }
  return num
}

/**
 * decodes a LEB128 encoded interger
 *
 * @param {Buffer} buffer the buffer of bytes to read
 * @returns the decoded number
 */
export function decode(buffer: Buffer): number {
  const stream = new FakeStream(buffer)
  return read(stream)
}
