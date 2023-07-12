import { decode } from "./leb128"

/**
 * Hex encode an array of bytes
 * @param {Uint8Array} array the bytes
 * @returns {string}the hex encoded string
 */
export function hexEncode(array: Uint8Array): string {
  return array.reduce((prev, current) => {
    return prev + current.toString(16).padStart(2, "0")
  }, "")
}

/**
 * Hex decode to an array of bytes
 * @param {string} hexString the hex encoded string
 * @returns {Uint8Array} the decoded array of bytes
 */
export function hexDecode(hexString: string): Uint8Array {
  return new Uint8Array(
    hexString
      .split(/(\w\w)/g)
      .filter((p) => p !== "")
      .map((c) => parseInt(c, 16)),
  )

  // The regex passed to split captures groups of two characters,
  // but this form of split will intersperse them with empty strings
  // (the stuff "between" the captured groups, which is nothing!).
  // So filter is used to remove the empty strings
}

/**
 * Convert a u32 represented as a 4-bytes value in big endian to a u32 value
 * @param {Uint8Array} bytes this a 4-bytes value representing an u32 in big endian
 * @returns {number} the u32 value
 */
export function fromBeBytes(bytes: Uint8Array): number {
  // Create a buffer
  const buf = new ArrayBuffer(4)
  // Create a data view of it
  const view = new DataView(buf)
  // set bytes
  bytes.forEach((b, i) => {
    view.setUint8(i, b)
  })

  // Read the bits as a float; note that by doing this, we're implicitly
  // converting it from a 32-bit float into JavaScript's native 64-bit double
  return view.getUint32(0)
}

/**
 * Convert a u32 value to a u32 represented as a 4-bytes value in big endian
 * @param {number} myNumber a u32 value
 * @returns {Uint8Array} the u32 represented as a 4-bytes value in big endian
 */
export function toBeBytes(myNumber: number): Uint8Array {
  // Convert symmetric key length to 4-bytes array
  const arr = new ArrayBuffer(4)
  const view = new DataView(arr)
  view.setUint32(0, myNumber, false)
  return new Uint8Array(arr, 0)
}

/**
 * Deserialize Uint8Array as a list of Uint8Array
 * @param {Uint8Array} serializedItems Uint8Array of serialized data
 * @returns {Uint8Array[]} an array of deserialized items
 */
export function deserializeList(serializedItems: Uint8Array): Uint8Array[] {
  const items: Uint8Array[] = []
  while (serializedItems.length > 1) {
    const { result: itemLen, tail } = decode(serializedItems)

    const item = tail.slice(0, itemLen)
    serializedItems = tail.slice(itemLen)
    items.push(item)
  }
  return items
}

/**
 * Remove accents and uppercase to query word
 * @param {string} str string to sanitize
 * @returns {string} string initial string without accents and uppercase
 */
export function sanitizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "-")
}

/**
 * Lowercase the first letter of a string
 * @param value the string
 * @returns the string with the first letter lowercased
 */
export function uncapitalize(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1)
}

/**
 * Uppercase the first letter of a string
 * @param value the string
 * @returns the string with the first letter in uppercase
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * @param a one Uint8Array
 * @param b one Uint8Array
 * @returns is equals
 */
export function bytesEquals(
  a: Uint8Array | null,
  b: Uint8Array | null,
): boolean {
  if (a === null && b === null) return true
  if (a === null) return false
  if (b === null) return false

  if (a.length !== b.length) return false

  for (const index in a) {
    if (a[index] !== b[index]) return false
  }

  return true
}

/**
 *
 * @param value
 */
export function toBytes(value: string | Uint8Array): Uint8Array {
  if (typeof value === "string") {
    return new TextEncoder().encode(value)
  } else if (value instanceof Uint8Array) {
    return value
  } else {
    throw new Error(
      `Conversion problem: toBytes: Type of ${typeof value} not supported.`,
    )
  }
}
