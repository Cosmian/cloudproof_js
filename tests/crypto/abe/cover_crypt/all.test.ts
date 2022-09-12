import { CoverCryptDemoKeys } from "../../../../src/demos/abe/cover_crypt/demo_keys"
import { EncryptionDecryptionDemo } from "../../../../src/demos/abe/demo_hybrid_crypto"
import { CoverCryptHybridDecryption } from "../../../../src/crypto/abe/hybrid_crypto/cover_crypt/decryption"
import { CoverCryptHybridEncryption } from "../../../../src/crypto/abe/hybrid_crypto/cover_crypt/encryption"
import { CoverCryptMasterKeyGeneration } from "../../../../src/crypto/abe/keygen/cover_crypt/cover_crypt_keygen"

test('cover_crypt', async () => {

  const keyGeneration = new CoverCryptMasterKeyGeneration()
  const demoKeys = new CoverCryptDemoKeys()
  const hybridEncryption = new CoverCryptHybridEncryption(demoKeys.policy, demoKeys.publicKey)
  const hybridDecryption = new CoverCryptHybridDecryption(demoKeys.topSecretMkgFinUser)
  const encryptionDemo = new EncryptionDecryptionDemo(
    keyGeneration, demoKeys, hybridEncryption, hybridDecryption
  )
  encryptionDemo.run()

})
