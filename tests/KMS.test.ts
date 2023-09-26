import {
  AccessPolicy,
  Attributes,
  CoverCrypt,
  Create,
  CryptographicAlgorithm,
  CryptographicUsageMask,
  KMIPOperations,
  KeyFormatType,
  KeyValue,
  KmsClient,
  Link,
  LinkType,
  RecommendedCurve,
  SymmetricKey,
  SymmetricKeyAlgorithm,
  TTLV,
  TransparentECPublicKey,
  TransparentSymmetricKey,
  VendorAttributes,
  deserialize,
  fromTTLV,
  hexEncode,
  serialize,
  toTTLV,
} from ".."

import { beforeAll, expect, test } from "vitest"
import {
  NIST_P256_CERTIFICATE,
  NIST_P256_PRIVATE_KEY,
} from "./data/certificates"

const kmsToken = process.env.AUTH0_TOKEN_1
let client: KmsClient | undefined

beforeAll(async () => {
  client = new KmsClient(
    `http://${process.env.KMS_HOST || "localhost"}:9998`,
    kmsToken,
  )
  if (!(await client.up())) {
    console.error("No KMIP server. Skipping test")
    client = undefined
  }
})

test("serialize/deserialize Create", async () => {
  await CoverCrypt()

  const attributes = new Attributes()
  attributes.objectType = "SymmetricKey"
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
    if (client !== undefined) {
      const { Policy, PolicyAxis } = await CoverCrypt()

      const policy = new Policy([
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
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

      await client.retrieveCoverCryptPublicMasterKey(
        importedPublicKeyUniqueIdentifier,
      )
      await client.retrieveCoverCryptSecretMasterKey(
        importedPrivateKeyUniqueIdentifier,
      )
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS With JWE encryption",
  async () => {
    if (client !== undefined) {
      const { Policy, PolicyAxis } = await CoverCrypt()

      client.setEncryption({
        kty: "OKP",
        use: "enc",
        crv: "X25519",
        kid: "DX3GC+Fx3etxfRJValQNbqaB0gs=",
        x: "gdF-1TtAjsFqNWr9nwhGUlFG38qrDUqYgcILgtYrpTY",
        alg: "ECDH-ES",
      })

      const policy = new Policy([
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
      ])

      await client.createCoverCryptMasterKeyPair(policy)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS Locate",
  async () => {
    if (client !== undefined) {
      const TAG = (Math.random() * 100000000).toString()
      const uniqueIdentifier = await client.createSymmetricKey(
        SymmetricKeyAlgorithm.AES,
        256,
        undefined,
        [TAG],
      )
      const uniqueIdentifier2 = await client.createSymmetricKey(
        SymmetricKeyAlgorithm.AES,
        256,
        undefined,
        [TAG],
      )

      const uniqueIdentifiers = await client.getUniqueIdentifiersByTags([TAG])
      expect(uniqueIdentifiers.length).toEqual(2)
      expect(uniqueIdentifiers).toContain(uniqueIdentifier)
      expect(uniqueIdentifiers).toContain(uniqueIdentifier2)

      const notExist = await client.getUniqueIdentifiersByTags([
        "TAG_NOT_EXIST",
      ])
      expect(notExist.length).toEqual(0)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS Locate CoverCrypt IUD",
  async () => {
    if (client !== undefined) {
      const TAG = (Math.random() * 100000000).toString()

      const { Policy, PolicyAxis } = await CoverCrypt()

      const policy = new Policy([
        new PolicyAxis(
          "Security Level",
          [
            { name: "Protected", isHybridized: false },
            { name: "Confidential", isHybridized: false },
            { name: "Top Secret", isHybridized: true },
          ],
          true,
        ),
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
      ])

      const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(
        policy,
        [TAG],
      )

      const uniqueIdentifiers = await client.getUniqueIdentifiersByTags([TAG])
      expect(uniqueIdentifiers.length).toEqual(2)
      expect(uniqueIdentifiers).toContain(mskID)
      expect(uniqueIdentifiers).toContain(mpkID)

      const notExist = await client.getUniqueIdentifiersByTags([
        "TAG_NOT_EXIST",
      ])
      expect(notExist.length).toEqual(0)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS Locate Covercrypt user decryption key",
  async () => {
    if (client !== undefined) {
      const TAG = (Math.random() * 100000000).toString()

      const { Policy, PolicyAxis } = await CoverCrypt()

      const policy = new Policy([
        new PolicyAxis(
          "Security Level",
          [
            { name: "Protected", isHybridized: false },
            { name: "Confidential", isHybridized: false },
            { name: "Top Secret", isHybridized: true },
          ],
          true,
        ),
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
      ])

      // create user decryption Key
      const [mskID] = await client.createCoverCryptMasterKeyPair(policy)
      const uniqueIdentifier = await client.createCoverCryptUserDecryptionKey(
        "(Department::MKG || Department::FIN) && Security Level::Confidential",
        mskID,
        [TAG],
      )

      // Locate by tags
      const uniqueIdentifiersByTag = await client.getUniqueIdentifiersByTags([
        TAG,
      ])

      expect(uniqueIdentifiersByTag).toContain(uniqueIdentifier)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS Locate several keys with same tag",
  async () => {
    if (client !== undefined) {
      const TAG = (Math.random() * 100000000).toString()

      const { Policy, PolicyAxis } = await CoverCrypt()

      const policy = new Policy([
        new PolicyAxis(
          "Security Level",
          [
            { name: "Protected", isHybridized: false },
            { name: "Confidential", isHybridized: false },
            { name: "Top Secret", isHybridized: true },
          ],
          true,
        ),
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
      ])

      // create Covercrypt master key pair (1 & 2)
      const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(
        policy,
        [TAG],
      )
      // create Covercrypt user decryption key (3)
      const decryptionKeyID = await client.createCoverCryptUserDecryptionKey(
        "(Department::MKG || Department::FIN) && Security Level::Confidential",
        mskID,
        [TAG],
      )
      // Create symmetric key (4)
      const symmetricKeyID = await client.createSymmetricKey(
        SymmetricKeyAlgorithm.AES,
        256,
        undefined,
        [TAG],
      )

      // Locate by tags
      const idByTag = await client.getUniqueIdentifiersByTags([TAG])

      expect(idByTag.length).toEqual(4)
      expect(idByTag).toContain(mskID)
      expect(idByTag).toContain(mpkID)
      expect(idByTag).toContain(decryptionKeyID)
      expect(idByTag).toContain(symmetricKeyID)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS Symmetric Key",
  async () => {
    if (client !== undefined) {
      await CoverCrypt()

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
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test("Policy", async () => {
  const { Policy, PolicyAxis } = await CoverCrypt()

  const policy = new Policy(
    [
      new PolicyAxis(
        "Security Level",
        [
          { name: "Protected", isHybridized: false },
          { name: "Confidential", isHybridized: false },
          { name: "Top Secret", isHybridized: true },
        ],
        true,
      ),
      new PolicyAxis(
        "Department",
        [
          { name: "FIN", isHybridized: false },
          { name: "MKG", isHybridized: false },
          { name: "HR", isHybridized: false },
        ],
        false,
      ),
    ],
    20,
  )
  // TTLV Test
  const ttlv = toTTLV(policy.toVendorAttribute())
  const children = ttlv.value as TTLV[]
  expect(children[0].value).toEqual(VendorAttributes.VENDOR_ID_COSMIAN)
  expect(children[1].value).toEqual(
    VendorAttributes.VENDOR_ATTR_COVER_CRYPT_POLICY,
  )
  expect(children[2].value).toEqual(hexEncode(policy.toBytes()))
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
  // vendor attributes
  const va = await apb.toVendorAttribute()
  const attributes = new Attributes("PrivateKey")
  attributes.vendorAttributes = [va]
  expect(AccessPolicy.fromAttributes(attributes)).toEqual(apb)
})

test(
  "KMS CoverCrypt keys",
  async () => {
    if (client !== undefined) {
      const { CoverCryptHybridDecryption, Policy, PolicyAxis } =
        await CoverCrypt()

      const policy = new Policy([
        new PolicyAxis(
          "Security Level",
          [
            { name: "Protected", isHybridized: false },
            { name: "Confidential", isHybridized: false },
            { name: "Top Secret", isHybridized: true },
          ],
          true,
        ),
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
      ])

      // create master keys
      const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(policy)

      // recover keys and policies
      const msk = await client.retrieveCoverCryptSecretMasterKey(mskID)
      const policyMsk = Policy.fromKey(msk)

      // Policies are compared under JSON format but comparison will become a raw bytes comparison since JSON format will be removed
      const policyJson = JSON.parse(new TextDecoder().decode(policy.toBytes()))
      const policyMskJson = JSON.parse(
        new TextDecoder().decode(policyMsk.toBytes()),
      )
      expect(policyJson).toEqual(policyMskJson)
      const mpk = await client.retrieveCoverCryptPublicMasterKey(mpkID)
      const policyMpk = Policy.fromKey(mpk)
      const policyMpkJson = JSON.parse(
        new TextDecoder().decode(policyMpk.toBytes()),
      )
      expect(policyJson).toEqual(policyMpkJson)

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
        const { plaintext: cleartext } = await client.coverCryptDecrypt(udkID, ciphertext)
        expect(cleartext).toEqual(plaintext)
      }

      // rotate
      const rotatedPolicy = await client.rotateCoverCryptAttributes(mskID, [
        "Department::FIN",
        "Department::MKG",
      ])

      const rotatedMsk = await client.retrieveCoverCryptSecretMasterKey(mskID)
      expect(rotatedMsk.bytes()).not.toEqual(msk.bytes())
      const rotatedMpk = await client.retrieveCoverCryptPublicMasterKey(mpkID)
      expect(rotatedMpk.bytes()).not.toEqual(mpk.bytes())
      expect(policy.toBytes()).not.toEqual(rotatedPolicy.toBytes())

      // encryption
      const plaintext2 = new TextEncoder().encode("abcdefgh")
      const ciphertext2 = await client.coverCryptEncrypt(
        mpkID,
        "Department::FIN && Security Level::Confidential",
        plaintext2,
      )

      // decryption
      {
        // Previous local key should not work anymore.
        const decrypter2 = new CoverCryptHybridDecryption(udk)
        expect(() => decrypter2.decrypt(ciphertext2)).toThrow()
      }

      // decrypt with new fetches KMS key
      {
        const udk2 = await client.retrieveCoverCryptUserDecryptionKey(udkID)
        const decrypter2 = new CoverCryptHybridDecryption(udk2)
        const { plaintext: cleartext } = decrypter2.decrypt(ciphertext2)
        expect(cleartext).toEqual(plaintext)
      }

      // decrypt in KMS should still work
      {
        const { plaintext: cleartext } = await client.coverCryptDecrypt(
          udkID,
          ciphertext2,
        )
        expect(cleartext).toEqual(plaintext)
      }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS CoverCrypt keys with bulk encryption/decryption",
  async () => {
    const client = new KmsClient(
      `http://${process.env.KMS_HOST || "localhost"}:9998`,
    )
    if (!(await client.up())) {
      console.log("No KMIP server. Skipping test")
      return
    }

    const { CoverCryptHybridDecryption, Policy, PolicyAxis } =
      await CoverCrypt()

    const policy = new Policy([
      new PolicyAxis(
        "Security Level",
        [
          { name: "Protected", isHybridized: false },
          { name: "Confidential", isHybridized: false },
          { name: "Top Secret", isHybridized: true },
        ],
        true,
      ),
      new PolicyAxis(
        "Department",
        [
          { name: "FIN", isHybridized: false },
          { name: "MKG", isHybridized: false },
          { name: "HR", isHybridized: false },
        ],
        false,
      ),
    ])

    // create master keys
    const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(policy)

    // recover keys and policies
    const msk = await client.retrieveCoverCryptSecretMasterKey(mskID)
    const policyMsk = Policy.fromKey(msk)

    // Policies are compared under JSON format but comparison will become a raw bytes comparison since JSON format will be removed
    const policyJson = JSON.parse(new TextDecoder().decode(policy.toBytes()))
    const policyMskJson = JSON.parse(
      new TextDecoder().decode(policyMsk.toBytes()),
    )
    expect(policyJson).toEqual(policyMskJson)
    const mpk = await client.retrieveCoverCryptPublicMasterKey(mpkID)
    const policyMpk = Policy.fromKey(mpk)
    const policyMpkJson = JSON.parse(
      new TextDecoder().decode(policyMpk.toBytes()),
    )
    expect(policyJson).toEqual(policyMpkJson)

    // create user decryption Key
    const apb =
      "(Department::MKG || Department::FIN) && Security Level::Confidential"
    const udkID = await client.createCoverCryptUserDecryptionKey(apb, mskID)
    const udk = await client.retrieveCoverCryptUserDecryptionKey(udkID)
    expect(AccessPolicy.fromKey(udk).booleanAccessPolicy).toEqual(apb)

    // encryption
    const plaintext = []
    plaintext.push(new TextEncoder().encode("abcdefgh"))
    plaintext.push(new TextEncoder().encode("azertyui"))
    plaintext.push(new TextEncoder().encode("qsdfghjk"))

    const ciphertext = await client.coverCryptBulkEncrypt(
      mpkID,
      "Department::FIN && Security Level::Confidential",
      plaintext,
    )

    {
      const { plaintext: cleartext } = await client.coverCryptBulkDecrypt(
        udkID,
        ciphertext,
      )
      expect(cleartext).toEqual(plaintext)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "Key rotation security when importing with tempered access policy",
  async () => {
    if (client !== undefined) {
      const { Policy, PolicyAxis } = await CoverCrypt()

      const policy = new Policy([
        new PolicyAxis(
          "Security",
          [
            { name: "Simple", isHybridized: false },
            { name: "TopSecret", isHybridized: true },
          ],
          true,
        ),
      ])

      // create master keys
      const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(policy)
      const ciphertext = await client.coverCryptEncrypt(
        mpkID,
        "Security::TopSecret",
        Uint8Array.from([1, 2, 3]),
      )

      const userKeyID = await client.createCoverCryptUserDecryptionKey(
        "Security::Simple",
        mskID,
      )
      const userKey = await client.retrieveCoverCryptUserDecryptionKey(
        userKeyID,
      )

      const temperedUserKeyID = await client.importCoverCryptUserDecryptionKey(
        `${userKeyID}-HACK`,
        { bytes: userKey.bytes(), policy: "Security::TopSecret" },
        {
          link: [new Link(LinkType.ParentLink, mskID)],
        },
      )
      expect(temperedUserKeyID).toEqual(`${userKeyID}-HACK`)

      await expect(async () => {
        return await client?.coverCryptDecrypt(userKeyID, ciphertext)
      }).rejects.toThrow()

      await expect(async () => {
        return await client?.coverCryptDecrypt(temperedUserKeyID, ciphertext)
      }).rejects.toThrow()

      await client.rotateCoverCryptAttributes(mskID, ["Security::TopSecret"])

      await expect(async () => {
        return await client?.coverCryptDecrypt(userKeyID, ciphertext)
      }).rejects.toThrow()

      await expect(async () => {
        return await client?.coverCryptDecrypt(temperedUserKeyID, ciphertext)
      }).rejects.toThrow()

      const newCiphertext = await client.coverCryptEncrypt(
        mpkID,
        "Security::TopSecret",
        Uint8Array.from([4, 5, 6]),
      )

      await expect(async () => {
        return await client?.coverCryptDecrypt(userKeyID, newCiphertext)
      }).rejects.toThrow()

      // TODO fix this bug, this should fail (cannot decrypt with the tempered user key)
      // await expect(async () => {
      //   return await client.coverCryptDecrypt(temperedUserKeyID, newCiphertext);
      // }).rejects.toThrow()
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "Decrypt old ciphertext after rotation",
  async () => {
    if (client !== undefined) {
      const {
        CoverCryptHybridEncryption,
        CoverCryptHybridDecryption,
        Policy,
        PolicyAxis,
      } = await CoverCrypt()

      const policy = new Policy([
        new PolicyAxis(
          "Security",
          [
            { name: "Simple", isHybridized: false },
            { name: "TopSecret", isHybridized: true },
          ],
          true,
        ),
      ])

      // create master keys
      const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(policy)
      const oldPublicKey = await client.retrieveCoverCryptPublicMasterKey(mpkID)
      const oldLocalEncryption = new CoverCryptHybridEncryption(
        policy,
        oldPublicKey,
      )

      const oldPlaintext = Uint8Array.from([1, 2, 3])
      const oldKmsCiphertext = await client.coverCryptEncrypt(
        mpkID,
        "Security::Simple",
        oldPlaintext,
      )
      const oldLocalCiphertext = oldLocalEncryption.encrypt(
        "Security::Simple",
        oldPlaintext,
      )

      const userKeyID = await client.createCoverCryptUserDecryptionKey(
        "Security::Simple",
        mskID,
      )

      const oldUserKey = await client.retrieveCoverCryptUserDecryptionKey(
        userKeyID,
      )
      const oldLocalDecryption = new CoverCryptHybridDecryption(oldUserKey)

      expect(
        (await client.coverCryptDecrypt(userKeyID, oldKmsCiphertext)).plaintext,
      ).toEqual(oldPlaintext)
      expect(oldLocalDecryption.decrypt(oldKmsCiphertext).plaintext).toEqual(
        oldPlaintext,
      )

      expect(
        (await client.coverCryptDecrypt(userKeyID, oldLocalCiphertext))
          .plaintext,
      ).toEqual(oldPlaintext)
      expect(oldLocalDecryption.decrypt(oldLocalCiphertext).plaintext).toEqual(
        oldPlaintext,
      )

      const newPolicy = await client.rotateCoverCryptAttributes(mskID, [
        "Security::Simple",
      ])
      const newPublicKey = await client.retrieveCoverCryptPublicMasterKey(mpkID)
      const newLocalEncryption = new CoverCryptHybridEncryption(
        newPolicy,
        newPublicKey,
      )
      expect(newPublicKey.bytes()).not.toEqual(oldPublicKey.bytes())

      const newPlaintext = Uint8Array.from([4, 5, 6])
      const newKmsCiphertext = await client.coverCryptEncrypt(
        mpkID,
        "Security::Simple",
        newPlaintext,
      )
      const newLocalCiphertext = newLocalEncryption.encrypt(
        "Security::Simple",
        newPlaintext,
      )

      const newUserKey = await client.retrieveCoverCryptUserDecryptionKey(
        userKeyID,
      )
      const newLocalDecryption = new CoverCryptHybridDecryption(newUserKey)

      expect(
        (await client.coverCryptDecrypt(userKeyID, oldKmsCiphertext)).plaintext,
      ).toEqual(oldPlaintext)
      expect(
        (await client.coverCryptDecrypt(userKeyID, newKmsCiphertext)).plaintext,
      ).toEqual(newPlaintext)

      expect(oldLocalDecryption.decrypt(oldKmsCiphertext).plaintext).toEqual(
        oldPlaintext,
      )
      expect(newLocalDecryption.decrypt(oldKmsCiphertext).plaintext).toEqual(
        oldPlaintext,
      )

      expect(() => oldLocalDecryption.decrypt(newKmsCiphertext)).toThrow()
      expect(newLocalDecryption.decrypt(newKmsCiphertext).plaintext).toEqual(
        newPlaintext,
      )

      expect(
        (await client.coverCryptDecrypt(userKeyID, oldLocalCiphertext))
          .plaintext,
      ).toEqual(oldPlaintext)
      expect(
        (await client.coverCryptDecrypt(userKeyID, newLocalCiphertext))
          .plaintext,
      ).toEqual(newPlaintext)

      expect(oldLocalDecryption.decrypt(oldLocalCiphertext).plaintext).toEqual(
        oldPlaintext,
      )
      expect(newLocalDecryption.decrypt(oldLocalCiphertext).plaintext).toEqual(
        oldPlaintext,
      )

      expect(() => oldLocalDecryption.decrypt(newLocalCiphertext)).toThrow()
      expect(newLocalDecryption.decrypt(newLocalCiphertext).plaintext).toEqual(
        newPlaintext,
      )
    }
  },
  {
    timeout: 10 * 1000,
  },
)

test(
  "KMS Export wrapped key and Import unwrapping key",
  async () => {
    if (client !== undefined) {
      const { Policy, PolicyAxis } = await CoverCrypt()

      const importedCertificateUniqueIdentifier = await client.importPem(
        "my_cert_id",
        new TextEncoder().encode(NIST_P256_CERTIFICATE),
        ["certificate", "x509"],
        true,
      )

      await client.importPem(
        "my_private_key_id",
        new TextEncoder().encode(NIST_P256_PRIVATE_KEY),
        ["private key", "x509"],
        true,
      )

      const policy = new Policy([
        new PolicyAxis(
          "Security Level",
          [
            { name: "Protected", isHybridized: false },
            { name: "Confidential", isHybridized: false },
            { name: "Top Secret", isHybridized: true },
          ],
          true,
        ),
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
      ])

      const [privateKeyUniqueIdentifier, _publicKeyUniqueIdentifier] =
        await client.createCoverCryptMasterKeyPair(policy)

      const decryptionKeyUniqueIdentifier =
        await client.createCoverCryptUserDecryptionKey(
          "(Department::MKG || Department::FIN) && Security Level::Confidential",
          privateKeyUniqueIdentifier,
        )

      const wrappedUserDecryptionKey = await client.getWrappedKey(
        decryptionKeyUniqueIdentifier,
        importedCertificateUniqueIdentifier,
      )

      const unwrappedKeyIdentifier = await client.importKey(
        "unwrappedUserDecryptionKey",
        wrappedUserDecryptionKey,
        true,
        null,
        true,
      )

      const initialKey = await client.getObject(decryptionKeyUniqueIdentifier)
      const unwrappedKey = await client.getObject(unwrappedKeyIdentifier)

      if (
        initialKey.type === "Certificate" ||
        initialKey.type === "CertificateRequest" ||
        initialKey.type === "OpaqueObject"
      ) {
        throw new Error(`The KmsObject ${initialKey.type} cannot be unwrapped.`)
      }
      if (
        !(initialKey.value.keyBlock.keyValue instanceof KeyValue) ||
        initialKey.value.keyBlock.keyValue.attributes == null
      ) {
        throw new Error(`KmsObject is missing the attributes property.`)
      }
      if (
        unwrappedKey.type === "Certificate" ||
        unwrappedKey.type === "CertificateRequest" ||
        unwrappedKey.type === "OpaqueObject"
      ) {
        throw new Error(`The KmsObject ${initialKey.type} cannot be unwrapped.`)
      }
      if (
        !(unwrappedKey.value.keyBlock.keyValue instanceof KeyValue) ||
        unwrappedKey.value.keyBlock.keyValue.attributes == null
      ) {
        throw new Error(`KmsObject is missing the attributes property.`)
      }

      expect(initialKey.value.keyBlock.keyValue.keyMaterial).toEqual(
        unwrappedKey.value.keyBlock.keyValue.keyMaterial,
      )
    }
  },
  {
    timeout: 10 * 1000,
  },
)

test(
  "KMS distribute userDecryptionKey between two users",
  async () => {
    if (client !== undefined) {
      const { Policy, PolicyAxis } = await CoverCrypt()

      const importedCertificateUniqueIdentifier = await client.importPem(
        "my_cert_id",
        new TextEncoder().encode(NIST_P256_CERTIFICATE),
        ["certificate", "x509"],
        true,
      )

      await client.importPem(
        "my_private_key_id",
        new TextEncoder().encode(NIST_P256_PRIVATE_KEY),
        ["private key", "x509"],
        true,
      )

      const policy = new Policy([
        new PolicyAxis(
          "Security Level",
          [
            { name: "Protected", isHybridized: false },
            { name: "Confidential", isHybridized: false },
            { name: "Top Secret", isHybridized: true },
          ],
          true,
        ),
        new PolicyAxis(
          "Department",
          [
            { name: "FIN", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "HR", isHybridized: false },
          ],
          false,
        ),
      ])

      const [privateKeyUniqueIdentifier, publicKeyUniqueIdentifier] =
        await client.createCoverCryptMasterKeyPair(policy)

      const decryptionKeyUniqueIdentifier =
        await client.createCoverCryptUserDecryptionKey(
          "(Department::MKG || Department::FIN) && Security Level::Confidential",
          privateKeyUniqueIdentifier,
        )

      const wrappedUserDecryptionKey1 = await client.getWrappedKey(
        decryptionKeyUniqueIdentifier,
        importedCertificateUniqueIdentifier,
      )

      const wrappedUserDecryptionKeyCentral = await client.importKey(
        "wrappedUserDecryptionKeyCentral",
        wrappedUserDecryptionKey1,
        false,
        null,
        true,
      )

      const fetchedWrappedUserDecryptionKey = await client.getObject(
        wrappedUserDecryptionKeyCentral,
      )

      const unwrappedKeyIdentifier = await client.importKey(
        "unwrappedUserDecryptionKey2",
        fetchedWrappedUserDecryptionKey,
        true,
        null,
        true,
      )

      const clearText = new TextEncoder().encode("abcdefgh")
      const ciphertext = await client.coverCryptEncrypt(
        publicKeyUniqueIdentifier,
        "Department::FIN && Security Level::Confidential",
        clearText,
      )

      const { plaintext } = await client.coverCryptDecrypt(
        unwrappedKeyIdentifier,
        ciphertext,
      )

      expect(clearText).toEqual(plaintext)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "Grant and revoke Access",
  async () => {
    if (client !== undefined) {
      const kmsToken2 = process.env.AUTH0_TOKEN_2

      // Create a simple KmsObject
      const keyId = await client.createSymmetricKey()
      const key = await client.getObject(keyId)
      const client2 = new KmsClient(
        `http://${process.env.KMS_HOST || "localhost"}:9998`,
        kmsToken2,
      )

      // Check that another user cannot get this object
      try {
        await client2.getObject(keyId)
      } catch (error) {
        expect(error).toMatch(/(Item not found)/i)
      }

      // Grant access to another user, to get this object
      await client.grantAccess(keyId, "client2@cosmian.com", KMIPOperations.get)
      const fetchedKey = await client2.getObject(keyId)
      expect(fetchedKey).toEqual(key)

      // List associated access to this object
      const access = await client.listAccess(keyId)
      expect(await access.text()).toEqual(
        '[{"user_id":"client2@cosmian.com","operations":["get"]}]',
      )

      // Revoke access to this user
      await client.revokeAccess(
        keyId,
        "client2@cosmian.com",
        KMIPOperations.get,
      )
      try {
        await client2.getObject(keyId)
      } catch (error) {
        expect(error).toMatch(/(Item not found)/i)
      }
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "Overwrite KeyWrappingData when importing key",
  async () => {
    if (client !== undefined) {
      const keyUid = await client.createSymmetricKey()

      const importedCertificateUniqueIdentifier = await client.importPem(
        "my_cert_id",
        new TextEncoder().encode(NIST_P256_CERTIFICATE),
        ["certificate", "x509"],
        true,
      )

      await client.importPem(
        "my_private_key_id",
        new TextEncoder().encode(NIST_P256_PRIVATE_KEY),
        ["private key", "x509"],
        true,
      )

      const wrappedKey = await client.getWrappedKey(
        keyUid,
        importedCertificateUniqueIdentifier,
      )

      // Key can be unwrapped directly specifying the private key id (matching the certificate)
      let unwrappedKeyUid = await client.importKey(
        "unwrappedSymmetricKey",
        wrappedKey,
        true,
        "my_private_key_id",
        true,
      )

      const unwrappedKey = await client.getObject(unwrappedKeyUid)

      if (
        unwrappedKey.type === "Certificate" ||
        unwrappedKey.type === "CertificateRequest" ||
        unwrappedKey.type === "OpaqueObject"
      ) {
        throw new Error(
          `The KmsObject ${unwrappedKey.type} cannot be unwrapped.`,
        )
      }

      expect(unwrappedKey.value.keyBlock.keyWrappingData).toEqual(null)

      // Key can also be unwrapped indirectly using the certificate id. In that case, KMS will locate the private key if already imported
      unwrappedKeyUid = await client.importKey(
        "unwrappedSymmetricKey",
        wrappedKey,
        true,
        "my_cert_id",
        true,
      )
    }
  },
  {
    timeout: 10 * 1000,
  },
)
