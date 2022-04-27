import { hexDecode, hexEncode } from "../../lib"

test('hexEncode+hexDecode', () => {
    const s = "ça va être la fête"
    const array = new TextEncoder().encode(s)
    const array_ = hexDecode(hexEncode(array))
    const s_ = new TextDecoder().decode(array_)
    expect(s_).toBe(s)
})