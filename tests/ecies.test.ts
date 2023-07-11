import { Ecies } from ".."
import { expect, test } from "vitest"

/* Importing the functions from the ECIES library. */
const { EciesSalsaSealBox } = await Ecies()

test("Ecies SalsaSealBox", async () => {
  const keyPair = EciesSalsaSealBox.generateKeyPair()
  console.log(keyPair)

  const plaintext = "hello world"
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
  expect(plaintext === new TextDecoder().decode(cleartext))
})
