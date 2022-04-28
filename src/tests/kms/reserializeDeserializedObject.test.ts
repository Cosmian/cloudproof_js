import { KeyBlock } from "../../kms/data_structures/KeyBlock"
import { KeyValue } from "../../kms/data_structures/KeyValue"
import { build_object_from_json } from "../../kms/deserialize/deserializer"
import { SymmetricKey } from "../../kms/objects/SymmetricKey"
import { Create } from "../../kms/operations/Create"
import { to_ttlv } from "../../kms/serialize/serializer"
import { Attributes } from "../../kms/types/Attributes"
import { CryptographicAlgorithm } from "../../kms/types/CryptographicAlgorithm"
import { KeyFormatType } from "../../kms/types/KeyFormatType"
import { Link } from "../../kms/types/Link"
import { LinkedObjectIdentifier } from "../../kms/types/LinkedObjectIdentifier"
import { LinkType } from "../../kms/types/LinkType"
import { ObjectType } from "../../kms/types/ObjectType"



test('re-serialize deserialized SymmetricKey object', () => {

  const byteArray = new TextEncoder().encode("toto")
  const sk = new SymmetricKey(new KeyBlock(KeyFormatType.TransparentSymmetricKey, new KeyValue(byteArray), CryptographicAlgorithm.AES, 256))
  const ttlv = to_ttlv(sk)
  const stringify = JSON.stringify(ttlv, null, 2)
  const parse = JSON.parse(stringify)
  const deserialize = build_object_from_json(parse)
  const re_serialize = to_ttlv(deserialize)


  expect(re_serialize).toEqual(ttlv)
})



test('re-serialize deserialized Create', () => {

  const createSK = new Create(
    ObjectType.SymmetricKey,
    new Attributes(
      [new Link(LinkType.ParentLink, new LinkedObjectIdentifier("SK"))],
      ObjectType.SymmetricKey, undefined, undefined, CryptographicAlgorithm.AES, undefined, undefined, undefined, undefined, KeyFormatType.TransparentSymmetricKey
    )
  )

  const ttlv = to_ttlv(createSK)
  const jsonString = JSON.stringify(ttlv, null, 2)
  console.log("S", jsonString)

  const parse = JSON.parse(jsonString)
  const createSK_ = build_object_from_json(parse)

  console.log("B", JSON.stringify(createSK, null, 2))
  console.log("B", JSON.stringify(createSK_, null, 2))
  expect(JSON.stringify(createSK_, null, 2)).toEqual(JSON.stringify(createSK, null, 2))

  // const ttlv_ = to_ttlv(createSK_)
  // console.log("R", JSON.stringify(ttlv_, null, 2))

  // expect(ttlv_).toEqual(ttlv)
})




