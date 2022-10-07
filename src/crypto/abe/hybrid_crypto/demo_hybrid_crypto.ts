/* tslint:disable:max-classes-per-file */

import { logger } from "../../../utils/logger"
import { AbeKeyGeneration } from "../keygen/keygen"
import { Attribute, Policy } from "../policy"
import { HybridDecryption, HybridEncryption } from "./hybrid_crypto"


export class DemoKeys {
  static topSecretMkgFinUserAccessPolicy = "Security Level::Top Secret && (Department::MKG || Department::FIN)"
  static mediumSecretMkgUserAccessPolicy = "Security Level::Medium Secret && Department::MKG"

  public policy: Uint8Array
  public publicKey: Uint8Array
  public privateKey: Uint8Array

  public plaintext: Uint8Array
  public uid: Uint8Array
  public encryptedData: Uint8Array

  public topSecretMkgFinUser: Uint8Array
  public mediumSecretMkgUser: Uint8Array

  constructor(policy: Uint8Array, publicKey: Uint8Array, privateKey: Uint8Array, topSecretMkgFinUser: Uint8Array, mediumSecretMkgUser: Uint8Array, plaintext: Uint8Array, uid: Uint8Array, encryptedData: Uint8Array) {
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
  public policy: Policy
  public keyGenerator: AbeKeyGeneration
  public demoKeys: DemoKeys
  public hybridEncryption: HybridEncryption
  public hybridDecryption: HybridDecryption

  constructor(policy: Policy, keyGenerator: AbeKeyGeneration, demoKeys: DemoKeys, hybridEncryption: HybridEncryption, hybridDecryption: HybridDecryption) {
    this.policy = policy
    this.keyGenerator = keyGenerator
    this.demoKeys = demoKeys
    this.hybridEncryption = hybridEncryption
    this.hybridDecryption = hybridDecryption
  }

  public run() {
    // Verify non regression test vector
    this.nonRegressionTests()

    // Demo of key generation
    // Generate master keys
    const masterKeys = this.keyGenerator.generateMasterKey(this.policy)
    console.log("generated the MASTER KEYS")

    // set all keys values
    this.demoKeys.policy = this.policy.toJsonEncoded()
    this.demoKeys.publicKey = masterKeys.publicKey
    this.demoKeys.privateKey = masterKeys.privateKey
    this.demoKeys.topSecretMkgFinUser = this.keyGenerator.generateUserPrivateKey(masterKeys.privateKey, DemoKeys.topSecretMkgFinUserAccessPolicy, this.policy)
    this.demoKeys.mediumSecretMkgUser = this.keyGenerator.generateUserPrivateKey(masterKeys.privateKey, DemoKeys.mediumSecretMkgUserAccessPolicy, this.policy)
    this.hybridEncryption.policy = this.policy.toJsonEncoded()
    this.hybridEncryption.publicKey = masterKeys.publicKey

    // Run demo scenario (encryption + decryption)
    this.encryptionDemo()

    // Rotate attribute
    this.policy.rotate([new Attribute('Security Level', 'Low Secret'), new Attribute('Department', 'MKG')])
    // Refresh master keys (only needed by CoverCrypt)
    const newMasterKeys = this.keyGenerator.generateMasterKey(this.policy)

    // set all keys values
    this.demoKeys.policy = this.policy.toJsonEncoded()
    this.demoKeys.publicKey = newMasterKeys.publicKey
    this.demoKeys.privateKey = newMasterKeys.privateKey
    this.demoKeys.topSecretMkgFinUser = this.keyGenerator.generateUserPrivateKey(newMasterKeys.privateKey, DemoKeys.topSecretMkgFinUserAccessPolicy, this.policy)
    this.demoKeys.mediumSecretMkgUser = this.keyGenerator.generateUserPrivateKey(newMasterKeys.privateKey, DemoKeys.mediumSecretMkgUserAccessPolicy, this.policy)
    this.hybridEncryption.policy = this.policy.toJsonEncoded()
    this.hybridEncryption.publicKey = newMasterKeys.publicKey

    // and restart again demo scenario
    this.encryptionDemo()
  }

  public nonRegressionTests() {
    const assert = (x: Uint8Array, y: Uint8Array): void => {
      if (new TextDecoder().decode(x) !== new TextDecoder().decode(y)) throw new Error("Items MUST be equal (left: " + x + " right: " + y + ")")
    }

    this.hybridDecryption.renew_key(this.demoKeys.topSecretMkgFinUser)
    const cleartext = this.hybridDecryption.decrypt(this.demoKeys.encryptedData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(this.demoKeys.plaintext, cleartext)


    this.encryptionDemo()
  }

  public encryptionDemo() {
    // Init ABE decryption cache
    this.hybridEncryption.renew_key(this.demoKeys.policy, this.demoKeys.publicKey)
    const lowSecretMkgData = this.hybridEncryption.encrypt(['Security Level::Low Secret', 'Department::MKG'], this.demoKeys.uid, this.demoKeys.plaintext)
    const topSecretMkgData = this.hybridEncryption.encrypt(['Security Level::Top Secret', ' Department::MKG'], this.demoKeys.uid, this.demoKeys.plaintext)
    const lowSecretFinData = this.hybridEncryption.encrypt(['Security Level::Low Secret', 'Department::FIN'], this.demoKeys.uid, this.demoKeys.plaintext)
    logger.log(() => "lowSecretFinData: " + lowSecretFinData)

    // Finish with cache destroying
    this.hybridEncryption.destroyInstance()

    const assert = (x: Uint8Array, y: Uint8Array): void => {
      if (new TextDecoder().decode(x) !== new TextDecoder().decode(y)) throw new Error("Items MUST be equal (left: " + x + " right: " + y + ")")
    }

    // The medium secret marketing user can successfully decrypt a low security marketing message :
    this.hybridDecryption.renew_key(this.demoKeys.mediumSecretMkgUser)
    let cleartext = this.hybridDecryption.decrypt(lowSecretMkgData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
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
    this.hybridDecryption.renew_key(this.demoKeys.topSecretMkgFinUser)
    cleartext = this.hybridDecryption.decrypt(lowSecretMkgData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(this.demoKeys.plaintext, cleartext)

    cleartext = this.hybridDecryption.decrypt(topSecretMkgData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(this.demoKeys.plaintext, cleartext)

    cleartext = this.hybridDecryption.decrypt(lowSecretFinData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(this.demoKeys.plaintext, cleartext)
  }
}
