import { KeyBlock } from "../../kms/data_structures/KeyBlock"
import { KeyValue } from "../../kms/data_structures/KeyValue"
import { METADATA_KEY } from "../../kms/decorators/interface"
import { build_object_from_json, } from "../../kms/deserialize/deserializer"
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

  const create = new Create(
    ObjectType.SymmetricKey,
    new Attributes(
      ObjectType.SymmetricKey, [new Link(LinkType.ParentLink, new LinkedObjectIdentifier("SK"))],
      undefined, undefined, CryptographicAlgorithm.AES, undefined, undefined, undefined, undefined, KeyFormatType.TransparentSymmetricKey
    )
  )

  const ttlv = to_ttlv(create)
  const jsonString = JSON.stringify(ttlv, null, 2)
  console.log("S", jsonString)

  const parse = JSON.parse(jsonString)
  const create_ = build_object_from_json(parse)

  console.log("B", JSON.stringify(create, null, 2))
  expect(JSON.stringify(create_, null, 2)).toEqual(JSON.stringify(create, null, 2))

  // const ttlv_ = to_ttlv(create_)
  // console.log("R", JSON.stringify(ttlv_, null, 2))

  // expect(ttlv_).toEqual(ttlv)
})

test('deserialize Create', () => {
  const create = new Create(
    ObjectType.SymmetricKey,
    new Attributes(
      ObjectType.SymmetricKey, [new Link(LinkType.ParentLink, new LinkedObjectIdentifier("SK"))],
      undefined, undefined, CryptographicAlgorithm.AES, undefined, undefined, undefined, undefined, KeyFormatType.TransparentSymmetricKey
    )
  )
  console.log(JSON.stringify(create, null, 2))

  const ttlv = to_ttlv(create)
  console.log(JSON.stringify(ttlv, null, 2))

  const create_ = Create.from_ttlv("Operation", ttlv)
  console.log(JSON.stringify(create_, null, 2))

  const ttlv_ = to_ttlv(create_)

  console.log(JSON.stringify(ttlv_, null, 2))

  expect(ttlv_).toEqual(ttlv)

})

