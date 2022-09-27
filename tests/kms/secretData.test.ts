import { KeyBlock } from "kms/data_structures/KeyBlock";
import { KeyValue } from "kms/data_structures/KeyValue";
import { SecretData } from "kms/objects/SecretData";
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm";
import { KeyFormatType } from "kms/types/KeyFormatType";
import { SecretDataType } from "kms/types/SecretDataType";

const byteArray = new TextEncoder().encode("toto");

const sd = new SecretData(
  SecretDataType.FunctionalKeyShare,
  new KeyBlock(
    KeyFormatType.TransparentSymmetricKey,
    new KeyValue(byteArray),
    CryptographicAlgorithm.AES,
    256
  )
);

test("create SecretData object", () => {
  expect(sd).toEqual({
    _secretDataType: 2147483650,
    _keyBlock: {
      _key_format_type: 7,
      _cryptographic_algorithm: 3,
      _key_value: { _c1: new Uint8Array([116, 111, 116, 111]) },
      _cryptographic_length: 256,
    },
  });
});
