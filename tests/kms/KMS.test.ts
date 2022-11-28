import {
  KmsClient,
  SymmetricKeyAlgorithm,
  CoverCrypt,
  AccessPolicy,
  VendorAttributes,
  Policy,
  PolicyAxis,
  Attributes,
  CryptographicAlgorithm,
  KeyFormatType,
  SymmetricKey,
  TransparentSymmetricKey,
  hexEncode,
  TTLV,
  KeyValue,
  toTTLV,
  TransparentECPublicKey,
  RecommendedCurve,
  deserialize,
  Create,
  Link,
  LinkType,
  fromTTLV,
  CryptographicUsageMask,
  serialize,
} from "../.."

import { expect, test } from "vitest"

test("serialize/deserialize Create", async () => {
  await CoverCrypt()

  const attributes = new Attributes("SymmetricKey")
  attributes.link = [new Link(LinkType.ParentLink, "SK")]
  attributes.cryptographicAlgorithm = CryptographicAlgorithm.AES
  attributes.keyFormatType = KeyFormatType.TransparentSymmetricKey

  const create = new Create(attributes.objectType, attributes)

  const ttlv = toTTLV(create)
  const create2 = fromTTLV<Create>(ttlv)

  const ttlv2 = toTTLV(create2)

  expect(ttlv2).toEqual(ttlv)
})

test("deserialize", () => {
  const create: Create = deserialize<Create>(CREATE_SYMMETRIC_KEY)
  expect(create.objectType).toEqual("SymmetricKey")
  expect(create.protectionStorageMasks).toBeNull()
  expect(create.attributes.cryptographicAlgorithm).toEqual(
    CryptographicAlgorithm.AES,
  )
  expect(create.attributes.link).toBeDefined()
  // linter guard
  if (typeof create.attributes.link !== "undefined") {
    expect(create.attributes.link.length).toEqual(1)
    const link: Link = create.attributes.link[0]
    expect(link.linkType).toEqual(LinkType.ParentLink)
    expect(link.linkedObjectIdentifier).toEqual("SK")
  }
})

