/* tslint:disable:max-classes-per-file */

import { HybridDecryption } from "../../../../src/crypto/abe/interfaces/decryption"
import { HybridEncryption } from "../../../../src/crypto/abe/interfaces/encryption"
import { AbeKeyGeneration } from "../../../../src/crypto/abe/interfaces/keygen"
import { Policy, PolicyAxis } from "../../../../src/crypto/abe/interfaces/policy"
import { logger } from "../../../../src/utils/logger"
import { hexEncode } from "../../../../src/utils/utils"

export class DemoKeys {
  static topSecretMkgFinUserAccessPolicy =
    "Security Level::Top Secret && (Department::MKG || Department::FIN)"

  static mediumSecretMkgUserAccessPolicy =
    "Security Level::Medium Secret && Department::MKG"

  public policy: Uint8Array
  public publicKey: Uint8Array
  public privateKey: Uint8Array

  public plaintext: Uint8Array
  public uid: Uint8Array
  public encryptedData: Uint8Array

  public topSecretMkgFinUser: Uint8Array
  public mediumSecretMkgUser: Uint8Array

  constructor(
    policy: Uint8Array,
    publicKey: Uint8Array,
    privateKey: Uint8Array,
    topSecretMkgFinUser: Uint8Array,
    mediumSecretMkgUser: Uint8Array,
    plaintext: Uint8Array,
    uid: Uint8Array,
    encryptedData: Uint8Array
  ) {
    this.policy = policy
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.topSecretMkgFinUser = topSecretMkgFinUser
    this.mediumSecretMkgUser = mediumSecretMkgUser
    this.plaintext = plaintext
    this.uid = uid
    this.encryptedData = encryptedData
  }
}

export class EncryptionDecryptionDemo {
  public keyGenerator: AbeKeyGeneration
  public demoKeys: DemoKeys
  public hybridEncryption: HybridEncryption
  public hybridDecryption: HybridDecryption

  constructor(
    keyGenerator: AbeKeyGeneration,
    demoKeys: DemoKeys,
    hybridEncryption: HybridEncryption,
    hybridDecryption: HybridDecryption
  ) {
    this.keyGenerator = keyGenerator
    this.demoKeys = demoKeys
    this.hybridEncryption = hybridEncryption
    this.hybridDecryption = hybridDecryption
  }

  public run() {
    // Verify non regression test vector
    this.nonRegressionTests()

    // Demo of key generation
    const policy = new Policy(
      [
        new PolicyAxis(
          "Security Level",
          [
            "Protected",
            "Low Secret",
            "Medium Secret",
            "High Secret",
            "Top Secret",
          ],
          true
        ),
        new PolicyAxis("Department", ["R&D", "HR", "MKG", "FIN"], false),
      ],
      100
    )
    // Generate master keys
    const masterKeys = this.keyGenerator.generateMasterKeys(policy)

    // set all keys values
    this.demoKeys.policy = policy.toJsonEncoded()
    this.demoKeys.publicKey = masterKeys.publicKey
    this.demoKeys.privateKey = masterKeys.privateKey
    this.demoKeys.topSecretMkgFinUser =
      this.keyGenerator.generateUserDecryptionKey(
        masterKeys.privateKey,
        DemoKeys.topSecretMkgFinUserAccessPolicy,
        policy
      )
    this.demoKeys.mediumSecretMkgUser =
      this.keyGenerator.generateUserDecryptionKey(
        masterKeys.privateKey,
        DemoKeys.mediumSecretMkgUserAccessPolicy,
        policy
      )
    this.hybridEncryption.policy = policy.toJsonEncoded()
    this.hybridEncryption.publicKey = masterKeys.publicKey

    // Run demo scenario (encryption + decryption)
    this.encryptionDemo()

    // Rotate attribute
    const newPolicy = this.keyGenerator.rotateAttributes(
      ["Security Level::Low Secret", "Department::MKG"],
      policy
    )
    // Refresh master keys (only needed by CoverCrypt)
    const newMasterKeys = this.keyGenerator.generateMasterKeys(newPolicy)

    // set all keys values
    this.demoKeys.policy = newPolicy.toJsonEncoded()
    this.demoKeys.publicKey = newMasterKeys.publicKey
    this.demoKeys.privateKey = newMasterKeys.privateKey
    this.demoKeys.topSecretMkgFinUser =
      this.keyGenerator.generateUserDecryptionKey(
        newMasterKeys.privateKey,
        DemoKeys.topSecretMkgFinUserAccessPolicy,
        newPolicy
      )
    this.demoKeys.mediumSecretMkgUser =
      this.keyGenerator.generateUserDecryptionKey(
        newMasterKeys.privateKey,
        DemoKeys.mediumSecretMkgUserAccessPolicy,
        newPolicy
      )
    this.hybridEncryption.policy = newPolicy.toJsonEncoded()
    this.hybridEncryption.publicKey = newMasterKeys.publicKey

    // and restart again demo scenario
    this.encryptionDemo()
  }

