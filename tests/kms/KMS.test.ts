import { fromTTLV } from "kms/deserialize/deserializer"
import { KmipClient, SymmetricKeyAlgorithm } from "kms/client/KmipClient"
import { Create } from "kms/operations/Create"
import { toTTLV } from "kms/serialize/serializer"
import { Attributes } from "kms/types/Attributes"
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm"
import { KeyFormatType } from "kms/types/KeyFormatType"
import { Link } from "kms/types/Link"
import { LinkedObjectIdentifier } from "kms/types/LinkedObjectIdentifier"
import { LinkType } from "kms/types/LinkType"
import { ObjectType } from "kms/types/ObjectType"
import { SymmetricKey } from "kms/objects/SymmetricKey"
import { TransparentSymmetricKey } from "kms/data_structures/TransparentSymmetricKey"
import { Policy, PolicyAxis } from "crypto/abe/interfaces/policy"
import { hexEncode } from "utils/utils"
import { TTLV } from "kms/serialize/Ttlv"
import { VendorAttribute } from "kms/types/VendorAttribute"

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
  // console.log("ORIGINAL OBJECT", JSON.stringify(create, null, 2))

  const ttlv = toTTLV(create)
  // console.log("ORIGINAL TTLV", JSON.stringify(ttlv, null, 2))

  const create_: Create = fromTTLV(Create, ttlv)
  // console.log("RECREATED OBJECT", JSON.stringify(create_, null, 2))

  const ttlv_ = toTTLV(create_)
  // console.log("RECREATED TTLV", JSON.stringify(ttlv_, null, 2))

  expect(ttlv_).toEqual(ttlv)
})

test("de-serialize", () => {
  const create: Create = fromTTLV(Create, JSON.parse(CreateSymmetricKey))
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

// generated from Rust
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


test("KMS Symmetric Key", async () => {
  const client: KmipClient = new KmipClient(new URL("http://localhost:9998/kmip/2_1"))
  if (! await client.up()) {
    console.log("No KMIP server. Skipping test")
    return
  }

  // create
  const uniqueIdentifier = await client.createSymmetricKey(SymmetricKeyAlgorithm.AES, 256)
  expect(typeof uniqueIdentifier).toEqual("string")

  // recover
  const key: SymmetricKey = await client.getSymmetricKey(uniqueIdentifier)
  expect(key.keyBlock.cryptographic_algorithm).toEqual(CryptographicAlgorithm.AES)
  expect(key.keyBlock.cryptographic_length).toEqual(256)
  expect(key.keyBlock.key_format_type).toEqual(KeyFormatType.TransparentSymmetricKey)
  expect(key.keyBlock.key_value.plaintext?.keyMaterial instanceof TransparentSymmetricKey).toBeTruthy()
  const sk = key.keyBlock.key_value.plaintext?.keyMaterial as TransparentSymmetricKey
  expect(sk.key.length).toEqual(32)

  // import
  const uid = await client.importSymmetricKey(uniqueIdentifier + "-1", key.keyBytes(), false)
  expect(uid).toEqual(uniqueIdentifier + "-1")

  // get
  const key_ = await client.getSymmetricKey(uid)
  expect(key_.keyBytes()).toEqual(key.keyBytes())

  // revoke
  await client.revokeSymmetricKey(uniqueIdentifier, "revoked")
  await client.revokeSymmetricKey(uid, "revoked")

  // destroy
  await client.destroySymmetricKey(uid)
  await client.destroySymmetricKey(uniqueIdentifier)

})


test("Policy", async () => {

  const policy = new Policy([
    new PolicyAxis("Security Level", ["Protected", "Confidential", "Top Secret"], true),
    new PolicyAxis("Department", ["FIN", "MKG", "HR"], false)
  ], 20)

  const json = JSON.parse(new TextDecoder().decode(policy.toJsonEncoded()))
  expect(json.last_attribute_value).toEqual(6)
  expect(json.max_attribute_creations).toEqual(20)
  expect(json.attribute_to_int["Department::FIN"]).toEqual([4])
  expect(json.axes["Security Level"]).toEqual([["Protected", "Confidential", "Top Secret"], true])

  const ttlv = toTTLV(policy.toVendorAttribute())
  const children = ttlv.value as TTLV[]
  expect(children[0].value).toEqual(VendorAttribute.VENDOR_ID_COSMIAN)
  expect(children[1].value).toEqual(VendorAttribute.VENDOR_ATTR_COVER_CRYPT_POLICY)
  expect(children[2].value).toEqual(hexEncode(policy.toJsonEncoded()))
})

test("KMS CoverCrypt keys", async () => {

  const client: KmipClient = new KmipClient(new URL("http://localhost:9998/kmip/2_1"))
  if (! await client.up()) {
    console.log("No KMIP server. Skipping test")
    return
  }

  const policy = new Policy([
    new PolicyAxis("Security Level", ["Protected", "Confidential", "Top Secret"], true),
    new PolicyAxis("Department", ["FIN", "MKG", "HR"], false)
  ])

  const [msk, mpk] = await client.createAbeMasterKeyPair(policy)
  console.log(msk, mpk)

})