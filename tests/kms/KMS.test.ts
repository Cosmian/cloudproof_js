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
import { TtlvType } from "kms/serialize/TtlvType"
import { AccessPolicy } from "crypto/abe/interfaces/access_policy"
import { CoverCryptHybridEncryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/encryption"
import { CoverCryptHybridDecryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/decryption"

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
  const key: SymmetricKey = await client.retrieveSymmetricKey(uniqueIdentifier)
  expect(key.keyBlock.cryptographic_algorithm).toEqual(CryptographicAlgorithm.AES)
  expect(key.keyBlock.cryptographic_length).toEqual(256)
  expect(key.keyBlock.key_format_type).toEqual(KeyFormatType.TransparentSymmetricKey)
  expect(key.keyBlock.key_value.plaintext?.keyMaterial instanceof TransparentSymmetricKey).toBeTruthy()
  const sk = key.keyBlock.key_value.plaintext?.keyMaterial as TransparentSymmetricKey
  expect(sk.key.length).toEqual(32)

  // import
  const uid = await client.importSymmetricKey(uniqueIdentifier + "-1", key.bytes(), false)
  expect(uid).toEqual(uniqueIdentifier + "-1")

  // get
  const key_ = await client.retrieveSymmetricKey(uid)
  expect(key_.bytes()).toEqual(key.bytes())

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
  // JSON encoding test
  const json = JSON.parse(new TextDecoder().decode(policy.toJsonEncoded()))
  expect(json.last_attribute_value).toEqual(6)
  expect(json.max_attribute_creations).toEqual(20)
  expect(json.attribute_to_int["Department::FIN"]).toEqual([4])
  expect(json.axes["Security Level"]).toEqual([["Protected", "Confidential", "Top Secret"], true])
  // TTLV Test
  const ttlv = toTTLV(policy.toVendorAttribute())
  const children = ttlv.value as TTLV[]
  expect(children[0].value).toEqual(VendorAttribute.VENDOR_ID_COSMIAN)
  expect(children[1].value).toEqual(VendorAttribute.VENDOR_ATTR_COVER_CRYPT_POLICY)
  expect(children[2].value).toEqual(hexEncode(policy.toJsonEncoded()))
  // Vendor Attributes test
  const va = policy.toVendorAttribute()
  const att = new Attributes(ObjectType.PrivateKey)
  att.vendorAttributes = [va]
  const policy_ = Policy.fromAttributes(att)
  expect(policy_).toEqual(policy)
})


test("Long & Big Ints", async () => {
  const ttlvLong = new TTLV("Long", TtlvType.LongInteger, BigInt("9223372036854775806"))
  const ttlvLongJson = JSON.stringify(ttlvLong)
  expect(ttlvLongJson).toEqual('{"tag":"Long","type":"LongInteger","value":"0x7FFFFFFFFFFFFFFE"}')
  const ttlvLong_ = TTLV.fromJSON(ttlvLongJson)
  expect(JSON.stringify(ttlvLong_)).toEqual(ttlvLongJson)

  const ttlvBig = new TTLV("Big", TtlvType.BigInteger, BigInt("99999999999999999999999998888888888888888"))
  const ttlvBigJson = JSON.stringify(ttlvBig)
  expect(ttlvBigJson).toEqual('{"tag":"Big","type":"BigInteger","value":"0x125DFA371A19E6F7CB54391D77348EA8E38"}')
  const ttlvBig_ = TTLV.fromJSON(ttlvBigJson)
  expect(JSON.stringify(ttlvBig_)).toEqual(ttlvBigJson)

})

test("KMS CoverCrypt Access Policy", async () => {
  const apb = new AccessPolicy("(Department::MKG || Department::FIN) && Security Level::Confidential")
  const apj = apb.toKmipJson()
  expect(apj).toEqual('{"And":[{"Or":[{"Attr":"Department::MKG"},{"Attr":"Department::FIN"}]},{"Attr":"Security Level::Confidential"}]}')
  const apb_ = AccessPolicy.fromKmipJson(apj)
  expect(apb_).toEqual(apb)
  // vendor attributes
  const va = apb.toVendorAttribute()
  const attributes = new Attributes(ObjectType.PrivateKey)
  attributes.vendorAttributes = [va]
  expect(AccessPolicy.fromAttributes(attributes)).toEqual(apb)
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

  // create master keys
  console.log("...master key")
  const [mskID, mpkID] = await client.createAbeMasterKeyPair(policy)

  // recover keys and policies
  const msk = await client.retrieveAbePrivateMasterKey(mskID)
  const policyMsk = Policy.fromKey(msk)
  expect(policyMsk.equals(policy)).toBeTruthy()
  const mpk = await client.retrieveAbePublicMasterKey(mpkID)
  const policyMpk = Policy.fromKey(mpk)
  expect(policyMpk.equals(policy)).toBeTruthy()

  // create user decryption Key
  console.log("...user decryption key")
  const apb = "(Department::MKG || Department::FIN) && Security Level::Confidential"
  const udkID = await client.createAbeUserDecryptionKey(apb, mskID)
  const udk = await client.retrieveAbeUserDecryptionKey(udkID)
  expect(AccessPolicy.fromKey(udk).booleanAccessPolicy).toEqual(apb)

  // encryption
  console.log("...encryption")
  const plaintext = new TextEncoder().encode("abcdefgh")
  const encrypter = new CoverCryptHybridEncryption(policy, mpk)
  const ciphertext = encrypter.encrypt(["Department::FIN", "Security Level::Confidential"], new Uint8Array([42]), plaintext)
  // decryption
  console.log("...decryption")
  const decrypter = new CoverCryptHybridDecryption(udk)
  const plaintext_ = decrypter.decrypt(ciphertext)
  expect(plaintext_).toEqual(plaintext)


  // rotate
  const [mskID_, mpkID_] = await client.rotateAbeAttributes(mskID, ["Department::FIN", "Department::MKG"])
  expect(mskID_).toEqual(mskID)
  expect(mpkID_).toEqual(mpkID)

  const mpk2 = await client.retrieveAbePublicMasterKey(mpkID)
  const policy2 = Policy.fromKey(mpk2)

  // encryption
  console.log("...encryption")
  const plaintext2 = new TextEncoder().encode("abcdefgh")
  const encrypter2 = new CoverCryptHybridEncryption(policy2, mpk2)
  const ciphertext2 = encrypter2.encrypt(["Department::FIN", "Security Level::Confidential"], new Uint8Array([42]), plaintext2)
  // decryption
  console.log("...decryption rotated old")
  try {
    const decrypter2 = new CoverCryptHybridDecryption(udk)
    decrypter2.decrypt(ciphertext2)
    return await Promise.reject(new Error("This should have failed"))
  } catch (error) {
    // everything is fine - it should not decrypt
  }
  // retrieve refreshed udk
  const udk2 = await client.retrieveAbeUserDecryptionKey(udkID)
  console.log("...decryption rotated 2")
  const decrypter2 = new CoverCryptHybridDecryption(udk2)
  const plaintext2_ = decrypter2.decrypt(ciphertext2)
  expect(plaintext2_).toEqual(plaintext)

  return await Promise.resolve("SUCCESS")
})

