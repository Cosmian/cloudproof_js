/* tslint:disable:max-classes-per-file */

import { expect } from "vitest"
import { CoverCrypt, Policy as CoverCryptPolicy } from ".."
import { fromByteArray, toByteArray } from 'base64-js';

/* Importing the functions from the CoverCrypt library. */
const {
  CoverCryptKeyGeneration,
  CoverCryptHybridEncryption,
  CoverCryptHybridDecryption,
  Policy,
  PolicyAxis,
} = await CoverCrypt()
const keyGenerator = new CoverCryptKeyGeneration()

export class UserSecretKeyTestVector {
  readonly accessPolicy: string
  readonly key: Uint8Array

  constructor(accessPolicy: string, key: Uint8Array) {
    this.accessPolicy = accessPolicy
    this.key = key
  }

  public static async generate(
    masterSecretKey: Uint8Array,
    accessPolicy: string,
    policy: CoverCryptPolicy,
  ): Promise<UserSecretKeyTestVector> {
    const key = keyGenerator.generateUserSecretKey(
      masterSecretKey,
      accessPolicy,
      policy,
    )
    return new UserSecretKeyTestVector(accessPolicy, key)
  }

  public toJson(): string {
    const usk: any = {}
    usk.key = fromByteArray(this.key)
    usk.access_policy = this.accessPolicy
    return usk
  }

  public static fromJson(usk: string): UserSecretKeyTestVector {
    const json = JSON.parse(JSON.stringify(usk))
    const accessPolicy = json.access_policy
    const key = toByteArray(json.key)
    return new UserSecretKeyTestVector(accessPolicy, key)
  }
}

export class EncryptionTestVector {
  readonly encryptionPolicy: string
  readonly plaintext: Uint8Array
  readonly ciphertext: Uint8Array
  readonly headerMetadata: Uint8Array
  readonly authenticationData: Uint8Array

  constructor(
    encryptionPolicy: string,
    plaintext: Uint8Array,
    ciphertext: Uint8Array,
    headerMetadata: Uint8Array,
    authenticationData: Uint8Array,
  ) {
    this.encryptionPolicy = encryptionPolicy
    this.plaintext = plaintext
    this.ciphertext = ciphertext
    this.headerMetadata = headerMetadata
    this.authenticationData = authenticationData
  }

  public static async generate(
    policy: CoverCryptPolicy,
    publicKey: Uint8Array,
    encryptionPolicy: string,
    plaintext: string,
    headerMetadata: Uint8Array,
    authenticationData: Uint8Array,
  ): Promise<EncryptionTestVector> {
    const hybridEncryption = new CoverCryptHybridEncryption(policy, publicKey)
    const plaintextBytes = new TextEncoder().encode(plaintext)
    const ciphertext = hybridEncryption.encrypt(
      encryptionPolicy,
      plaintextBytes,
      {
        headerMetadata,
        authenticationData,
      },
    )
    return new EncryptionTestVector(
      encryptionPolicy,
      plaintextBytes,
      ciphertext,
      headerMetadata,
      authenticationData,
    )
  }

  decrypt(key: Uint8Array): void {
    const hybridDecryptionMediumSecret = new CoverCryptHybridDecryption(key)
    const { plaintext, headerMetadata } = hybridDecryptionMediumSecret.decrypt(
      this.ciphertext,
      {
        authenticationData: this.authenticationData,
      },
    )
    expect(plaintext).toEqual(this.plaintext)
    expect(headerMetadata).toEqual(this.headerMetadata)
  }

  public toJson(): string {
    const etv: any = {}
    etv.encryption_policy = this.encryptionPolicy
    etv.plaintext = fromByteArray(this.plaintext)
    etv.ciphertext = fromByteArray(this.ciphertext)
    etv.header_metadata = fromByteArray(this.headerMetadata)
    etv.authentication_data = fromByteArray(this.authenticationData)
    return etv
  }

