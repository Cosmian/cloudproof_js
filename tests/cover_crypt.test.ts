import * as fs from "fs"
import { expect, test } from "vitest"

import { KmsClient, PolicyKms } from "cloudproof_kms_js"
import { CoverCrypt } from ".."
import { NonRegressionVector } from "./cover_crypt.non_regression_vector"

/* Importing the functions from the CoverCrypt library. */
const {
  CoverCryptKeyGeneration,
  CoverCryptHybridEncryption,
  CoverCryptHybridDecryption,
  Policy,
  PolicyAxis,
} = await CoverCrypt()
const keyGenerator = new CoverCryptKeyGeneration()

test("Demo using Wasm only", async () => {
  //
  // Creating a Policy
  //
  const policy = new Policy([
    new PolicyAxis(
      "Security Level", // this axis name is `Security Level`
      [
        { name: "Protected", isHybridized: false },
        { name: "Confidential", isHybridized: false },
        // the following attribute is hybridized allowing post-quantum resistance
        { name: "Top Secret", isHybridized: true },
      ],
      true, // this is a hierarchical axis
    ),
    new PolicyAxis(
      "Department", // this axis name
      [
        { name: "R&D", isHybridized: false },
        { name: "HR", isHybridized: false },
        { name: "MKG", isHybridized: false },
        { name: "FIN", isHybridized: false },
      ],
      false, // this is NOT a hierarchical axis
    ),
  ])

  //
  // Generating the master keys
  //
  const masterKeys = keyGenerator.generateMasterKeys(policy)
  const publicKeyBytes = masterKeys.publicKey
  const masterSecretKeyBytes = masterKeys.secretKey

  //
  // Encrypting Data
  //
  const encryption = new CoverCryptHybridEncryption(policy, publicKeyBytes)

  // a protected marketing message
  const protectedMkgData = new TextEncoder().encode("protected_mkg_message")
  const protectedMkgCiphertext = encryption.encrypt(
    "Department::MKG && Security Level::Protected",
    protectedMkgData,
  )

  // a top-secret marketing message
  const topSecretMkgData = new TextEncoder().encode("top_secret_mkg_message")
  const topSecretMkgCiphertext = encryption.encrypt(
    "Department::MKG && Security Level::Top Secret",
    topSecretMkgData,
  )

  // a protected finance message
  const protectedFinData = new TextEncoder().encode("low_secret_fin_message")
  const protectedFinCiphertext = encryption.encrypt(
    "Department::FIN && Security Level::Protected",
    protectedFinData,
  )

  //
  // Generate User Decryption Keys
  //

  // the confidential marketing user
  // This user can decrypt messages from the marketing department only, with a security level of Confidential or below:
  const confidentialMkgUserKeyBytes = keyGenerator.generateUserSecretKey(
    masterSecretKeyBytes,
    "Department::MKG && Security Level::Confidential",
    policy,
  )

  // the top secret marketing financial user
  // This user can decrypt messages from the marketing department OR the financial department with a security level of Top Secret or below:
  const topSecretMkgFinUserKeyBytes = keyGenerator.generateUserSecretKey(
    masterSecretKeyBytes,
    "(Department::MKG || Department::FIN) && Security Level::Top Secret",
    policy,
  )

  //
  // Decrypting Ciphertexts
  //
  const protectedMkgCleartext = new CoverCryptHybridDecryption(
    confidentialMkgUserKeyBytes,
  ).decrypt(protectedMkgCiphertext)
  expect(protectedMkgData).toEqual(protectedMkgCleartext.plaintext)

  try {
    // will throw
    new CoverCryptHybridDecryption(confidentialMkgUserKeyBytes).decrypt(
      topSecretMkgCiphertext,
    )
  } catch (error) {
    // ==> the user is not able to decrypt
  }

  try {
    // will throw
    new CoverCryptHybridDecryption(confidentialMkgUserKeyBytes).decrypt(
      protectedFinCiphertext,
    )
  } catch (error) {
    // ==> the user is not able to decrypt
  }

  // protectedMkgCiphertext
  const protectedMkgCleartext2 = new CoverCryptHybridDecryption(
    topSecretMkgFinUserKeyBytes,
  ).decrypt(protectedMkgCiphertext)
  expect(protectedMkgData).toEqual(protectedMkgCleartext2.plaintext)

  // topSecretFinCiphertext
  const topSecretMkgCleartext = new CoverCryptHybridDecryption(
    topSecretMkgFinUserKeyBytes,
  ).decrypt(topSecretMkgCiphertext)
  expect(topSecretMkgData).toEqual(topSecretMkgCleartext.plaintext)

  // protectedFinCiphertext
  const protectedFinCleartext = new CoverCryptHybridDecryption(
    topSecretMkgFinUserKeyBytes,
  ).decrypt(protectedFinCiphertext)
  expect(protectedFinData).toEqual(protectedFinCleartext.plaintext)
})

