import { hexDecode } from "cloudproof_js"
import { spawn } from "node:child_process"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
;(async () => {
  const TEST_COUNT = process.argv[2]

  for (let index = 1; index <= TEST_COUNT; index++) {
    console.log(`Test ${index}/${TEST_COUNT}`)

    const masterKeys = JSON.parse(await run("generate_master_keys.mjs"))

    const encryptedDataHexEncoded = await run("encrypt.mjs", [
      "--publicMasterKeyBytesHexEncoded",
      masterKeys.publicKeyBytesHexEncoded,
      "--publicMasterKeyUID",
      masterKeys.publicKeyUID || "",
      "--dataToEncrypt",
      "Hello World",
      "--header-metadata",
      "Some metadata",
      "--authentication-data",
      "Authentication Data",
      "--accessPolicy",
      "Department::HR && Security Level::Medium Secret",
    ])

    {
      // Medium Secret User Key should be able to decrypt

      const userKey = JSON.parse(
        await run("generate_user_key.mjs", [
          "--privateMasterKeyBytesHexEncoded",
          masterKeys.privateKeyBytesHexEncoded,
          "--privateMasterKeyUID",
          masterKeys.privateKeyUID || "",
          "--accessPolicy",
          "Department::HR && Security Level::Medium Secret",
        ]),
      )

      const decryptedDataHexEncoded = JSON.parse(
        await run("decrypt.mjs", [
          "--authentication-data",
          "Authentication Data",
          "--userKeyBytesHexEncoded",
          userKey.bytesHexEncoded,
          "--encryptedDataHexEncoded",
          encryptedDataHexEncoded,
          "--userKeyUID",
          userKey.uid || "",
          "--userKeyAccessPolicy",
          "Department::HR && Security Level::Medium Secret",
        ]),
      )

      const decryptedData = new TextDecoder().decode(
        hexDecode(decryptedDataHexEncoded.plaintext),
      )
      if (decryptedData !== "Hello World") {
        throw new Error(
          `Decrypted data should be "Hello World". "${decryptedData}" found.`,
        )
      }

      const decryptedMetadata = new TextDecoder().decode(
        hexDecode(decryptedDataHexEncoded.headerMetadata),
      )
      if (decryptedMetadata !== "Some metadata") {
        throw new Error(
          `Decrypted data should be "Some metadata". "${decryptedMetadata}" found.`,
        )
      }
    }

    {
      // Medium Secret User Key shouldn't be able to decrypt with wrong Authentication Data

      const userKey = JSON.parse(
        await run("generate_user_key.mjs", [
          "--authentication-data",
          "Authentication Data",
          "--privateMasterKeyBytesHexEncoded",
          masterKeys.privateKeyBytesHexEncoded,
          "--privateMasterKeyUID",
          masterKeys.privateKeyUID || "",
          "--accessPolicy",
          "Department::HR && Security Level::Medium Secret",
        ]),
      )

      await run(
        "decrypt.mjs",
        [
          "--authentication-data",
          "WRONG AUTHENTICATION DATA !!!",
          "--userKeyBytesHexEncoded",
          userKey.bytesHexEncoded,
          "--encryptedDataHexEncoded",
          encryptedDataHexEncoded,
          "--userKeyUID",
          userKey.uid || "",
          "--userKeyAccessPolicy",
          "Department::HR && Security Level::Medium Secret",
        ],
        true,
      )
    }

    {
      // High Secret User Key should be able to decrypt

      const userKey = JSON.parse(
        await run("generate_user_key.mjs", [
          "--privateMasterKeyBytesHexEncoded",
          masterKeys.privateKeyBytesHexEncoded,
          "--privateMasterKeyUID",
          masterKeys.privateKeyUID || "",
          "--accessPolicy",
          "Department::HR && Security Level::High Secret",
        ]),
      )

      const decryptedDataHexEncoded = JSON.parse(
        await run("decrypt.mjs", [
          "--authentication-data",
          "Authentication Data",
          "--userKeyBytesHexEncoded",
          userKey.bytesHexEncoded,
          "--encryptedDataHexEncoded",
          encryptedDataHexEncoded,
          "--userKeyUID",
          userKey.uid || "",
          "--userKeyAccessPolicy",
          "Department::HR && Security Level::High Secret",
        ]),
      )

      const decryptedData = new TextDecoder().decode(
        hexDecode(decryptedDataHexEncoded.plaintext),
      )
      if (decryptedData !== "Hello World") {
        throw new Error(
          `Decrypted data should be "Hello World". "${decryptedData}" found.`,
        )
      }

      const decryptedMetadata = new TextDecoder().decode(
        hexDecode(decryptedDataHexEncoded.headerMetadata),
      )
      if (decryptedMetadata !== "Some metadata") {
        throw new Error(
          `Decrypted data should be "Some metadata". "${decryptedMetadata}" found.`,
        )
      }
    }

    {
      // Low Secret User Key shouldn't be able to decrypt

      const userKey = JSON.parse(
        await run("generate_user_key.mjs", [
          "--privateMasterKeyBytesHexEncoded",
          masterKeys.privateKeyBytesHexEncoded,
          "--privateMasterKeyUID",
          masterKeys.privateKeyUID || "",
          "--accessPolicy",
          "Department::HR && Security Level::Low Secret",
        ]),
      )

      // Should fail
      await run(
        "decrypt.mjs",
        [
          "--authentication-data",
          "Authentication Data",
          "--userKeyBytesHexEncoded",
          userKey.bytesHexEncoded,
          "--encryptedDataHexEncoded",
          encryptedDataHexEncoded,
          "--userKeyUID",
          userKey.uid || "",
          "--userKeyAccessPolicy",
          "Department::HR && Security Level::Low Secret",
        ],
        true,
      )
    }
  }
})()

/**
 * Run a sub-script to do one task
 *
 * @param filename name of the file to run
 * @param args additional arguments
 * @param shouldCrash return empty string if the program crash and shouldCrash is true
 */
async function run(filename, args = [], shouldCrash = false) {
  args = [path.join(dirname(fileURLToPath(import.meta.url)), filename), ...args]

  const useKms = Math.random() < 0.5
  if (useKms) {
    args.push("--kms")
  }

  console.log(`\t Running ${filename} ${useKms ? "(using KMS)" : ""}`)

  const process = spawn("node", args)

  let result = null

  process.stdout.on("data", (data) => {
    if (shouldCrash) {
      throw Error(`${filename} should crash but ${data} received.`)
    } else {
      result = new TextDecoder().decode(data)
    }
  })
  process.stderr.on("data", (data) => {
    if (shouldCrash) {
      result = ""
    } else {
      throw new Error(`Error while running ${filename}: ${data}`)
    }
  })

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    if (result !== null) return result
  }
}
