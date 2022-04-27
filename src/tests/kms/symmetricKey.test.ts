import { KeyBlock } from "../../kms/data_structures/KeyBlock"
import { KeyValue } from "../../kms/data_structures/KeyValue"
import { SymmetricKey } from "../../kms/objects/SymmetricKey"
import { CryptographicAlgorithm } from "../../kms/types/CryptographicAlgorithm"
import { KeyFormatType } from "../../kms/types/KeyFormatType"


const byteArray = new TextEncoder().encode("toto")

const sk = new SymmetricKey(new KeyBlock(KeyFormatType.TransparentSymmetricKey, new KeyValue(byteArray), CryptographicAlgorithm.AES, 256))

test('create SymetricKey object', () => {
  expect(sk).toEqual({ "_keyBlock": { "_key_format_type": 7, "_cryptographic_algorithm": 3, "_key_value": { "_key_material": new Uint8Array([116, 111, 116, 111]) }, "_cryptographic_length": 256 } })
})

