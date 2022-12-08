import { CoverCrypt, KmsClient, Policy, PolicyAxis } from "cloudproof_js"

const assert = (x, y) => {
  if (new TextDecoder().decode(x) !== new TextDecoder().decode(y))
    throw new Error("Items MUST be equal (left: " + x + " right: " + y + ")")
}

//
// Creating a policy
//
const policy = new Policy([
  new PolicyAxis("Department", ["R&D", "HR", "FIN", "MKG"], false),
  new PolicyAxis(
    "Security Level",
    ["Protected", "Low Secret", "Medium Secret", "High Secret", "Top Secret"],
    true,
  ),
])

;(async () => {
  const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))

  //
  // Generating the master keys
  //
  // create master keys
  const [privateMasterKeyUID, publicKeyUID] =
    await client.createCoverCryptMasterKeyPair(policy)

  // fetch the keys from the KMS
  const privateMasterKey = await client.retrieveCoverCryptSecretMasterKey(
    privateMasterKeyUID,
  )
  // eslint-disable-next-line no-unused-vars
  const privateMasterKeyBytes = privateMasterKey.bytes()
  const publicKey = await client.retrieveCoverCryptPublicMasterKey(publicKeyUID)
  const publicKeyBytes = publicKey.bytes()

  //
  // Encrypting Data
  //
  const { CoverCryptHybridDecryption, CoverCryptHybridEncryption } =
    await CoverCrypt()

  // a low secret marketing message
  const lowSecretMkgData = new TextEncoder().encode("low_secret_mkg_message")
  // The constructor also accepts the public key object returned by the KMS
  let encrypter = new CoverCryptHybridEncryption(policy, publicKeyBytes)
  const lowSecretMkgCiphertext = encrypter.encrypt(
    "Department::MKG && Security Level::Low Secret",
    lowSecretMkgData,
  )

  // a top secret marketing message
  const topSecretMkgData = new TextEncoder().encode("top_secret_mkg_message")
  encrypter = new CoverCryptHybridEncryption(policy, publicKeyBytes)
  const topSecretMkgCiphertext = encrypter.encrypt(
    "Department::MKG && Security Level::Top Secret",
    topSecretMkgData,
  )

  // a low secret finance message
  const lowSecretFinData = new TextEncoder().encode("low_secret_fin_message")
  encrypter = new CoverCryptHybridEncryption(policy, publicKeyBytes)
  const lowSecretFinCiphertext = encrypter.encrypt(
    "Department::FIN && Security Level::Low Secret",
    lowSecretFinData,
  )

  //
  // Generating User Decryption Keys
  //
  // the medium secret marketing user
  const mediumSecretMkgAccess =
    "Department::MKG && Security Level::Medium Secret"
  const mediumSecretMkgUserKeyUid = await client.createCoverCryptUserDecryptionKey(
    mediumSecretMkgAccess,
    privateMasterKeyUID,
  )
  const mediumSecretMkgUserKey = await client.retrieveCoverCryptUserDecryptionKey(
    mediumSecretMkgUserKeyUid,
  )
  const mediumSecretMkgUserKeyBytes = mediumSecretMkgUserKey.bytes()

  // the top secret marketing financial user
  const topSecretMkgFinAccess =
    "(Department::MKG || Department::FIN) && Security Level::Top Secret"
  const topSecretMkgFinUserKeyUid = await client.createCoverCryptUserDecryptionKey(
    topSecretMkgFinAccess,
    privateMasterKeyUID,
  )
  const topSecretMkgFinUserKey = await client.retrieveCoverCryptUserDecryptionKey(
    topSecretMkgFinUserKeyUid,
  )
  const topSecretMkgFinUserKeyBytes = topSecretMkgFinUserKey.bytes()

  // the top secret financial user
  const topSecretFinAccess = "(Department::FIN) && Security Level::Top Secret"
  const topSecretFinUserKeyUid = await client.createCoverCryptUserDecryptionKey(
    topSecretFinAccess,
    privateMasterKeyUID,
  )
  const topSecretFinUserKey = await client.retrieveCoverCryptUserDecryptionKey(
    topSecretFinUserKeyUid,
  )
  // eslint-disable-next-line no-unused-vars
  const topSecretFinUserKeyBytes = topSecretFinUserKey.bytes()

  //
  // Decrypting Ciphertexts
  //
  //  note: the constructor also accepts the private key object returned by the KMS
  const lowSecretMkgCleartext = new CoverCryptHybridDecryption(
    mediumSecretMkgUserKeyBytes,
  ).decrypt(lowSecretMkgCiphertext)
  assert(lowSecretMkgCleartext, lowSecretMkgData)

  // .. however it can neither decrypt a marketing message with higher security:
  try {
    // will throw
    new CoverCryptHybridDecryption(mediumSecretMkgUserKey).decrypt(
      topSecretMkgCiphertext,
    )
  } catch (error) {
    // ==> the user is not be able to decrypt
  }

  // ... nor decrypt a message from another department even with a lower security:
  try {
    // will throw
    new CoverCryptHybridDecryption(topSecretFinUserKey).decrypt(
      lowSecretMkgCiphertext,
    )
  } catch (error) {
    // ==> the user is not be able to decrypt
  }

  // lowSecretMkgCiphertext
  const lowSecretMkgCleartext2 = new CoverCryptHybridDecryption(
    topSecretMkgFinUserKeyBytes,
  ).decrypt(lowSecretMkgCiphertext)
  assert(lowSecretMkgData, lowSecretMkgCleartext2)

  // lowSecretFinCiphertext
  const topSecretMkgCleartext = new CoverCryptHybridDecryption(
    topSecretMkgFinUserKeyBytes,
  ).decrypt(topSecretMkgCiphertext)
  assert(topSecretMkgData, topSecretMkgCleartext)

  // lowSecretFinCiphertext
  const lowSecretFinCleartext = new CoverCryptHybridDecryption(
    topSecretMkgFinUserKeyBytes,
  ).decrypt(lowSecretFinCiphertext)
  assert(lowSecretFinData, lowSecretFinCleartext)

  //
  // Rotating Attributes
  //
  // retrieve the key
  const originalMediumSecretMkgUserKey =
    await client.retrieveCoverCryptUserDecryptionKey(mediumSecretMkgUserKeyUid)

  // Now revoke the MKG attribute - all active keys will be rekeyed
  client.rotateCoverCryptAttributes(privateMasterKeyUID, ["Department::MKG"])

  // retrieve the rekeyed public key
  const rekeyedPublicKey = await client.retrieveCoverCryptPublicMasterKey(publicKeyUID)
  // retrieve the rekeyed user decryption key
  const rekeyedMediumSecretMkgUserKey =
    await client.retrieveCoverCryptUserDecryptionKey(mediumSecretMkgUserKeyUid)

  //
  // creating a new medium secret marketing message
  //
  const mediumSecretMkgData = new TextEncoder().encode(
    "medium_secret_mkg_message",
  )
  encrypter = new CoverCryptHybridEncryption(policy, rekeyedPublicKey)
  const newMediumSecretMkgCiphertext = encrypter.encrypt(
    "Department::MKG && Security Level::Medium Secret",
    mediumSecretMkgData,
  )

  //
  // decrypting the messages with the rekeyed key
  //
  // lowSecretMkgCiphertext
  const oldMediumSecretMkgCleartext = new CoverCryptHybridDecryption(
    rekeyedMediumSecretMkgUserKey,
  ).decrypt(lowSecretMkgCiphertext)
  assert(lowSecretMkgData, oldMediumSecretMkgCleartext)

  // newMediumSecretMkgCiphertext
  const newMediumSecretMkgCleartext = new CoverCryptHybridDecryption(
    rekeyedMediumSecretMkgUserKey,
  ).decrypt(newMediumSecretMkgCiphertext)
  assert(mediumSecretMkgData, newMediumSecretMkgCleartext)

  //
  // decrypting the messages with the NON rekeyed key
  //
  // lowSecretMkgCiphertext
  const plaintext_ = new CoverCryptHybridDecryption(
    originalMediumSecretMkgUserKey,
  ).decrypt(lowSecretMkgCiphertext)
  assert(lowSecretMkgData, plaintext_)

  // newMediumSecretMkgCiphertext
  try {
    // will throw
    new CoverCryptHybridDecryption(originalMediumSecretMkgUserKey).decrypt(
      newMediumSecretMkgCiphertext,
    )
  } catch (error) {
    // ==> the non rekeyed key cannot decrypt new message after rotation
  }

  console.log("Succeeded!")
})()
