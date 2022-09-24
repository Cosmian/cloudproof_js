import { Hkdf } from "crypto/hkdf"
import { hexDecode } from "utils/utils"

test('hkdf', async () => {
  const k = hexDecode('000000000000000000000000000000000000000000000000000000000000000')
  const k1Salt = hexDecode('0000000000000000000000000000000000000000000000000000000000000000')
  const k2Salt = hexDecode('1111111111111111111111111111111111111111111111111111111111111111')

  const expectedK1 = hexDecode('33ad0a1c607ec03b09e6cd9893680ce210adf300aa1f2660e1b22e10f170f92a')
  const expectedK2 = hexDecode('fbe4b1db0b7ee3c740efa1e88e5a3bd37e9e63d5792752f5064b43555f97b0c9')

  const k1 = await Hkdf.hmacSha256(k, k1Salt)
  expect(k1).toStrictEqual(expectedK1)

  const k2 = await Hkdf.hmacSha256(k, k2Salt)
  expect(k2).toStrictEqual(expectedK2)
})
