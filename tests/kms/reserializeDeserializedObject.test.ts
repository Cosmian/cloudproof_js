import { KeyBlock } from "kms/data_structures/KeyBlock";
import { KeyValue } from "kms/data_structures/KeyValue";
import { build_object_from_json, fromTTLV } from "kms/deserialize/deserializer";
import { SymmetricKey } from "kms/objects/SymmetricKey";
import { Create } from "kms/operations/Create";
import { toTTLV } from "kms/serialize/serializer";
import { Attributes } from "kms/types/Attributes";
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm";
import { KeyFormatType } from "kms/types/KeyFormatType";
import { Link } from "kms/types/Link";
import { LinkedObjectIdentifier } from "kms/types/LinkedObjectIdentifier";
import { LinkType } from "kms/types/LinkType";
import { ObjectType } from "kms/types/ObjectType";

test("re-serialize deserialized SymmetricKey object", () => {
  const byteArray = new TextEncoder().encode("toto");
  const sk = new SymmetricKey(
    new KeyBlock(
      KeyFormatType.TransparentSymmetricKey,
      new KeyValue(byteArray),
      CryptographicAlgorithm.AES,
      256
    )
  );
  const ttlv = toTTLV(sk);
  const stringify = JSON.stringify(ttlv, null, 2);
  const parse = JSON.parse(stringify);
  const deserialize = build_object_from_json(parse);
  const reSerialize = toTTLV(deserialize);

  expect(reSerialize).toEqual(ttlv);
});

test("re-serialize deserialized Create", () => {
  const create = new Create(
    ObjectType.SymmetricKey,
    new Attributes(
      ObjectType.SymmetricKey,
      [new Link(LinkType.ParentLink, new LinkedObjectIdentifier("SK"))],
      undefined,
      undefined,
      CryptographicAlgorithm.AES,
      undefined,
      undefined,
      undefined,
      undefined,
      KeyFormatType.TransparentSymmetricKey
    )
  );

  console.log(create.toString());

  const ttlv = toTTLV(create);
  const jsonString = JSON.stringify(ttlv, null, 2);
  console.log("S", jsonString);

  const parse = JSON.parse(jsonString);
  const create_ = build_object_from_json(parse);

  console.log("B", JSON.stringify(create_, null, 2));
  // expect(JSON.stringify(create_, null, 2)).toEqual(
  //   JSON.stringify(create, null, 2)
  // );

  // const ttlv_ = to_ttlv(create_)
  // console.log("R", JSON.stringify(ttlv_, null, 2))

  // expect(ttlv_).toEqual(ttlv)
});

test("deserialize Create", () => {
  const create = new Create(
    ObjectType.SymmetricKey,
    new Attributes(
      ObjectType.SymmetricKey,
      [new Link(LinkType.ParentLink, new LinkedObjectIdentifier("SK"))],
      undefined,
      undefined,
      CryptographicAlgorithm.AES,
      undefined,
      undefined,
      undefined,
      undefined,
      KeyFormatType.TransparentSymmetricKey
    )
  );
  console.log(JSON.stringify(create, null, 2));

  const ttlv = toTTLV(create);
  console.log(JSON.stringify(ttlv, null, 2));

  const create_ = Create.from_ttlv("Operation", ttlv);
  console.log(JSON.stringify(create_, null, 2));

  const ttlv_ = toTTLV(create_);

  console.log(JSON.stringify(ttlv_, null, 2));

  expect(ttlv_).toEqual(ttlv);
});

test("de-serialize", () => {
  const create = fromTTLV(Create, CreateSymmetricKey);
  console.log(create.toString());
});

const CreateSymmetricKey = `{
  "tag": "Create",
  "type": "Structure",
  "value": [
    {
      "tag": "ObjectType",
      "type": "Enumeration",
      "value": "SymmetricKey"
    },
    {
      "tag": "Attributes",
      "type": "Structure",
      "value": [
        {
          "tag": "CryptographicAlgorithm",
          "type": "Enumeration",
          "value": "AES"
        },
        {
          "tag": "Link",
          "type": "Structure",
          "value": [
            {
              "tag": "Link",
              "type": "Structure",
              "value": [
                {
                  "tag": "LinkType",
                  "type": "Enumeration",
                  "value": "ParentLink"
                },
                {
                  "tag": "LinkedObjectIdentifier",
                  "type": "TextString",
                  "value": "SK"
                }
              ]
            }
          ]
        },
        {
          "tag": "ObjectType",
          "type": "Enumeration",
          "value": "SymmetricKey"
        }
      ]
    }
  ]
}`;