  public static fromJson(etv: string): EncryptionTestVector {
    const json = JSON.parse(JSON.stringify(etv))
    const encryptionPolicy = json.encryption_policy
    const plaintext = toByteArray(json.plaintext)
    const ciphertext = toByteArray(json.ciphertext)
    const headerMetadata = toByteArray(json.header_metadata)
    const authenticationData = toByteArray(json.authentication_data)

    return new EncryptionTestVector(
      encryptionPolicy,
      plaintext,
      ciphertext,
      headerMetadata,
      authenticationData,
    )
  }
}
export class NonRegressionVector {
  private readonly publicKey: Uint8Array
  private readonly masterSecretKey: Uint8Array
  private readonly policy: CoverCryptPolicy
  private readonly topSecretMkgFinKey: UserSecretKeyTestVector
  private readonly mediumSecretMkgKey: UserSecretKeyTestVector
  private readonly topSecretFinKey: UserSecretKeyTestVector
  private readonly topSecretMkgTestVector: EncryptionTestVector
  private readonly lowSecretMkgTestVector: EncryptionTestVector
  private readonly lowSecretFinTestVector: EncryptionTestVector

  constructor(
    policy: CoverCryptPolicy,
    publicKey: Uint8Array,
    masterSecretKey: Uint8Array,
    topSecretMkgFinKey: UserSecretKeyTestVector,
    mediumSecretMkgKey: UserSecretKeyTestVector,
    topSecretFinKey: UserSecretKeyTestVector,
    topSecretMkgTestVector: EncryptionTestVector,
    lowSecretMkgTestVector: EncryptionTestVector,
    lowSecretFinTestVector: EncryptionTestVector,
  ) {
    this.publicKey = publicKey
    this.masterSecretKey = masterSecretKey
    this.policy = policy
    this.topSecretMkgFinKey = topSecretMkgFinKey
    this.mediumSecretMkgKey = mediumSecretMkgKey
    this.topSecretFinKey = topSecretFinKey
    this.topSecretMkgTestVector = topSecretMkgTestVector
    this.lowSecretMkgTestVector = lowSecretMkgTestVector
    this.lowSecretFinTestVector = lowSecretFinTestVector
  }

  public static async generate(): Promise<NonRegressionVector> {
    const policy = new Policy(
      [
        new PolicyAxis(
          "Security Level",
          [
            { name: "Protected", isHybridized: false },
            { name: "Low Secret", isHybridized: false },
            { name: "Medium Secret", isHybridized: false },
            { name: "High Secret", isHybridized: false },
            { name: "Top Secret", isHybridized: false },
          ],
          true,
        ),
        new PolicyAxis(
          "Department",
          [
            { name: "R&D", isHybridized: false },
            { name: "HR", isHybridized: false },
            { name: "MKG", isHybridized: false },
            { name: "FIN", isHybridized: false },
          ],
          false,
        ),
      ],
      100,
    )
    const masterKeys = keyGenerator.generateMasterKeys(policy)

    // Generate user secret keys
    const topSecretMkgFinKey = await UserSecretKeyTestVector.generate(
      masterKeys.secretKey,
      "Security Level::Top Secret && (Department::MKG || Department::FIN)",
      policy,
    )
    const mediumSecretMkgKey = await UserSecretKeyTestVector.generate(
      masterKeys.secretKey,
      "Security Level::Medium Secret && Department::MKG",
      policy,
    )
    const topSecretFinKey = await UserSecretKeyTestVector.generate(
      masterKeys.secretKey,
      "Security Level::Top Secret && Department::FIN",
      policy,
    )

    // Generate ciphertexts
    const topSecretMkgTestVector = await EncryptionTestVector.generate(
      policy,
      masterKeys.publicKey,
      "Department::MKG && Security Level::Top Secret",
      "TopSecretMkgPlaintext",
      new Uint8Array([1, 2, 3, 4, 5, 9]),
      new Uint8Array([7, 8, 9, 19]),
    )
    const lowSecretMkgTestVector = await EncryptionTestVector.generate(
      policy,
      masterKeys.publicKey,
      "Department::MKG && Security Level::Low Secret",
      "LowSecretMkgPlaintext",
      new Uint8Array([1, 2, 3, 4, 5, 9]),
      new Uint8Array([]),
    )
    const lowSecretFinTestVector = await EncryptionTestVector.generate(
      policy,
      masterKeys.publicKey,
      "Department::FIN && Security Level::Low Secret",
      "LowSecretFinPlaintext",
      new Uint8Array([]),
      new Uint8Array([]),
    )
    return new NonRegressionVector(
      policy,
      masterKeys.publicKey,
      masterKeys.secretKey,
      topSecretMkgFinKey,
      mediumSecretMkgKey,
      topSecretFinKey,
      topSecretMkgTestVector,
      lowSecretMkgTestVector,
      lowSecretFinTestVector,
    )
  }

