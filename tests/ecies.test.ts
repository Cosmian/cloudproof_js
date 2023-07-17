import { expect, test } from "vitest"
import { Ecies } from ".."
import { randomBytes } from "crypto"
import { bytesEquals } from "../src/utils/utils"

/* Importing the functions from the ECIES library. */
const { EciesSalsaSealBox } = await Ecies()

test("Ecies SalsaSealBox", async () => {
  const keyPair = EciesSalsaSealBox.generateKeyPair()

  for (let plaintextSize = 1; plaintextSize <= 100; plaintextSize++) {
    for (
      let authenticatedDataSize = 0;
      authenticatedDataSize <= 20;
      authenticatedDataSize += 5
    ) {
      const plaintext = randomBytes(plaintextSize)
      const authenticatedData = randomBytes(authenticatedDataSize)
      const ciphertext = EciesSalsaSealBox.encrypt(
        plaintext,
        keyPair[0],
        authenticatedData,
      )
      const cleartext = EciesSalsaSealBox.decrypt(
        ciphertext,
        keyPair[1],
        authenticatedData,
      )
      expect(bytesEquals(plaintext, cleartext))
    }
  }
})
