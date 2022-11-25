import {
  deserializeList,
  fromBeBytes,
  hexDecode,
  hexEncode,
  toBeBytes,
} from "../../src/utils/utils"
import { encode, decode } from "../../src/utils/leb128"
import { expect, test } from "vitest"

test("hexEncode+hexDecode", () => {
  const s = "ça va être la fête"
  const array = new TextEncoder().encode(s)
  const arrayEncodeDecode = hexDecode(hexEncode(array))
  const arrayDecoded = new TextDecoder().decode(arrayEncodeDecode)
  expect(arrayDecoded).toBe(s)
})

test("number to bytes-number", () => {
  const bytes = toBeBytes(42)
  const myNumber = fromBeBytes(bytes)
  expect(myNumber).toBe(42)
})

test("leb128_real_case", () => {
  const symmetricKey = Uint8Array.from([
    4, 54, 40, 189, 156, 60, 22, 68, 27, 219, 70, 7, 187, 206, 197, 26, 22, 17,
    155, 81, 160, 85, 136, 155, 163, 228, 252, 49, 96, 238, 182, 31,
  ])

  const header = Uint8Array.from([
    0, 0, 0, 100, 32, 120, 240, 161, 244, 238, 22, 217, 56, 5, 25, 27, 35, 143,
    29, 203, 27, 196, 8, 26, 204, 101, 88, 163, 180, 239, 214, 117, 77, 173, 57,
    162, 73, 32, 172, 122, 85, 49, 194, 180, 103, 205, 63, 222, 202, 149, 61,
    226, 71, 191, 240, 243, 220, 253, 182, 16, 202, 203, 148, 18, 42, 137, 137,
    155, 4, 76, 1, 32, 251, 201, 119, 252, 204, 122, 243, 134, 138, 126, 33, 86,
    178, 197, 146, 32, 219, 130, 211, 36, 48, 144, 246, 186, 28, 45, 104, 125,
    207, 170, 154, 184, 252, 57, 198, 184, 148, 1, 21, 182, 15, 10, 146, 127,
    149, 186, 134, 61, 174, 202, 62, 39, 97, 76, 158, 250, 37, 137, 127, 232,
    243, 137, 229, 254, 89, 147, 127, 95,
  ])

  const serialized = Uint8Array.from([
    32, 4, 54, 40, 189, 156, 60, 22, 68, 27, 219, 70, 7, 187, 206, 197, 26, 22,
    17, 155, 81, 160, 85, 136, 155, 163, 228, 252, 49, 96, 238, 182, 31, 140, 1,
    0, 0, 0, 100, 32, 120, 240, 161, 244, 238, 22, 217, 56, 5, 25, 27, 35, 143,
    29, 203, 27, 196, 8, 26, 204, 101, 88, 163, 180, 239, 214, 117, 77, 173, 57,
    162, 73, 32, 172, 122, 85, 49, 194, 180, 103, 205, 63, 222, 202, 149, 61,
    226, 71, 191, 240, 243, 220, 253, 182, 16, 202, 203, 148, 18, 42, 137, 137,
    155, 4, 76, 1, 32, 251, 201, 119, 252, 204, 122, 243, 134, 138, 126, 33, 86,
    178, 197, 146, 32, 219, 130, 211, 36, 48, 144, 246, 186, 28, 45, 104, 125,
    207, 170, 154, 184, 252, 57, 198, 184, 148, 1, 21, 182, 15, 10, 146, 127,
    149, 186, 134, 61, 174, 202, 62, 39, 97, 76, 158, 250, 37, 137, 127, 232,
    243, 137, 229, 254, 89, 147, 127, 95,
  ])

  // Deserialize
  const deserialized = deserializeList(serialized)

  // Check
  expect(deserialized.length).toBe(2)
  expect(deserialized[0]).toStrictEqual(symmetricKey)
  expect(deserialized[1]).toStrictEqual(header)
})

test("LEB128", () => {
  for (const value of [0, 1, 42, 1000]) {
    const leb = encode(value)
    const { result, tail } = decode(leb)

    expect(result).toEqual(value)
    expect(tail).toEqual(Uint8Array.from([]))
  }
})
