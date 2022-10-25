import { CoverCrypt, hexDecode, Policy, PolicyAxis } from "index"

const TOP_SECRET_MKG_FIN_USER_ACCESS_POLICY =
  "Security Level::Top Secret && (Department::MKG || Department::FIN)"

const TOP_SECRET_MKG_FIN_USER = hexDecode(
  "2a403d8f9e0c4441c0d074a0cd925f95ff47cdbd5e7704160960ec7ac2c27a0a1f33ac06dfcf0d65008e9a3b0af987be4a86d79781196b24dae47da44f5c620a0a378fee44df891d837e1bdd78be3aa2de174830a6148e72d2c35c15efde2353004f3d59e3ea6ec4dc314741a6c0e18895d82046bf1813e3781c4c2afafb0b2d00d0ae65693bcfb22c10e06deabe00656b36fb7778913ace143edffa0f0fd1de08eaff457c46e180661c7cc08b7bf3665940e46b402ed4a08ba48ee73fd08ee605e5f5347a2420609a5d45876e09ca1543e8005fbd8441d115cd5529425a571a0e62405280f32e7e5bae0e25d25668aeaecd8be317ed3a1bfb9618ca812b5ec50ac26e5e241a4b2646ef9954a9c2b06d6da556057c9fc1dbc0274ade63627d67071eafd82d43228e007b861961888e62b107d0c16f54b4750b16c80f04369a170e488e38b3719bffaa0597ffa2d1ba57558e2a1b3c487f872a31bc6498b8bb0403f2c1f93b6c7281c6822878e88e30b2e1ba9d656e9c229697a798591158d3de0e"
)

// User decryption key with access policy: "Security Level::Medium Secret && Department::MKG"
const MEDIUM_SECRET_MKG_USER_ACCESS_POLICY =
  "Security Level::Medium Secret && Department::MKG"

// Plaintext example is: My secret message
const PLAINTEXT = hexDecode("4d7920736563726574206d657373616765")

// Hybrid encrypted data: ABE attributes are ['Security Level::Low Secret', 'Department::HR', 'Department::FIN']
const ENCRYPTED_DATA = hexDecode(
  "e07ffb36e8935ee4c2c7a27402042c332868c647914f908abaf745a78b179a6a0cfc823dc18aefb894e49cf80f3d8868434b822498b17482a3285691d62f6f4101bd54050526d82b8048ed019e73ef818a2d1c61d1bd21b849fbf2721802b4f3d56dfe18f0107a1c0175864568d0cc9aaf8f123e7b4ef7d53196de5649c605d57e1c2db9125da53983fd5f99e997f20a29f4d2cf99d0f4367a3e460416ebb7f282358a762ddf8f0136e8114288004e69488f4496a184cad01555a0183ed4dd880d28317f0d3ec6d93e2f13"
)

test("Non regression tests", async () => {
  const { CoverCryptHybridDecryption } = await CoverCrypt();

  const hybridDecryption = new CoverCryptHybridDecryption(TOP_SECRET_MKG_FIN_USER)
  const cleartext = hybridDecryption.decrypt(ENCRYPTED_DATA)

  expect(cleartext).toEqual(PLAINTEXT);
})

test("cover_crypt", async () => {
  const { CoverCryptKeyGeneration } = await CoverCrypt();
  const keyGenerator = new CoverCryptKeyGeneration();

  const policy = new Policy(
    [
      new PolicyAxis(
        "Security Level",
        [
          "Protected",
          "Low Secret",
          "Medium Secret",
          "High Secret",
          "Top Secret",
        ],
        true
      ),
      new PolicyAxis("Department", ["R&D", "HR", "MKG", "FIN"], false),
    ],
    100
  )

  await runTests(policy);

  const newPolicy = keyGenerator.rotateAttributes(
    ["Security Level::Low Secret", "Department::MKG"],
    policy,
  )

  await runTests(newPolicy);
});

/**
 * Run some encryption/decryption tests
 * 
 * @param {Policy} policy policy to use
 */
async function runTests(policy: Policy): Promise<void> {
  const { CoverCryptHybridDecryption, CoverCryptHybridEncryption, CoverCryptKeyGeneration } = await CoverCrypt();

  const keyGenerator = new CoverCryptKeyGeneration();
  const newMasterKeys = keyGenerator.generateMasterKeys(policy)

  const topSecretMkgFinUser =
    keyGenerator.generateUserDecryptionKey(
      newMasterKeys.secretKey,
      TOP_SECRET_MKG_FIN_USER_ACCESS_POLICY,
      policy,
    )

  const mediumSecretMkgUser =
    keyGenerator.generateUserDecryptionKey(
      newMasterKeys.secretKey,
      MEDIUM_SECRET_MKG_USER_ACCESS_POLICY,
      policy,
    )

  const hybridEncryption = new CoverCryptHybridEncryption(policy, newMasterKeys.publicKey)

  const lowSecretMkgData = hybridEncryption.encrypt(
    "Security Level::Low Secret && Department::MKG",
    PLAINTEXT,
  )
  const topSecretMkgData = hybridEncryption.encrypt(
    "Security Level::Top Secret &&  Department::MKG",
    PLAINTEXT,
  )
  const lowSecretFinData = hybridEncryption.encrypt(
    "Security Level::Low Secret && Department::FIN",
    PLAINTEXT,
  )

  // The medium secret marketing user can successfully decrypt a low security marketing message :
  const hybridDecryptionMediumSecret = new CoverCryptHybridDecryption(mediumSecretMkgUser)
  let cleartext = hybridDecryptionMediumSecret.decrypt(lowSecretMkgData)
  expect(cleartext).toEqual(PLAINTEXT);

  // .. however it can neither decrypt a marketing message with higher security:
  expect(() => hybridDecryptionMediumSecret.decrypt(topSecretMkgData)).toThrow()

  // … nor decrypt a message from another department even with a lower security:
  expect(() => hybridDecryptionMediumSecret.decrypt(lowSecretFinData)).toThrow()

  // The "top secret-marketing-financial" user can decrypt messages from the marketing department OR the financial department that have a security level of Top Secret or below
  // As expected, the top secret marketing financial user can successfully decrypt all messages
  const hybridDecryptionTopSecret = new CoverCryptHybridDecryption(topSecretMkgFinUser)
  cleartext = hybridDecryptionTopSecret.decrypt(lowSecretMkgData)
  expect(cleartext).toEqual(PLAINTEXT)

  cleartext = hybridDecryptionTopSecret.decrypt(topSecretMkgData)
  expect(cleartext).toEqual(PLAINTEXT)

  cleartext = hybridDecryptionTopSecret.decrypt(lowSecretFinData)
  expect(cleartext).toEqual(PLAINTEXT)
}
