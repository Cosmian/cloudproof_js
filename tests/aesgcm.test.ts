import { expect, test } from "vitest"
import { AesGcm } from ".."
import { bytesEquals } from "../src/utils/utils"
import { randomBytes } from "crypto"

/* Importing the functions from the AESGCM library. */
const { Aes256Gcm } = await AesGcm()

test("Standard aes256gcm", async () => {
  const key = new Uint8Array(32)
  const nonce = new Uint8Array(12)

  for (let plaintextSize = 1; plaintextSize <= 100; plaintextSize++) {
    for (
      let authenticatedDataSize = 0;
      authenticatedDataSize <= 20;
      authenticatedDataSize += 5
    ) {
      const plaintext = randomBytes(plaintextSize)
      const authenticatedData = randomBytes(authenticatedDataSize)
      const ciphertext = Aes256Gcm.encrypt(
        plaintext,
        key,
        nonce,
        authenticatedData,
      )
      const cleartext = Aes256Gcm.decrypt(
        ciphertext,
        key,
        nonce,
        authenticatedData,
      )
      expect(bytesEquals(plaintext, cleartext))
    }
  }
})
