import { CoverCrypt, KmsClient, hexDecode, hexEncode } from "cloudproof_js"
import { bytesPolicy, policy } from "./utils.mjs"

process.removeAllListeners("warning") // To remove experimental fetch warnings
;(async () => {
  const useKms = process.argv.includes("--kms")

  const accessPolicyIndex = process.argv.indexOf("--accessPolicy") + 1
  const accessPolicy = process.argv[accessPolicyIndex]

  const privateMasterKeyBytesIndex =
    process.argv.indexOf("--privateMasterKeyBytesHexEncoded") + 1
  const privateMasterKeyBytes = hexDecode(
    process.argv[privateMasterKeyBytesIndex],
  )

  const privateMasterKeyUIDIndex =
    process.argv.indexOf("--privateMasterKeyUID") + 1
  let privateMasterKeyUID = process.argv[privateMasterKeyUIDIndex]

  let userKeyUID = null
  let userKeyBytes

  if (useKms) {
    const client = new KmsClient(
      `http://${process.env.KMS_HOST || "localhost"}:9998`,
      process.env.AUTH0_TOKEN_1,
    )

    if (!privateMasterKeyUID) {
      const uniqueIdentifier = Math.random().toString(36).slice(2, 7)
      privateMasterKeyUID = await client.importCoverCryptSecretMasterKey(
        uniqueIdentifier,
        { bytes: privateMasterKeyBytes, policy: bytesPolicy },
      )
    }

    userKeyUID = await client.createCoverCryptUserDecryptionKey(
      accessPolicy,
      privateMasterKeyUID,
    )
    userKeyBytes = (
      await client.retrieveCoverCryptUserDecryptionKey(userKeyUID)
    ).bytes()
  } else {
    const { CoverCryptKeyGeneration } = await CoverCrypt()

    const generation = new CoverCryptKeyGeneration()
    userKeyBytes = generation.generateUserSecretKey(
      privateMasterKeyBytes,
      accessPolicy,
      policy,
    )
  }

  process.stdout.write(
    JSON.stringify({
      uid: userKeyUID,
      bytesHexEncoded: hexEncode(userKeyBytes),
    }),
  )
})()
