// import { CoverCryptHybridDecryption } from "../../crypto/abe/hybrid_crypto/cover_crypt/decryption"
// import { CoverCryptDemoKeys } from "../../crypto/abe/hybrid_crypto/cover_crypt/demo_keys"
// import { CoverCryptHybridEncryption } from "../../crypto/abe/hybrid_crypto/cover_crypt/encryption"
// import { EncryptionDecryptionDemo } from "../../crypto/abe/hybrid_crypto/demo_hybrid_crypto"
import { CoverCryptMasterKeyGeneration } from "../../crypto/abe/keygen/cover_crypt/cover_crypt_keygen"

test('cover_crypt', async () => {

  const keyGeneration = new CoverCryptMasterKeyGeneration()
  // const demoKeys = new CoverCryptDemoKeys()
  // const hybridEncryption = new CoverCryptHybridEncryption(demoKeys.policy, demoKeys.publicKey)
  // const hybridDecryption = new CoverCryptHybridDecryption(demoKeys.topSecretMkgFinUser)
  // const encryptionDemo = new EncryptionDecryptionDemo(
  //   keyGeneration, demoKeys, hybridEncryption, hybridDecryption
  // )
  // encryptionDemo.run()

})
