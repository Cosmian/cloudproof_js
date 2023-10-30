import {
  AccessPolicyKms,
  CoverCrypt,
  KmsClient,
  hexDecode,
  hexEncode,
} from "cloudproof_js"

process.removeAllListeners("warning") // To remove experimental fetch warnings
;(async () => {
  const useKms = process.argv.includes("--kms")

  const userKeyBytesIndex = process.argv.indexOf("--userKeyBytesHexEncoded") + 1
  const userKeyBytes = hexDecode(process.argv[userKeyBytesIndex])

  const userKeyAccessPolicyIndex =
    process.argv.indexOf("--userKeyAccessPolicy") + 1
  const userKeyAccessPolicy = process.argv[userKeyAccessPolicyIndex]

  const userKeyUIDIndex = process.argv.indexOf("--userKeyUID") + 1
  let userKeyUID = process.argv[userKeyUIDIndex]

  const encryptedDataHexEncodedIndex =
    process.argv.indexOf("--encryptedDataHexEncoded") + 1
  const encryptedData = hexDecode(process.argv[encryptedDataHexEncodedIndex])

  let authenticationData
  if (process.argv.includes("--authentication-data")) {
    const authenticationDataIndex =
      process.argv.indexOf("--authentication-data") + 1
    authenticationData = new TextEncoder().encode(
      process.argv[authenticationDataIndex],
    )
  }

  let result
  if (useKms) {
    const client = new KmsClient(
      `http://${process.env.KMS_HOST || "localhost"}:9998`,
      process.env.AUTH0_TOKEN_1,
    )
    const userKeyAccessPolicyKms = new AccessPolicyKms(userKeyAccessPolicy)

    if (!userKeyUID) {
      const uniqueIdentifier = Math.random().toString(36).slice(2, 7)
      userKeyUID = await client.importCoverCryptUserDecryptionKey(
        uniqueIdentifier,
        { bytes: userKeyBytes, policy: userKeyAccessPolicyKms },
      )
    }

    result = await client.coverCryptDecrypt(userKeyUID, encryptedData, {
      authenticationData,
    })
  } else {
    const { CoverCryptHybridDecryption } = await CoverCrypt()

    const encryption = new CoverCryptHybridDecryption(userKeyBytes)

    result = encryption.decrypt(encryptedData, {
      authenticationData,
    })
  }

  process.stdout.write(
    JSON.stringify({
      headerMetadata: hexEncode(result.headerMetadata),
      plaintext: hexEncode(result.plaintext),
    }),
  )
})()
