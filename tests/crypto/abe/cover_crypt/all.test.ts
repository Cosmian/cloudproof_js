import { CoverCryptHybridDecryption } from "../../../../src/crypto/abe/hybrid_crypto/cover_crypt/decryption"
import { CoverCryptDemoKeys } from "../../../../src/crypto/abe/hybrid_crypto/cover_crypt/demo_keys"
import { CoverCryptHybridEncryption } from "../../../../src/crypto/abe/hybrid_crypto/cover_crypt/encryption"
import { EncryptionDecryptionDemo } from "../../../../src/crypto/abe/hybrid_crypto/demo_hybrid_crypto"
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
