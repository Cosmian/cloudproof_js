import {
  AccessPolicyKms,
  Attributes,
  KmsClient,
  Link,
  LinkType,
  PolicyKms,
  SymmetricKeyAlgorithm,
  TTLV,
  VendorAttributes,
  toTTLV,
} from "cloudproof_kms_js"

import { CoverCrypt, hexEncode } from ".."
import { toByteArray } from "base64-js"

import "dotenv/config"
import { beforeAll, expect, test } from "vitest"
import {
  NIST_P256_CERTIFICATE,
  NIST_P256_PRIVATE_KEY,
} from "./data/certificates"

const kmsToken = process.env.AUTH0_TOKEN_1
let client: KmsClient

beforeAll(async () => {
  client = new KmsClient(
    `http://${process.env.KMS_HOST ?? "localhost"}:9998`,
    kmsToken,
  )
})

test(
  "KMS create, retrieve and import Covercrypt master keys",
  async () => {
    // Defining policy
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    // Create master key pair and retrieve them
    const [secretKeyUniqueIdentifier, publicKeyUniqueIdentifier] =
      await client.createCoverCryptMasterKeyPair(bytesPolicy)

    const publicKey = await client.retrieveCoverCryptPublicMasterKey(
      publicKeyUniqueIdentifier,
    )
    const secretKey = await client.retrieveCoverCryptSecretMasterKey(
      secretKeyUniqueIdentifier,
    )

    // Import Covercrypt public and secret keys
    const importedPublicKeyUniqueIdentifier =
      await client.importCoverCryptPublicMasterKey(
        `${publicKeyUniqueIdentifier}-imported`,
        publicKey,
      )
    const importedSecretKeyUniqueIdentifier =
      await client.importCoverCryptSecretMasterKey(
        `${secretKeyUniqueIdentifier}-imported`,
        secretKey,
      )

    const importedPublicKey = await client.retrieveCoverCryptPublicMasterKey(
      importedPublicKeyUniqueIdentifier,
    )
    const importedSecretKey = await client.retrieveCoverCryptSecretMasterKey(
      importedSecretKeyUniqueIdentifier,
    )
    expect(importedPublicKey.bytes()).toEqual(publicKey.bytes())
    expect(importedSecretKey.bytes()).toEqual(secretKey.bytes())

    // Revoke Covercrypt public key
    await client.revokeCoverCryptPublicMasterKey(
      importedPublicKeyUniqueIdentifier,
      "revoke",
    )
    try {
      await client.retrieveCoverCryptPublicMasterKey(
        importedPublicKeyUniqueIdentifier,
      )
    } catch (error) {
      expect(error).toMatch(/(Item not found)/i)
    }
    try {
      await client.retrieveCoverCryptSecretMasterKey(
        importedSecretKeyUniqueIdentifier,
      )
    } catch (error) {
      expect(error).toMatch(/(Item not found)/i)
    }
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS create, import, and locate Covercrypt user decryption key",
  async () => {
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    // Create user decryption Key
    const [mskID] = await client.createCoverCryptMasterKeyPair(bytesPolicy)
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

    // Import user decryption key
    const udk = await client.retrieveCoverCryptUserDecryptionKey(
      uniqueIdentifier,
    )
    await client.importCoverCryptUserDecryptionKey(
      `${uniqueIdentifier}-imported`,
      udk,
    )
    const udkImported = await client.retrieveCoverCryptUserDecryptionKey(
      `${uniqueIdentifier}-imported`,
    )
    expect(udk.bytes()).toEqual(udkImported.bytes())
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "KMS Locate several keys with same tag",
  async () => {
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    // create Covercrypt master key pair (1 & 2)
    const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(
      bytesPolicy,
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
  },
  {
    timeout: 30 * 1000,
  },
)

test("KMS CoverCrypt Policy", async () => {
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
  const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

  // TTLV Test
  const ttlv = toTTLV(bytesPolicy.toVendorAttribute())
  const children = ttlv.value as TTLV[]
  expect(children[0].value).toEqual(VendorAttributes.VENDOR_ID_COSMIAN)
  expect(children[1].value).toEqual(
    VendorAttributes.VENDOR_ATTR_COVER_CRYPT_POLICY,
  )
  expect(children[2].value).toEqual(hexEncode(policy.toBytes()))
  // Vendor Attributes test
  const va = bytesPolicy.toVendorAttribute()
  const att = new Attributes("PrivateKey")
  att.vendorAttributes = [va]
  const policy_ = PolicyKms.fromAttributes(att)
  expect(policy_).toEqual(policy)
})

test("KMS CoverCrypt Access Policy", async () => {
  await CoverCrypt()

  const apb = new AccessPolicyKms(
    "(Department::MKG || Department::FIN) && Security Level::Confidential",
  )
  // vendor attributes
  const va = await apb.toVendorAttribute()
  const attributes = new Attributes("PrivateKey")
  attributes.vendorAttributes = [va]
  expect(AccessPolicyKms.fromAttributes(attributes)).toEqual(apb)
})

test(
  "KMS CoverCrypt encryption and decryption",
  async () => {
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    // create master keys
    const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(
      bytesPolicy,
    )

    // recover keys and policies
    const msk = await client.retrieveCoverCryptSecretMasterKey(mskID)
    const policyMsk = PolicyKms.fromKey(msk)

    // Policies are compared under JSON format but comparison will become a raw bytes comparison since JSON format will be removed
    const policyJson = JSON.parse(new TextDecoder().decode(policy.toBytes()))
    const policyMskJson = JSON.parse(
      new TextDecoder().decode(policyMsk.toBytes()),
    )
    expect(policyJson).toEqual(policyMskJson)
    const mpk = await client.retrieveCoverCryptPublicMasterKey(mpkID)
    const policyMpk = PolicyKms.fromKey(mpk)
    const policyMpkJson = JSON.parse(
      new TextDecoder().decode(policyMpk.toBytes()),
    )
    expect(policyJson).toEqual(policyMpkJson)

    // create user decryption Key
    const apb =
      "(Department::MKG || Department::FIN) && Security Level::Confidential"
    const udkID = await client.createCoverCryptUserDecryptionKey(apb, mskID)
    const udk = await client.retrieveCoverCryptUserDecryptionKey(udkID)
    expect(AccessPolicyKms.fromKey(udk).booleanAccessPolicy).toEqual(apb)

    // encryption
    const plaintext = new TextEncoder().encode("abcdefgh")
    const ciphertext = await client.coverCryptEncrypt(
      mpkID,
      "Department::FIN && Security Level::Confidential",
      plaintext,
    )

    {
      const { plaintext: cleartext } = await client.coverCryptDecrypt(
        udkID,
        ciphertext,
      )
      expect(cleartext).toEqual(plaintext)
    }

    // rotate
    await client.rekeyCoverCryptAccessPolicy(
      mskID,
      "Department::FIN || Department::MKG",
    )

    const rotatedMsk = await client.retrieveCoverCryptSecretMasterKey(mskID)
    expect(rotatedMsk.bytes()).not.toEqual(msk.bytes())
    const rotatedMpk = await client.retrieveCoverCryptPublicMasterKey(mpkID)
    expect(rotatedMpk.bytes()).not.toEqual(mpk.bytes())

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
      const decrypter2 = new CoverCryptHybridDecryption(udk.bytes())
      expect(() => decrypter2.decrypt(ciphertext2)).toThrow()
    }

    // decrypt with new fetches KMS key
    {
      const udk2 = await client.retrieveCoverCryptUserDecryptionKey(udkID)
      const decrypter2 = new CoverCryptHybridDecryption(udk2.bytes())
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    // create master keys
    const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(
      bytesPolicy,
    )

    // recover keys and policies
    const msk = await client.retrieveCoverCryptSecretMasterKey(mskID)
    const policyMsk = PolicyKms.fromKey(msk)

    // Policies are compared under JSON format but comparison will become a raw bytes comparison since JSON format will be removed
    const policyJson = JSON.parse(new TextDecoder().decode(policy.toBytes()))
    const policyMskJson = JSON.parse(
      new TextDecoder().decode(policyMsk.toBytes()),
    )
    expect(policyJson).toEqual(policyMskJson)
    const mpk = await client.retrieveCoverCryptPublicMasterKey(mpkID)
    const policyMpk = PolicyKms.fromKey(mpk)
    const policyMpkJson = JSON.parse(
      new TextDecoder().decode(policyMpk.toBytes()),
    )
    expect(policyJson).toEqual(policyMpkJson)

    // create user decryption Key
    const apb =
      "(Department::MKG || Department::FIN) && Security Level::Confidential"
    const udkID = await client.createCoverCryptUserDecryptionKey(apb, mskID)
    const udk = await client.retrieveCoverCryptUserDecryptionKey(udkID)
    expect(AccessPolicyKms.fromKey(udk).booleanAccessPolicy).toEqual(apb)

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
  "Key rekey security when importing with tempered access policy",
  async () => {
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    // create master keys
    const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(
      bytesPolicy,
    )
    const ciphertext = await client.coverCryptEncrypt(
      mpkID,
      "Security::TopSecret",
      Uint8Array.from([1, 2, 3]),
    )

    const userKeyID = await client.createCoverCryptUserDecryptionKey(
      "Security::Simple",
      mskID,
    )
    const userKey = await client.retrieveCoverCryptUserDecryptionKey(userKeyID)

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

    await client.rekeyCoverCryptAccessPolicy(mskID, "Security::TopSecret")

    await expect(async () => {
      return await client?.coverCryptDecrypt(userKeyID, ciphertext)
    }).rejects.toThrow()

    // After rekeying, the temperedUserKey gains no access to TopSecret
    await expect(async () => {
      return await client.coverCryptDecrypt(temperedUserKeyID, ciphertext)
    }).rejects.toThrow()

    const newCiphertext = await client.coverCryptEncrypt(
      mpkID,
      "Security::TopSecret",
      Uint8Array.from([4, 5, 6]),
    )

    await expect(async () => {
      return await client?.coverCryptDecrypt(userKeyID, newCiphertext)
    }).rejects.toThrow()

    // Cannot decrypt with the tempered user key)
    await expect(async () => {
      return await client.coverCryptDecrypt(temperedUserKeyID, newCiphertext)
    }).rejects.toThrow()
  },
  {
    timeout: 30 * 1000,
  },
)

test(
  "Decrypt old ciphertext after rekeying",
  async () => {
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    // create master keys
    const [mskID, mpkID] = await client.createCoverCryptMasterKeyPair(
      bytesPolicy,
    )
    const oldPublicKey = await client.retrieveCoverCryptPublicMasterKey(mpkID)
    const oldLocalEncryption = new CoverCryptHybridEncryption(
      policy,
      oldPublicKey.bytes(),
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
    const oldLocalDecryption = new CoverCryptHybridDecryption(
      oldUserKey.bytes(),
    )

    expect(
      (await client.coverCryptDecrypt(userKeyID, oldKmsCiphertext)).plaintext,
    ).toEqual(oldPlaintext)
    expect(oldLocalDecryption.decrypt(oldKmsCiphertext).plaintext).toEqual(
      oldPlaintext,
    )

    expect(
      (await client.coverCryptDecrypt(userKeyID, oldLocalCiphertext)).plaintext,
    ).toEqual(oldPlaintext)
    expect(oldLocalDecryption.decrypt(oldLocalCiphertext).plaintext).toEqual(
      oldPlaintext,
    )

    await client.rekeyCoverCryptAccessPolicy(mskID, "Security::Simple")
    const newPublicKey = await client.retrieveCoverCryptPublicMasterKey(mpkID)
    const newLocalEncryption = new CoverCryptHybridEncryption(
      policy,
      newPublicKey.bytes(),
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
    const newLocalDecryption = new CoverCryptHybridDecryption(
      newUserKey.bytes(),
    )

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
      (await client.coverCryptDecrypt(userKeyID, oldLocalCiphertext)).plaintext,
    ).toEqual(oldPlaintext)
    expect(
      (await client.coverCryptDecrypt(userKeyID, newLocalCiphertext)).plaintext,
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
  },
  {
    timeout: 10 * 1000,
  },
)

test(
  "KMS distribute userDecryptionKey between two users",
  async () => {
    const { Policy, PolicyAxis } = await CoverCrypt()

    const importedCertificateUniqueIdentifier = await client.importCertificate(
      "my_cert_id",
      toByteArray(NIST_P256_CERTIFICATE),
      ["certificate", "x509"],
      true,
      {
        privateKeyIdentifier: "my_private_key_id",
      },
    )

    await client.importPrivateKey(
      "my_private_key_id",
      toByteArray(NIST_P256_PRIVATE_KEY),
      ["private key", "x509"],
      true,
      {
        certificateIdentifier: "my_cert_id",
      },
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

    const bytesPolicy: PolicyKms = new PolicyKms(policy.toBytes())

    const [privateKeyUniqueIdentifier, publicKeyUniqueIdentifier] =
      await client.createCoverCryptMasterKeyPair(bytesPolicy)

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
  },
  {
    timeout: 30 * 1000,
  },
)