// generated from Rust
const CREATE_SYMMETRIC_KEY = `{
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

test(
  "KMS Import Master Keys",
  async () => {
    await CoverCrypt()
    const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))
    if (!(await client.up())) {
      console.error("No KMIP server. Skipping test")
      return
    }

    const policy = new Policy([
      new PolicyAxis("Department", ["FIN", "MKG", "HR"], false),
    ])
    const [privateKeyUniqueIdentifier, publicKeyUniqueIdentifier] =
      await client.createCoverCryptMasterKeyPair(policy)

    const publicKey = await client.retrieveCoverCryptPublicMasterKey(
      publicKeyUniqueIdentifier,
    )
    const privateKey = await client.retrieveCoverCryptSecretMasterKey(
      privateKeyUniqueIdentifier,
    )

    const importedPublicKeyUniqueIdentifier =
      await client.importCoverCryptPublicMasterKey(
        `${publicKeyUniqueIdentifier}-imported`,
        publicKey,
      )
    const importedPrivateKeyUniqueIdentifier =
      await client.importCoverCryptSecretMasterKey(
        `${privateKeyUniqueIdentifier}-imported`,
        privateKey,
      )

    const importedPublicKey = await client.retrieveCoverCryptPublicMasterKey(
      importedPublicKeyUniqueIdentifier,
    )
    const importedPrivateKey = await client.retrieveCoverCryptSecretMasterKey(
      importedPrivateKeyUniqueIdentifier,
    )
  },
  {
    timeout: 10 * 1000,
  },
)

test(
  "KMS Symmetric Key",
  async () => {
    await CoverCrypt()

    const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))

    if (!(await client.up())) {
      console.error("No KMIP server. Skipping test")
      return
    }

    // create
    const uniqueIdentifier = await client.createSymmetricKey(
      SymmetricKeyAlgorithm.AES,
      256,
    )
    expect(uniqueIdentifier).toBeTypeOf("string")

    // recover
    const key: SymmetricKey = await client.retrieveSymmetricKey(
      uniqueIdentifier,
    )
    expect(key.keyBlock.cryptographicAlgorithm).toEqual(
      CryptographicAlgorithm.AES,
    )
    expect(key.keyBlock.cryptographicLength).toEqual(256)
    expect(key.keyBlock.keyFormatType).toEqual(
      KeyFormatType.TransparentSymmetricKey,
    )
    expect(key.keyBlock.keyValue).not.toBeNull()
    expect(key.keyBlock.keyValue).toBeInstanceOf(KeyValue)

    const keyValue = key?.keyBlock?.keyValue as KeyValue
    expect(keyValue.keyMaterial).toBeInstanceOf(TransparentSymmetricKey)

    const sk = keyValue.keyMaterial as TransparentSymmetricKey
    expect(sk.key.length).toEqual(32)

    // import
    const uid = await client.importSymmetricKey(
      uniqueIdentifier + "-1",
      key.bytes(),
      false,
    )
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
  },
  {
    timeout: 10 * 1000,
  },
)

test("Policy", async () => {
  await CoverCrypt()

  const policy = new Policy(
    [
      new PolicyAxis(
        "Security Level",
        ["Protected", "Confidential", "Top Secret"],
        true,
      ),
      new PolicyAxis("Department", ["FIN", "MKG", "HR"], false),
    ],
    20,
  )
  // JSON encoding test
  const json = JSON.parse(new TextDecoder().decode(policy.toJsonEncoded()))
  expect(json.last_attribute_value).toEqual(6)
  expect(json.max_attribute_creations).toEqual(20)
  expect(json.attribute_to_int["Department::FIN"]).toEqual([4])
  expect(json.axes["Security Level"]).toEqual([
    ["Protected", "Confidential", "Top Secret"],
    true,
  ])
  // TTLV Test
  const ttlv = toTTLV(policy.toVendorAttribute())
  const children = ttlv.value as TTLV[]
  expect(children[0].value).toEqual(VendorAttributes.VENDOR_ID_COSMIAN)
  expect(children[1].value).toEqual(
    VendorAttributes.VENDOR_ATTR_COVER_CRYPT_POLICY,
  )
  expect(children[2].value).toEqual(hexEncode(policy.toJsonEncoded()))
  // Vendor Attributes test
  const va = policy.toVendorAttribute()
  const att = new Attributes("PrivateKey")
  att.vendorAttributes = [va]
  const policy_ = Policy.fromAttributes(att)
  expect(policy_).toEqual(policy)
})

test("Big Ints", async () => {
  const publicKey = new TransparentECPublicKey(
    RecommendedCurve.ANSIX9C2PNB163V1,
    99999999999999999999999998888888888888888n,
  )

  const json = JSON.stringify(toTTLV(publicKey))
  expect(json).toEqual(
    '{"tag":"TransparentECPublicKey","type":"Structure","value":[{"tag":"RecommendedCurve","type":"Enumeration","value":"ANSIX9C2PNB163V1"},{"tag":"Q","type":"BigInteger","value":"0x125DFA371A19E6F7CB54391D77348EA8E38"}]}',
  )

  const publicKey2 = deserialize<TransparentECPublicKey>(json)
  expect(publicKey2.q).toBe(99999999999999999999999998888888888888888n)
})

test("Enums", async () => {
  const attributes = new Attributes("SymmetricKey")
  attributes.keyFormatType = KeyFormatType.TransparentSymmetricKey
  attributes.cryptographicUsageMask =
    CryptographicUsageMask.Encrypt | CryptographicUsageMask.Decrypt

  const json = serialize(attributes)
  const attributes2 = deserialize<Attributes>(json)

  expect(attributes2.keyFormatType).toEqual(attributes.keyFormatType)
  expect(attributes2.cryptographicUsageMask).toEqual(
    attributes.cryptographicUsageMask,
  )
})

test("KMS CoverCrypt Access Policy", async () => {
  await CoverCrypt()

  const apb = new AccessPolicy(
    "(Department::MKG || Department::FIN) && Security Level::Confidential",
  )
  const apj = await apb.toKmipJson()
  expect(apj).toEqual(
    '{"And":[{"Or":[{"Attr":"Department::MKG"},{"Attr":"Department::FIN"}]},{"Attr":"Security Level::Confidential"}]}',
  )
  const apb_ = AccessPolicy.fromKmipJson(apj)
  expect(apb_).toEqual(apb)
  // vendor attributes
  const va = await apb.toVendorAttribute()
  const attributes = new Attributes("PrivateKey")
  attributes.vendorAttributes = [va]
  expect(AccessPolicy.fromAttributes(attributes)).toEqual(apb)
})

test(
  "KMS CoverCrypt keys",
  async () => {
    const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))
    if (!(await client.up())) {
      console.log("No KMIP server. Skipping test")
      return
    }

    const policy = new Policy([
      new PolicyAxis(
        "Security Level",
        ["Protected", "Confidential", "Top Secret"],
        true,
      ),
      new PolicyAxis("Department", ["FIN", "MKG", "HR"], false),
    ])

    // create master keys
    const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(policy)

    // recover keys and policies
    const msk = await client.retrieveCoverCryptSecretMasterKey(mskID)
    const policyMsk = Policy.fromKey(msk)
    expect(policyMsk.equals(policy)).toBeTruthy()
    const mpk = await client.retrieveCoverCryptPublicMasterKey(mpkID)
    const policyMpk = Policy.fromKey(mpk)
    expect(policyMpk.equals(policy)).toBeTruthy()

    // create user decryption Key
    const apb =
      "(Department::MKG || Department::FIN) && Security Level::Confidential"
    const udkID = await client.createCoverCryptUserDecryptionKey(apb, mskID)
    const udk = await client.retrieveCoverCryptUserDecryptionKey(udkID)
    expect(AccessPolicy.fromKey(udk).booleanAccessPolicy).toEqual(apb)

    // encryption
    const plaintext = new TextEncoder().encode("abcdefgh")
    const ciphertext = await client.coverCryptEncrypt(
      mpkID,
      "Department::FIN && Security Level::Confidential",
      plaintext,
    )

    {
      const { plaintext } = await client.coverCryptDecrypt(udkID, ciphertext)
      expect(plaintext).toEqual(plaintext)
    }

    // rotate
    const [rotatedMskID, rotatedMpkID] = await client.rotateCoverCryptAttributes(mskID, [
      "Department::FIN",
      "Department::MKG",
    ])
    expect(rotatedMskID).toEqual(mskID)
    expect(rotatedMpkID).toEqual(mpkID)

    const rotatedMpk = await client.retrieveCoverCryptPublicMasterKey(rotatedMpkID)
    expect(rotatedMpk).not.toEqual(mpk)
    const rotatedPolicy = Policy.fromKey(rotatedMpk)
    expect(policy.toString()).not.toEqual(rotatedPolicy.toString())

    // encryption
    const plaintext2 = new TextEncoder().encode("abcdefgh")
    const ciphertext2 = await client.coverCryptEncrypt(
      mpkID,
      "Department::FIN && Security Level::Confidential",
      plaintext2,
    )

    // decryption
    const { CoverCryptHybridDecryption } = await CoverCrypt();
    {
      const decrypter2 = new CoverCryptHybridDecryption(udk)
      try {
        // Previous local key should not work anymore.
        decrypter2.decrypt(ciphertext2)
        return await Promise.reject(new Error("This should have failed"))
      } catch (error) {
        // everything is fine - it should not decrypt
      }
    }

    // decrypt with new fetches KMS key
    {
      const udk2 = await client.retrieveCoverCryptUserDecryptionKey(udkID)
      const decrypter2 = new CoverCryptHybridDecryption(udk2)
      const { plaintext } = decrypter2.decrypt(ciphertext2)
      expect(plaintext).toEqual(plaintext)
    }

    // decrypt in KMS should still work
    {
        const { plaintext } = await client.coverCryptDecrypt(udkID, ciphertext2)
        expect(plaintext).toEqual(plaintext)
    }

    return await Promise.resolve("SUCCESS")
  },
  {
    timeout: 10 * 1000,
  },
)
