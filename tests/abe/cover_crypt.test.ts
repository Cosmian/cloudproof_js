import { CoverCrypt, hexDecode, Policy, PolicyAxis } from "../.."
import { expect, test } from "vitest"

const TOP_SECRET_MKG_FIN_USK_ACCESS_POLICY =
  "Security Level::Top Secret && (Department::MKG || Department::FIN)"

const TOP_SECRET_MKG_FIN_USK = hexDecode(
  "2a403d8f9e0c4441c0d074a0cd925f95ff47cdbd5e7704160960ec7ac2c27a0a1f33ac06dfcf0d65008e9a3b0af987be4a86d79781196b24dae47da44f5c620a0a378fee44df891d837e1bdd78be3aa2de174830a6148e72d2c35c15efde2353004f3d59e3ea6ec4dc314741a6c0e18895d82046bf1813e3781c4c2afafb0b2d00d0ae65693bcfb22c10e06deabe00656b36fb7778913ace143edffa0f0fd1de08eaff457c46e180661c7cc08b7bf3665940e46b402ed4a08ba48ee73fd08ee605e5f5347a2420609a5d45876e09ca1543e8005fbd8441d115cd5529425a571a0e62405280f32e7e5bae0e25d25668aeaecd8be317ed3a1bfb9618ca812b5ec50ac26e5e241a4b2646ef9954a9c2b06d6da556057c9fc1dbc0274ade63627d67071eafd82d43228e007b861961888e62b107d0c16f54b4750b16c80f04369a170e488e38b3719bffaa0597ffa2d1ba57558e2a1b3c487f872a31bc6498b8bb0403f2c1f93b6c7281c6822878e88e30b2e1ba9d656e9c229697a798591158d3de0e",
)

// User decryption key with access policy: "Security Level::Medium Secret && Department::MKG"
const MEDIUM_SECRET_MKG_USK_ACCESS_POLICY =
  "Security Level::Medium Secret && Department::MKG"

// Plaintext example is: My secret message
const PLAINTEXT = hexDecode("4d7920736563726574206d657373616765")

// Hybrid encrypted data: ABE access policy is "Security Level::Low Secret && Department::FIN"
const ENCRYPTED_DATA = hexDecode(
  "e07ffb36e8935ee4c2c7a27402042c332868c647914f908abaf745a78b179a6a0cfc823dc18aefb894e49cf80f3d8868434b822498b17482a3285691d62f6f4101bd54050526d82b8048ed019e73ef818a2d1c61d1bd21b849fbf2721802b4f3d56dfe18f0107a1c0175864568d0cc9aaf8f123e7b4ef7d53196de5649c605d57e1c2db9125da53983fd5f99e997f20a29f4d2cf99d0f4367a3e460416ebb7f282358a762ddf8f0136e8114288004e69488f4496a184cad01555a0183ed4dd880d28317f0d3ec6d93e2f13",
)

test("Non regression tests", async () => {
  const { CoverCryptHybridDecryption } = await CoverCrypt()

  const hybridDecryption = new CoverCryptHybridDecryption(
    TOP_SECRET_MKG_FIN_USK,
  )
  const { cleartext}  = hybridDecryption.decrypt(ENCRYPTED_DATA)

  expect(cleartext).toEqual(PLAINTEXT)
})

