import { CoverCryptHybridDecryption } from "../../src/crypto/abe/core/hybrid_crypto/cover_crypt/decryption"
import { CoverCryptHybridEncryption } from "../../src/crypto/abe/core/hybrid_crypto/cover_crypt/encryption"
import { CoverCryptKeyGeneration } from "../../src/crypto/abe/core/keygen/cover_crypt"
import { CoverCryptDemoKeys } from "./cover_crypt_demo_keys"
import { EncryptionDecryptionDemo } from "./hybrid_crypto_utils"

test("cover_crypt", async () => {
  const keyGeneration = new CoverCryptKeyGeneration()
  const demoKeys = new CoverCryptDemoKeys()
  const hybridEncryption = new CoverCryptHybridEncryption(
    demoKeys.policy,
    demoKeys.publicKey
  )
  const hybridDecryption = new CoverCryptHybridDecryption(
    demoKeys.topSecretMkgFinUser
  )
  const encryptionDemo = new EncryptionDecryptionDemo(
    keyGeneration,
    demoKeys,
    hybridEncryption,
    hybridDecryption
  )
  await encryptionDemo.run()
})
