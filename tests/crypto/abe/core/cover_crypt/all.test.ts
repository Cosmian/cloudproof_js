import { CoverCryptHybridDecryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/decryption"
import { CoverCryptHybridEncryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/encryption"
import { CoverCryptKeyGeneration } from "crypto/abe/core/keygen/cover_crypt"
import { EncryptionDecryptionDemo } from "../../common/demo_hybrid_crypto"
import { CoverCryptDemoKeys } from "./demo_keys"

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
  encryptionDemo.run()
})
