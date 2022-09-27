import { KeyBlock } from "kms/data_structures/KeyBlock";
import { KeyValue } from "kms/data_structures/KeyValue";
import { SplitKey } from "kms/objects/SplitKey";
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm";
import { KeyFormatType } from "kms/types/KeyFormatType";
import { SplitKeyMethod } from "kms/types/SplitKeyMethod";

const byteArray = new TextEncoder().encode("toto");

const sk = new SplitKey(
  64,
  2,
  8,
  SplitKeyMethod.PolynomialSharingGf2_16,
  new KeyBlock(
    KeyFormatType.TransparentSymmetricKey,
    new KeyValue(byteArray),
    CryptographicAlgorithm.AES,
    256
  )
);

test("create SplitKey object", () => {
  expect(sk).toEqual({
    _key_part_identifier: 2,
    _split_key_method: 2,
    _split_key_parts: 64,
    _split_key_threshold: 8,
    _keyBlock: {
      _key_format_type: 7,
      _cryptographic_algorithm: 3,
      _key_value: { _c1: new Uint8Array([116, 111, 116, 111]) },
      _cryptographic_length: 256,
    },
  });
});
