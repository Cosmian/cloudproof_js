import { CoverCrypt, Policy, PolicyAxis } from ".."
import { bench, describe } from "vitest"
import { randomBytes } from "crypto";

const POLICY = new Policy(
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

describe('Key Generation', async () => {
  const {
    CoverCryptKeyGeneration,
  } = await CoverCrypt()

  const keyGenerator = new CoverCryptKeyGeneration()
  const masterKeys = keyGenerator.generateMasterKeys(POLICY);

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

describe('Encrypt', async () => {
  const {
    CoverCryptKeyGeneration,
    CoverCryptHybridEncryption,
  } = await CoverCrypt()

  const keyGenerator = new CoverCryptKeyGeneration()
  const masterKeys = keyGenerator.generateMasterKeys(POLICY)
  const encryption = new CoverCryptHybridEncryption(POLICY, masterKeys.publicKey)

  bench("32 bytes", () => {
    encryption.encrypt("Department::HR", randomBytes(32))
  })
  
  bench("1kb", () => {
    encryption.encrypt("Department::HR", randomBytes(1024))
  })
  
  bench("1Mb", () => {
    encryption.encrypt("Department::HR", randomBytes(1024 * 1024))
  })
  bench("10Mb", () => {
    encryption.encrypt("Department::HR", randomBytes(10 * 1024 * 1024))
  })
});

describe('Decrypt', async () => {
  const {
    CoverCryptKeyGeneration,
    CoverCryptHybridEncryption,
    CoverCryptHybridDecryption,
  } = await CoverCrypt()

  const keyGenerator = new CoverCryptKeyGeneration()
  const masterKeys = keyGenerator.generateMasterKeys(POLICY)
  const encryption = new CoverCryptHybridEncryption(POLICY, masterKeys.publicKey)
  const userKey = keyGenerator.generateUserSecretKey(
    masterKeys.secretKey,
    "Department::HR",
    POLICY,
  )

  const decryption = new CoverCryptHybridDecryption(userKey)

  const encrypted32bytes = encryption.encrypt("Department::HR", randomBytes(32))
  const encrypted1kb = encryption.encrypt("Department::HR", randomBytes(1024))
  const encrypted1mb = encryption.encrypt("Department::HR", randomBytes(1024 * 1024))
  const encrypted10mb = encryption.encrypt("Department::HR", randomBytes(10 * 1024 * 1024))

  bench("32 bytes", () => {
    decryption.decrypt(encrypted32bytes)
  })
  
  bench("1kb", () => {
    decryption.decrypt(encrypted1kb)
  })
  
  bench("1Mb", () => {
    decryption.decrypt(encrypted1mb)
  })
  bench("10Mb", () => {
    decryption.decrypt(encrypted10mb)
  })
});