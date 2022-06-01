import { logger } from "../../../../utils/logger"
import { CoverCryptHybridDecryption } from "./decryption"
import { CoverCryptDemoKeys } from "./demo_keys"
import { CoverCryptHybridEncryption } from "./encryption"


export class CoverCryptHybridEncryptionDemo {

  public static run() {

    // Init ABE decryption cache
    const abeEncryption = new CoverCryptHybridEncryption(CoverCryptDemoKeys.policy, CoverCryptDemoKeys.publicKey)

    const lowSecretMkgData = abeEncryption.encrypt(['Security Level::Low Secret', 'Department::MKG'], CoverCryptDemoKeys.uid, CoverCryptDemoKeys.plaintext)
    const topSecretMkgData = abeEncryption.encrypt(['Security Level::Top Secret', 'Department::MKG'], CoverCryptDemoKeys.uid, CoverCryptDemoKeys.plaintext)
    const lowSecretFinData = abeEncryption.encrypt(['Security Level::Low Secret', 'Department::FIN'], CoverCryptDemoKeys.uid, CoverCryptDemoKeys.plaintext)

    // Finish with cache destroying
    abeEncryption.destroyInstance()

    const assert = (x: Uint8Array, y: Uint8Array): void => {
      if (new TextDecoder().decode(x) !== new TextDecoder().decode(y)) throw new Error("Items MUST be equal (left: " + x + " right: " + y + ")")
    }

    // The medium secret marketing user can successfully decrypt a low security marketing message :
    let cleartext = new CoverCryptHybridDecryption(CoverCryptDemoKeys.mediumSecretMkgUser).decrypt(lowSecretMkgData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(CoverCryptDemoKeys.plaintext, cleartext)

    // .. however it can neither decrypt a marketing message with higher security:
    try {
      new CoverCryptHybridDecryption(CoverCryptDemoKeys.mediumSecretMkgUser).decrypt(topSecretMkgData)
    } catch (e) {
      logger.log(() => "User does not have the right access policy (" + e + ")")
    }

    // … nor decrypt a message from another department even with a lower security:
    try {
      new CoverCryptHybridDecryption(CoverCryptDemoKeys.mediumSecretMkgUser).decrypt(lowSecretFinData)
    } catch (e) {
      logger.log(() => "User does not have the right access policy (" + e + ")")
    }

    // The "top secret-marketing-financial" user can decrypt messages from the marketing department OR the financial department that have a security level of Top Secret or below
    // As expected, the top secret marketing financial user can successfully decrypt all messages
    cleartext = new CoverCryptHybridDecryption(CoverCryptDemoKeys.topSecretMkgFinUser).decrypt(lowSecretMkgData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(CoverCryptDemoKeys.plaintext, cleartext)

    cleartext = new CoverCryptHybridDecryption(CoverCryptDemoKeys.topSecretMkgFinUser).decrypt(topSecretMkgData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(CoverCryptDemoKeys.plaintext, cleartext)

    cleartext = new CoverCryptHybridDecryption(CoverCryptDemoKeys.topSecretMkgFinUser).decrypt(lowSecretFinData)
    logger.log(() => "Decryption succeed: " + new TextDecoder().decode(cleartext))
    assert(CoverCryptDemoKeys.plaintext, cleartext)
  }
}
