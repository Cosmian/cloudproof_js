import { KeyBlock } from "kms/data_structures/KeyBlock"
import { KeyValue } from "kms/data_structures/KeyValue"
import { PGPKey } from "kms/objects/PGPKey"
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm"
import { KeyFormatType } from "kms/types/KeyFormatType"

const byteArray = new TextEncoder().encode("toto")
// const str = new TextDecoder().decode(byteArray)

const pgp = new PGPKey(256, new KeyBlock(KeyFormatType.TransparentSymmetricKey, new KeyValue(byteArray), CryptographicAlgorithm.AES, 256))

test('create PGP Key object', () => {
  expect(pgp).toEqual({ "_pgp_key_version": 256, "_keyBlock": { "_key_format_type": 7, "_cryptographic_algorithm": 3, "_key_value": { "_c1": new Uint8Array([116, 111, 116, 111]) }, "_cryptographic_length": 256 } })
})