test("Non regression tests from Java", async () => {
  const { CoverCryptHybridDecryption } = await CoverCrypt()

  const userDecryptionKey = hexDecode(
    "339f1424376ea319c2b8ceadc39a4b4c5ed1aaa9f9bd6128bdb99c0a376a5b0c3b55b44663dd713b6406965d72db3545735e21518c2e6dd79c6d5054599be108015aa1835783127886c378eefa290457a1887107871cc69162d0e50dfdebc2f406",
  )
  const encryptedBytes = hexDecode(
    "f617aca1e6678beb2e7106d6fb9e5b0a3037f3c7072f8f30a4bb6980abee5a3ba839f39d772886c1bf2cd6f35760513919ba237de30c5e8277f906fc5bdff9620169aab7e12e0dfe3856d1dfec3ff774dfc4757a584f8009c1f6fc30b5446f041eb99e1052c381aa32f5704c7ff0fc6660fd1c64945d185435d9099b4c379c240100198875d3cf9ae3b4cdba7969c70b346c3438a792de4d4096d4850e06139f5463fe4a9c0ff900c8bbb08b912dd644926c66cb8fc6a113e13bc0444b254afa1b9db08d7cfaad63029d02c66e3ee9efea5a7e37a35bdbef2655f42c232326899f7f40a12d5d43904485a909e31e2aaf65bc87dc1770c0dc0d8ba31267cddea9a662c020252552acaf733b8c29cae00788e559a99ab5b422f805a27b1cab20cfb2bfa88ad0bcb49e27e154a9b41f4540afdc0d3718e7278978c7a66526d13a30844fc4edc17b3d04bf6c8b7d416b425097afd274aaaad08b9804c0bc7b582753e6ed0ef0635d78e0414856fcc3648a3f0ab42137278f491ca7db635db8a9b8e6bfd5c3b074955d82c8b08aed8d7077685d95ccbc8f18d05aa6ca51af724bad6db4dc8fa37cc3bb8a11cebb8102ed016f655187771fa16260e61be2ba2e1ba82655a17dc683d5be1adfb9a7ccdeda7b12ba071517c730aa8f2094a95bdfc3b0dd16224b09848c01731da2626a85235ef5e5e542272a6997f1bdeb436bd2489da510063fcfcd8d4e0b897301aa20f0ed46f0129e6c71813c4b0c5c742ed35d9d95d57d0894fd0ee6bcd637df7f51f898aa33bea3b693",
  )
  const hybridDecryption = new CoverCryptHybridDecryption(userDecryptionKey)
  const { cleartext } = hybridDecryption.decrypt(encryptedBytes)

  const cleartextDecoder = new TextDecoder().decode(cleartext)
  const expectedPlaintext =
    '{"Sn":"@09]_G\\\\t]\\\\","givenName":"Martin","departmentNumber":"377","title":"B4IUzy_G2h","caYellowPagesCategory":"NW:V8zGg<G","uid":"=wRswjYRc?","employeeNumber":"9o9sI^<L9u","Mail":"=qwts6V0Hz","TelephoneNumber":"z6MSr8UI2:","Mobile":"lMe2p26u7Q","facsimileTelephoneNumber":"3We]<ykK\\\\h","caPersonLocalisation":"^3^CXV>CV`","Cn":";j:NI[tupH","caUnitdn":"cn;8YpMwGS","department":"RsUP\\\\uKM>1","co":"France"}'
  expect(cleartextDecoder).toEqual(expectedPlaintext)
})

test("cover_crypt", async () => {
  const { CoverCryptKeyGeneration } = await CoverCrypt()
  const keyGenerator = new CoverCryptKeyGeneration()

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
        true,
      ),
      new PolicyAxis("Department", ["R&D", "HR", "MKG", "FIN"], false),
    ],
    100,
  )

  await runTests(policy)

  const newPolicy = keyGenerator.rotateAttributes(
    ["Security Level::Low Secret", "Department::MKG"],
    policy,
  )

  await runTests(newPolicy)
})

/**
 * Run some encryption/decryption tests
 *
 * @param {Policy} policy policy to use
 */
async function runTests(policy: Policy): Promise<void> {
  const {
    CoverCryptHybridDecryption,
    CoverCryptHybridEncryption,
    CoverCryptKeyGeneration,
  } = await CoverCrypt()

  const keyGenerator = new CoverCryptKeyGeneration()
  const newMasterKeys = keyGenerator.generateMasterKeys(policy)

  const topSecretMkgFinUsk = keyGenerator.generateUserSecretKey(
    newMasterKeys.secretKey,
    TOP_SECRET_MKG_FIN_USK_ACCESS_POLICY,
    policy,
  )

  const mediumSecretMkgUsk = keyGenerator.generateUserSecretKey(
    newMasterKeys.secretKey,
    MEDIUM_SECRET_MKG_USK_ACCESS_POLICY,
    policy,
  )

  const hybridEncryption = new CoverCryptHybridEncryption(
    policy,
    newMasterKeys.publicKey,
  )

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
  const hybridDecryptionMediumSecret = new CoverCryptHybridDecryption(
    mediumSecretMkgUsk,
  )
  const { cleartext } = hybridDecryptionMediumSecret.decrypt(lowSecretMkgData)
  expect(cleartext).toEqual(PLAINTEXT)

  // .. however it can neither decrypt a marketing message with higher security:
  expect(() => hybridDecryptionMediumSecret.decrypt(topSecretMkgData)).toThrow()

  // … nor decrypt a message from another department even with a lower security:
  expect(() => hybridDecryptionMediumSecret.decrypt(lowSecretFinData)).toThrow()

  // The "top secret-marketing-financial" user can decrypt messages from the marketing department OR the financial department that have a security level of Top Secret or below
  // As expected, the top secret marketing financial user can successfully decrypt all messages
  const hybridDecryptionTopSecret = new CoverCryptHybridDecryption(
    topSecretMkgFinUsk,
  )

  {
    const { cleartext } = hybridDecryptionTopSecret.decrypt(lowSecretMkgData)
    expect(cleartext).toEqual(PLAINTEXT)
  }

  {
    const { cleartext } = hybridDecryptionTopSecret.decrypt(topSecretMkgData)
    expect(cleartext).toEqual(PLAINTEXT)
  }

  {
    const { cleartext } = hybridDecryptionTopSecret.decrypt(lowSecretFinData)
    expect(cleartext).toEqual(PLAINTEXT)
  }
}
