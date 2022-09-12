import { EncryptionDecryptionDemo } from "../../../../src/demos/abe/demo_hybrid_crypto"
import { GpswHybridDecryption } from "../../../../src/crypto/abe/hybrid_crypto/gpsw/decryption"
import { GpswHybridEncryption } from "../../../../src/crypto/abe/hybrid_crypto/gpsw/encryption"
import { GpswMasterKeyGeneration } from "../../../../src/crypto/abe/keygen/gpsw/gpsw_crypt_keygen"
import { GpswDemoKeys } from "../../../../src/demos/abe/gpsw/demo_keys"

test('gpsw', async () => {

  const keyGeneration = new GpswMasterKeyGeneration()
  const demoKeys = new GpswDemoKeys()
  const hybridEncryption = new GpswHybridEncryption(demoKeys.policy, demoKeys.publicKey)
  const hybridDecryption = new GpswHybridDecryption(demoKeys.topSecretMkgFinUser)
  const encryptionDemo = new EncryptionDecryptionDemo(
    keyGeneration, demoKeys, hybridEncryption, hybridDecryption
  )
  encryptionDemo.run()
})
