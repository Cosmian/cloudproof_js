import { expect, test } from "vitest"
import { Ecies } from ".."
import { randomBytes } from "crypto"
import { bytesEquals } from "../src/utils/utils"

/* Importing the functions from the ECIES library. */
const { EciesSalsaSealBox } = await Ecies()

test("Ecies SalsaSealBox", async () => {
  const keyPair = EciesSalsaSealBox.generateKeyPair()

  for (let plaintextSize = 1; plaintextSize <= 100; plaintextSize++) {
    const plaintext = randomBytes(plaintextSize)
    const authenticatedData = "authenticatedData"
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
})
