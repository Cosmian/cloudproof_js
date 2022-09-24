import { KeyBlock } from "kms/data_structures/KeyBlock"
import { KeyValue } from "kms/data_structures/KeyValue"
import { PrivateKey } from "kms/objects/PrivateKey"
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm"
import { KeyFormatType } from "kms/types/KeyFormatType"

const byteArray = new TextEncoder().encode("toto")

const pk = new PrivateKey(new KeyBlock(KeyFormatType.TransparentSymmetricKey, new KeyValue(byteArray), CryptographicAlgorithm.AES, 256))

test('create PrivateKey object', () => {
  expect(pk).toEqual({ "_keyBlock": { "_key_format_type": 7, "_cryptographic_algorithm": 3, "_key_value": { "_c1": new Uint8Array([116, 111, 116, 111]) }, "_cryptographic_length": 256 } })
})
