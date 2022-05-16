import { hexDecode, hexEncode } from "../../lib"
import { fromBeBytes, toBeBytes } from "../../utils/utils"

test('hexEncode+hexDecode', () => {
    const s = "ça va être la fête"
    const array = new TextEncoder().encode(s)
    const array_ = hexDecode(hexEncode(array))
    const s_ = new TextDecoder().decode(array_)
    expect(s_).toBe(s)
})

test('number to bytes-number', () => {
    const bytes = toBeBytes(42)
    const myNumber = fromBeBytes(bytes)
    expect(myNumber).toBe(42)
})
