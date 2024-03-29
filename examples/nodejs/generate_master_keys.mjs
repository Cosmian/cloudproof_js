import { CoverCrypt, KmsClient, hexEncode } from "cloudproof_js"
import { bytesPolicy, policy } from "./utils.mjs"

process.removeAllListeners("warning") // To remove experimental fetch warnings
;(async () => {
  const useKms = process.argv.includes("--kms")

  let publicKeyBytes
  let privateKeyBytes

  let publicKeyUID = null
  let privateKeyUID = null

  if (useKms) {
    const client = new KmsClient(
      `http://${process.env.KMS_HOST || "localhost"}:9998`,
      process.env.AUTH0_TOKEN_1,
    )
    const keys = await client.createCoverCryptMasterKeyPair(bytesPolicy)

    privateKeyUID = keys[0]
    publicKeyUID = keys[1]

    publicKeyBytes = (
      await client.retrieveCoverCryptPublicMasterKey(publicKeyUID)
    ).bytes()
    privateKeyBytes = (
      await client.retrieveCoverCryptSecretMasterKey(privateKeyUID)
    ).bytes()
  } else {
    const { CoverCryptKeyGeneration } = await CoverCrypt()

    const generation = new CoverCryptKeyGeneration()

    const masterKeys = generation.generateMasterKeys(policy)
    publicKeyBytes = masterKeys.publicKey
    privateKeyBytes = masterKeys.secretKey
  }

  process.stdout.write(
    JSON.stringify({
      publicKeyBytesHexEncoded: hexEncode(publicKeyBytes),
      privateKeyBytesHexEncoded: hexEncode(privateKeyBytes),

      publicKeyUID,
      privateKeyUID,
    }),
  )
})()
