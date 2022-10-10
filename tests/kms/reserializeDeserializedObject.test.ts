import { fromTTLV } from "kms/deserialize/deserializer"
import { Create } from "kms/operations/Create"
import { toTTLV } from "kms/serialize/serializer"
import { Attributes } from "kms/types/Attributes"
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm"
import { KeyFormatType } from "kms/types/KeyFormatType"
import { Link } from "kms/types/Link"
import { LinkedObjectIdentifier } from "kms/types/LinkedObjectIdentifier"
import { LinkType } from "kms/types/LinkType"
import { ObjectType } from "kms/types/ObjectType"


test("metadata", () => {
  let attributes = new Attributes(ObjectType.SymmetricKey,
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
})

test("ser-de Create", () => {
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
  )
  console.log("ORIGINAL OBJECT", JSON.stringify(create, null, 2))

  const ttlv = toTTLV(create)
  console.log("ORIGINAL TTLV", JSON.stringify(ttlv, null, 2))

  const create_: Create = fromTTLV(Create, JSON.stringify(ttlv, null, 2))
  console.log("RECREATED OBJECT", JSON.stringify(create_, null, 2))

  const ttlv_ = toTTLV(create_)
  console.log("RECREATED TTLV", JSON.stringify(ttlv_, null, 2))

  expect(ttlv_).toEqual(ttlv)
})

test("de-serialize", () => {
  const create: Create = fromTTLV(Create, CreateSymmetricKey)
  expect(create.objectType).toEqual(ObjectType.SymmetricKey)
  expect(create.protectionStorageMasks).toBeUndefined()
  expect(create.attributes.cryptographicAlgorithm).toEqual(CryptographicAlgorithm.AES)
  expect(create.attributes.link).toBeDefined()
  // linter guard
  if (typeof create.attributes.link !== "undefined") {
    expect(create.attributes.link.length).toEqual(1)
    const link: Link = create.attributes.link[0]
    expect(link.linkType).toEqual(LinkType.ParentLink)
    expect(link.linkedObjectIdentifier).toEqual(new LinkedObjectIdentifier("SK"))
  }
})

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
}`
