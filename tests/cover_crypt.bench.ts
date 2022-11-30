import { CoverCrypt, Policy, PolicyAxis } from ".."
import { bench, describe } from "vitest"
import { randomBytes } from "crypto"

const POLICY = new Policy(
  [
    new PolicyAxis(
      "Security Level",
      ["Protected", "Low Secret", "Medium Secret", "High Secret", "Top Secret"],
      true,
    ),
    new PolicyAxis("Department", ["R&D", "HR", "MKG", "FIN"], false),
  ],
  100,
)

const SIZES = [
  32,
  1024,
  2048,
  4096,
  10 * 1024,
  100 * 1024,
  200 * 1024,
  300 * 1024,
  500 * 1024,
  1024 * 1024,
  10 * 1024 * 1024,
]

describe("Wasm loading", async () => {
  bench("Load CoverCrypt functions", async () => {
    await CoverCrypt()
  })
})

describe("Key Generation", async () => {
  const { CoverCryptKeyGeneration } = await CoverCrypt()

  const keyGenerator = new CoverCryptKeyGeneration()
  const masterKeys = keyGenerator.generateMasterKeys(POLICY)

  bench("Master Key", () => {
    keyGenerator.generateMasterKeys(POLICY)
  })

  bench("User Key", () => {
    keyGenerator.generateUserSecretKey(
      masterKeys.secretKey,
      "Department::HR",
      POLICY,
    )
  })
})

describe("Encrypt", async () => {
  const { CoverCryptKeyGeneration, CoverCryptHybridEncryption } =
    await CoverCrypt()

  const keyGenerator = new CoverCryptKeyGeneration()
  const masterKeys = keyGenerator.generateMasterKeys(POLICY)
  const encryption = new CoverCryptHybridEncryption(
    POLICY,
    masterKeys.publicKey,
  )

  for (const bytes of SIZES) {
    let plaintext = Uint8Array.from([])

    bench(
      `${new Intl.NumberFormat("en-US").format(bytes)} bytes`,
      () => {
        encryption.encrypt("Department::HR", plaintext)
      },
      {
        setup() {
          plaintext = randomBytes(bytes)
        },
      },
    )
  }
})

describe("Decrypt", async () => {
  const {
    CoverCryptKeyGeneration,
    CoverCryptHybridEncryption,
    CoverCryptHybridDecryption,
  } = await CoverCrypt()

  const keyGenerator = new CoverCryptKeyGeneration()
  const masterKeys = keyGenerator.generateMasterKeys(POLICY)
  const encryption = new CoverCryptHybridEncryption(
    POLICY,
    masterKeys.publicKey,
  )
  const userKey = keyGenerator.generateUserSecretKey(
    masterKeys.secretKey,
    "Department::HR",
    POLICY,
  )
  const decryption = new CoverCryptHybridDecryption(userKey)

  for (const bytes of SIZES) {
    const encrypted = encryption.encrypt("Department::HR", randomBytes(bytes))

    bench(`${new Intl.NumberFormat("en-US").format(bytes)} bytes`, () => {
      decryption.decrypt(encrypted)
    })
  }
})
