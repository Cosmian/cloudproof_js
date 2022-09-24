import { GpswHybridDecryption } from 'crypto/abe/core/hybrid_crypto/gpsw/decryption'
import { GpswHybridEncryption } from 'crypto/abe/core/hybrid_crypto/gpsw/encryption'
import { GpswMasterKeyGeneration } from 'crypto/abe/core/keygen/gpsw_crypt_keygen'
import { EncryptionDecryptionDemo } from '../../common/demo_hybrid_crypto'
import { GpswDemoKeys } from './demo_keys'

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