  public nonRegressionTests() {
    const assert = (x: Uint8Array, y: Uint8Array): void => {
      if (new TextDecoder().decode(x) !== new TextDecoder().decode(y)) {
        throw new Error(
          "Items MUST be equal (left: " + x + " right: " + y + ")"
        )
      }
    }

    this.hybridDecryption.renewKey(this.demoKeys.topSecretMkgFinUser)
    const cleartext = this.hybridDecryption.decrypt(this.demoKeys.encryptedData)
    logger.log(
      () => "Decryption succeed: " + new TextDecoder().decode(cleartext)
    )
    assert(this.demoKeys.plaintext, cleartext)

    this.encryptionDemo()
  }

  public encryptionDemo() {
    // Init ABE decryption cache
    this.hybridEncryption.renewKey(
      this.demoKeys.policy,
      this.demoKeys.publicKey
    )
    const lowSecretMkgData = this.hybridEncryption.encrypt(
      ["Security Level::Low Secret", "Department::MKG"],
      this.demoKeys.uid,
      this.demoKeys.plaintext
    )
    const topSecretMkgData = this.hybridEncryption.encrypt(
      ["Security Level::Top Secret", " Department::MKG"],
      this.demoKeys.uid,
      this.demoKeys.plaintext
    )
    const lowSecretFinData = this.hybridEncryption.encrypt(
      ["Security Level::Low Secret", "Department::FIN"],
      this.demoKeys.uid,
      this.demoKeys.plaintext
    )
    logger.log(() => "lowSecretMkgData: " + hexEncode(lowSecretMkgData))

    // Finish with cache destroying
    this.hybridEncryption.destroyInstance()

    const assert = (x: Uint8Array, y: Uint8Array): void => {
      if (new TextDecoder().decode(x) !== new TextDecoder().decode(y))
        throw new Error(
          "Items MUST be equal (left: " + x + " right: " + y + ")"
        )
    }

    // The medium secret marketing user can successfully decrypt a low security marketing message :
    this.hybridDecryption.renewKey(this.demoKeys.mediumSecretMkgUser)
    let cleartext = this.hybridDecryption.decrypt(lowSecretMkgData)
    logger.log(
      () => "Decryption succeed: " + new TextDecoder().decode(cleartext)
    )
    assert(this.demoKeys.plaintext, cleartext)

    // .. however it can neither decrypt a marketing message with higher security:
    try {
      this.hybridDecryption.decrypt(topSecretMkgData)
    } catch (e) {
      logger.log(() => "User does not have the right access policy (" + e + ")")
    }

    // … nor decrypt a message from another department even with a lower security:
    try {
      this.hybridDecryption.decrypt(lowSecretFinData)
    } catch (e) {
      logger.log(() => "User does not have the right access policy (" + e + ")")
    }

    // The "top secret-marketing-financial" user can decrypt messages from the marketing department OR the financial department that have a security level of Top Secret or below
    // As expected, the top secret marketing financial user can successfully decrypt all messages
    this.hybridDecryption.renewKey(this.demoKeys.topSecretMkgFinUser)
    cleartext = this.hybridDecryption.decrypt(lowSecretMkgData)
    logger.log(
      () => "Decryption succeed: " + new TextDecoder().decode(cleartext)
    )
    assert(this.demoKeys.plaintext, cleartext)

    cleartext = this.hybridDecryption.decrypt(topSecretMkgData)
    logger.log(
      () => "Decryption succeed: " + new TextDecoder().decode(cleartext)
    )
    assert(this.demoKeys.plaintext, cleartext)

    cleartext = this.hybridDecryption.decrypt(lowSecretFinData)
    logger.log(
      () => "Decryption succeed: " + new TextDecoder().decode(cleartext)
    )
    assert(this.demoKeys.plaintext, cleartext)
  }
}
