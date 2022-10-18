import { GpswHybridDecryption } from "../../src/crypto/abe/core/hybrid_crypto/gpsw/decryption"
import { GpswHybridEncryption } from "../../src/crypto/abe/core/hybrid_crypto/gpsw/encryption"
import { GpswMasterKeyGeneration } from "../../src/crypto/abe/core/keygen/gpsw_crypt"
import { EncryptionDecryptionDemo } from "./hybrid_crypto_utils"
import { GpswDemoKeys } from "./gpsw_demo_keys"

test("gpsw", async () => {
  const keyGeneration = new GpswMasterKeyGeneration()
  const demoKeys = new GpswDemoKeys()
  const hybridEncryption = new GpswHybridEncryption(
    demoKeys.policy,
    demoKeys.publicKey
  )
  const hybridDecryption = new GpswHybridDecryption(
    demoKeys.topSecretMkgFinUser
  )
  const encryptionDemo = new EncryptionDecryptionDemo(
    keyGeneration,
    demoKeys,
    hybridEncryption,
    hybridDecryption
  )
  encryptionDemo.run()
})