  verify(): void {
    //
    // Decrypt with top secret fin key
    //
    this.lowSecretFinTestVector.decrypt(this.topSecretFinKey.key)
    try {
      this.lowSecretMkgTestVector.decrypt(this.topSecretFinKey.key)
    } catch (error) {
      // ... failing expected
    }
    try {
      this.topSecretMkgTestVector.decrypt(this.topSecretFinKey.key)
    } catch (error) {
      // ... failing expected
    }

    //
    // Decrypt with top secret mkg fin key
    //
    this.lowSecretFinTestVector.decrypt(this.topSecretMkgFinKey.key)
    this.lowSecretMkgTestVector.decrypt(this.topSecretMkgFinKey.key)
    this.topSecretMkgTestVector.decrypt(this.topSecretMkgFinKey.key)

    //
    // Decrypt with medium secret mkg key
    //
    try {
      this.lowSecretFinTestVector.decrypt(this.mediumSecretMkgKey.key)
    } catch (error) {
      // ... failing expected
    }
    this.lowSecretMkgTestVector.decrypt(this.mediumSecretMkgKey.key)
    try {
      this.topSecretMkgTestVector.decrypt(this.mediumSecretMkgKey.key)
    } catch (error) {
      // ... failing expected
    }
  }

  public toJson(): string {
    const nrv: any = {}
    nrv.public_key = fromByteArray(this.publicKey)
    nrv.master_secret_key = fromByteArray(this.masterSecretKey)
    nrv.policy = fromByteArray(this.policy.toBytes())
    nrv.top_secret_mkg_fin_key = this.topSecretMkgFinKey.toJson()
    nrv.medium_secret_mkg_key = this.mediumSecretMkgKey.toJson()
    nrv.top_secret_fin_key = this.topSecretFinKey.toJson()

    // ciphertexts
    nrv.top_secret_mkg_test_vector = this.topSecretMkgTestVector.toJson()
    nrv.low_secret_mkg_test_vector = this.lowSecretMkgTestVector.toJson()
    nrv.low_secret_fin_test_vector = this.lowSecretFinTestVector.toJson()

    return JSON.stringify(nrv)
  }

  public static fromJson(nonRegVector: string): NonRegressionVector {
    const json = JSON.parse(nonRegVector)
    const policy = Policy.fromBytes(toByteArray(json.policy))
    const publicKey = Uint8Array.from(Buffer.from(json.public_key, "base64"))
    const masterSecretKey = toByteArray(json.master_secret_key)

    const topSecretMkgFinKey = UserSecretKeyTestVector.fromJson(
      json.top_secret_mkg_fin_key,
    )
    const mediumSecretMkgKey = UserSecretKeyTestVector.fromJson(
      json.medium_secret_mkg_key,
    )
    const topSecretFinKey = UserSecretKeyTestVector.fromJson(
      json.top_secret_fin_key,
    )

    // ciphertexts
    const topSecretMkgTestVector = EncryptionTestVector.fromJson(
      json.top_secret_mkg_test_vector,
    )
    const lowSecretMkgTestVector = EncryptionTestVector.fromJson(
      json.low_secret_mkg_test_vector,
    )
    const lowSecretFinTestVector = EncryptionTestVector.fromJson(
      json.low_secret_fin_test_vector,
    )

    return new NonRegressionVector(
      policy,
      publicKey,
      masterSecretKey,
      topSecretMkgFinKey,
      mediumSecretMkgKey,
      topSecretFinKey,
      topSecretMkgTestVector,
      lowSecretMkgTestVector,
      lowSecretFinTestVector,
    )
  }
}