test("Demo using KMS", async () => {
  //
  // Creating a Policy
  //
  const policy = new Policy([
    new PolicyAxis(
      "Security Level", // this axis name is `Security Level`
      [
        { name: "Protected", isHybridized: false },
        { name: "Confidential", isHybridized: false },
        // the following attribute is hybridized allowing post-quantum resistance
        { name: "Top Secret", isHybridized: true },
      ],
      true, // this is a hierarchical axis
    ),
    new PolicyAxis(
      "Department", // this axis name
      [
        { name: "HR", isHybridized: false },
        { name: "MKG", isHybridized: false },
        { name: "FIN", isHybridized: false },
      ],
      false, // this is NOT a hierarchical axis
    ),
  ])

  //
  // Generating the master keys
  //
  const client = new KmsClient(
    `http://${process.env.KMS_HOST || "localhost"}:9998`,
  )

  const policyKms = new PolicyKms(policy.toBytes())

  if (!(await client.up())) {
    console.error("No KMIP server. Skipping test")
    return
  }

  const masterKeys = await client.createCoverCryptMasterKeyPair(policyKms)
  const masterSecretKeyUID = masterKeys[0]
  const masterPublicKeyUID = masterKeys[1]

  const masterPublicKeyBytes = (
    await client.retrieveCoverCryptPublicMasterKey(masterPublicKeyUID)
  ).bytes()

  const masterSecretKeyBytes = (
    await client.retrieveCoverCryptSecretMasterKey(masterSecretKeyUID)
  ).bytes()

  //
  // Encrypting Data
  //
  // a protected marketing message
  const protectedMkgData = new TextEncoder().encode("protected_mkg_message")
  const protectedMkgCiphertext = await client.coverCryptEncrypt(
    masterPublicKeyUID,
    "Department::MKG && Security Level::Protected",
    protectedMkgData,
  )

  // a top-secret marketing message
  const topSecretMkgData = new TextEncoder().encode("top_secret_mkg_message")
  const topSecretMkgCiphertext = await client.coverCryptEncrypt(
    masterPublicKeyUID,
    "Department::MKG && Security Level::Top Secret",
    topSecretMkgData,
  )

  // a protected finance message
  const protectedFinData = new TextEncoder().encode("low_secret_fin_message")
  const protectedFinCiphertext = await client.coverCryptEncrypt(
    masterPublicKeyUID,
    "Department::FIN && Security Level::Protected",
    protectedFinData,
  )

  //
  // Generate User Decryption Keys
  //

  // the confidential marketing user
  // This user can decrypt messages from the marketing department only, with a security level of Confidential or below:
  const confidentialMkgAccess =
    "Department::MKG && Security Level::Confidential"
  const confidentialMkgUserKeyUid =
    await client.createCoverCryptUserDecryptionKey(
      confidentialMkgAccess,
      masterSecretKeyUID,
    )

  // the top secret marketing financial user
  // This user can decrypt messages from the marketing department OR the financial department with a security level of Top Secret or below:
  const topSecretMkgFinAccess =
    "(Department::MKG || Department::FIN) && Security Level::Top Secret"
  const topSecretMkgFinUserKeyUid =
    await client.createCoverCryptUserDecryptionKey(
      topSecretMkgFinAccess,
      masterSecretKeyUID,
    )

  // exporting the keys
  // As with the master keys, the user keys can be exported to be used with the native library
  const confidentialMkgUserKey =
    await client.retrieveCoverCryptUserDecryptionKey(confidentialMkgUserKeyUid)
  const confidentialMkgUserKeyBytes = confidentialMkgUserKey.bytes()

  const topSecretMkgFinUserKey =
    await client.retrieveCoverCryptUserDecryptionKey(topSecretMkgFinUserKeyUid)
  const topSecretMkgFinUserKeyBytes = topSecretMkgFinUserKey.bytes()

  //
  // Decrypting Ciphertexts
  //
  const protectedMkgCleartext = await client.coverCryptDecrypt(
    confidentialMkgUserKeyUid,
    protectedMkgCiphertext,
  )
  expect(protectedMkgData).toEqual(protectedMkgCleartext.plaintext)

  // .. however, it can neither decrypt a marketing message with higher security:
  try {
    // will throw
    await client.coverCryptDecrypt(
      confidentialMkgUserKeyUid,
      topSecretMkgCiphertext,
    )
  } catch (error) {
    // ==> the user is not able to decrypt
  }

  // ... nor decrypt a message from another department even with lower security:
  try {
    // will throw
    await client.coverCryptDecrypt(
      confidentialMkgUserKeyUid,
      protectedFinCiphertext,
    )
  } catch (error) {
    // ==> the user is not able to decrypt
  }

  // As expected, the top-secret marketing financial user can successfully decrypt all messages
  // protectedMkgCiphertext
  const protectedMkgCleartext2 = await client.coverCryptDecrypt(
    topSecretMkgFinUserKeyUid,
    protectedMkgCiphertext,
  )
  expect(protectedMkgData).toEqual(protectedMkgCleartext2.plaintext)

  // protectedFinCiphertext
  const topSecretMkgCleartext = await client.coverCryptDecrypt(
    topSecretMkgFinUserKeyUid,
    topSecretMkgCiphertext,
  )
  expect(topSecretMkgData).toEqual(topSecretMkgCleartext.plaintext)

  // protectedFinCiphertext
  const protectedFinCleartext = await client.coverCryptDecrypt(
    topSecretMkgFinUserKeyUid,
    protectedFinCiphertext,
  )
  expect(protectedFinData).toEqual(protectedFinCleartext.plaintext)

  // Before rotating attributes, let us make a local copy of the
  // current `confidential marketing user` to show what happens to non-refreshed keys after
  // the attribute rotation.

  // retrieve the key
  const oldConfidentialMkgUserKey =
    await client.retrieveCoverCryptUserDecryptionKey(confidentialMkgUserKeyUid)

  // Now rekey the MKG attribute - all active keys will be rekeyed
  await client.rekeyCoverCryptAccessPolicy(
    masterSecretKeyUID,
    "Department::MKG",
  )

  // creating a new confidential marketing message
  const confidentialMkgData = new TextEncoder().encode(
    "confidential_mkg_message",
  )
  const newConfidentialMkgCiphertext = await client.coverCryptEncrypt(
    masterPublicKeyUID,
    "Department::MKG && Security Level::Confidential",
    confidentialMkgData,
  )

  // The automatically rekeyed confidential marketing user key can still decrypt
  // the "old" `protected marketing` message, as well as the new `confidential marketing` message.
  // protectedMkgCiphertext

  // protectedMkgCiphertext
  const oldProtectedMkgCleartext = await client.coverCryptDecrypt(
    confidentialMkgUserKeyUid,
    protectedMkgCiphertext,
  )
  expect(protectedMkgData).toEqual(oldProtectedMkgCleartext.plaintext)

  // newConfidentialMkgCiphertext
  const newConfidentialMkgCleartext = await client.coverCryptDecrypt(
    confidentialMkgUserKeyUid,
    newConfidentialMkgCiphertext,
  )
  expect(confidentialMkgData).toEqual(newConfidentialMkgCleartext.plaintext)

  // However, the old, non-rekeyed `confidential marketing` user key can still decrypt the old `protected marketing` message
  // but **not** the new `confidential marketing` message:

  // protectedMkgCiphertext
  const protectedMkgCleartext3 = new CoverCryptHybridDecryption(
    oldConfidentialMkgUserKey.bytes(),
  ).decrypt(protectedMkgCiphertext)
  expect(protectedMkgData).toEqual(protectedMkgCleartext3.plaintext)

  // newConfidentialMkgCiphertext
  try {
    // will throw
    let x = new CoverCryptHybridDecryption(
      oldConfidentialMkgUserKey.bytes(),
    ).decrypt(newConfidentialMkgCiphertext)
    console.log(new TextDecoder("utf-8").decode(x.plaintext))
  } catch (error) {
    // ==> the non rekeyed key cannot decrypt the new message
  }

  // Prune: remove old keys for the MKG attribute

  await client.pruneCoverCryptAccessPolicy(
    masterSecretKeyUID,
    "Department::MKG",
  )

  // decrypting old messages will fail even with the rekeyed key
  try {
    // will throw
    await client.coverCryptDecrypt(
      confidentialMkgUserKeyUid,
      protectedMkgCiphertext,
    )
  } catch (error) {
    // ==> the pruned key cannot decrypt the old message
  }

  // decrypting the new message will still work
  {
    const newConfidentialMkgCleartext = await client.coverCryptDecrypt(
      confidentialMkgUserKeyUid,
      newConfidentialMkgCiphertext,
    )
    expect(confidentialMkgData).toEqual(newConfidentialMkgCleartext.plaintext)
  }

  //
  // Edit Policy
  //

  // Rename attribute "Department::MKG" to "Department::Marketing"
  await client.renameCoverCryptAttribute(
    masterSecretKeyUID,
    "Department::MKG",
    "Marketing",
  )

  // decryption rights have not been modified even for previously generated keys and ciphers
  {
    const newConfidentialMkgCleartext = await client.coverCryptDecrypt(
      confidentialMkgUserKeyUid,
      newConfidentialMkgCiphertext,
    )
    expect(confidentialMkgData).toEqual(newConfidentialMkgCleartext.plaintext)
  }

  // new encryption or user key generation must use the new attribute name
  const topSecretMarketingData = new TextEncoder().encode(
    "top_secret_marketing_message",
  )
  const topSecretMarketingCiphertext = await client.coverCryptEncrypt(
    masterPublicKeyUID,
    "Department::Marketing && Security Level::Top Secret",
    topSecretMarketingData,
  )

  // new "Marketing" message can still be decrypted with "MKG" keys
  const topSecretMarketingCleartext = await client.coverCryptDecrypt(
    topSecretMkgFinUserKeyUid,
    topSecretMarketingCiphertext,
  )
  expect(topSecretMarketingData).toEqual(topSecretMarketingCleartext.plaintext)

  // Add new attributes
  await client.addCoverCryptAttribute(
    masterSecretKeyUID,
    "Department::R&D",
    false,
  )

  // encrypt a message for the newly created `R&D` attribute
  const protectedRdData = new TextEncoder().encode("protected_rd_message")
  const protectedRdCiphertext = await client.coverCryptEncrypt(
    masterPublicKeyUID,
    "Department::R&D && Security Level::Protected",
    protectedRdData,
  )

  // and generate a user key with access rights for this attribute
  const confidentialRdFinUserKeyUid =
    await client.createCoverCryptUserDecryptionKey(
      "(Department::R&D || Department::FIN) && Security Level::Confidential",
      masterSecretKeyUID,
    )

  // decrypt the R&D message with the new user key
  {
    const protectedRdCleartext = await client.coverCryptDecrypt(
      confidentialRdFinUserKeyUid,
      protectedRdCiphertext,
    )
    expect(protectedRdData).toEqual(protectedRdCleartext.plaintext)
  }

  // Disable attributes
  await client.disableCoverCryptAttribute(masterSecretKeyUID, "Department::R&D")

  // new data encryption for `Department::R&D` will fail
  try {
    // will throw
    await client.coverCryptEncrypt(
      masterPublicKeyUID,
      "Department::R&D && Security Level::Protected",
      protectedRdData,
    )
  } catch (error) {
    // ==> disabled attributes can no longer be used to encrypt data
  }

  // Decryption of R&D ciphertext is still possible
  {
    const protectedRdCleartext = await client.coverCryptDecrypt(
      confidentialRdFinUserKeyUid,
      protectedRdCiphertext,
    )
    expect(protectedRdData).toEqual(protectedRdCleartext.plaintext)
  }

  // Remove attributes
  await client.removeCoverCryptAttribute(masterSecretKeyUID, "Department::R&D")

  // Removed attributes can no longer be used to encrypt or decrypt
  try {
    await client.coverCryptDecrypt(
      confidentialRdFinUserKeyUid,
      protectedRdCiphertext,
    )
  } catch (error) {
    // ==> unable to decrypt data for a removed attribute
  }
})

test("Generate non-regression tests vector", async () => {
  const nonRegVector = await NonRegressionVector.generate()

  // Uncomment this code to write new test vector on disk
  fs.writeFile(
    "node_modules/non_regression_vector.json",
    nonRegVector.toJson(),
    (err: any) => {
      if (err !== null) {
        console.error(err)
      }
      // file written successfully
    },
  )
})

test("Verify non-regression vector", async () => {
  const testFolder = "tests/data/cover_crypt/non_regression/"
  fs.readdirSync(testFolder).forEach((file: string) => {
    const content = fs.readFileSync(testFolder + file, "utf8")
    const nrv = NonRegressionVector.fromJson(content)
    nrv.verify()
  })
})
