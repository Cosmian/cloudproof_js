/* tslint:disable:max-classes-per-file */
import {
  webassembly_generate_master_keys,
  webassembly_generate_user_secret_key,
  webassembly_rotate_attributes,
} from "../pkg/cover_crypt/cosmian_cover_crypt"
import { logger } from "../utils/logger"
import { fromBeBytes } from "../utils/utils"
import { Policy } from "./interfaces/policy"

export class CoverCryptMasterKey {
  private _secretKey: Uint8Array
  private _publicKey: Uint8Array

  // Getters and setters
  public get secretKey(): Uint8Array {
    return this._secretKey
  }

  public set secretKey(value: Uint8Array) {
    this._secretKey = value
  }

  public get publicKey(): Uint8Array {
    return this._publicKey
  }

  public set publicKey(value: Uint8Array) {
    this._publicKey = value
  }

  // Constructor
  constructor(secretKey: Uint8Array, publicKey: Uint8Array) {
    this._secretKey = secretKey
    this._publicKey = publicKey
  }
}

/**
 * Generate the keys using the local web assembly
 */
export class CoverCryptKeyGeneration {
  /**
   * Generate the Master Key Par
   *
   * @param {Policy} policy the policy to use
   * @returns {CoverCryptMasterKey} the master keys
   */
  public generateMasterKeys(policy: Policy): CoverCryptMasterKey {
    const policyBytes = policy.toJsonEncoded()
    const masterKeys = webassembly_generate_master_keys(policyBytes)
    const secretKeySize = fromBeBytes(masterKeys.slice(0, 4))
    logger.log(() => `private key size: ${secretKeySize}`)
    return new CoverCryptMasterKey(
      masterKeys.slice(4, 4 + secretKeySize),
      masterKeys.slice(4 + secretKeySize, masterKeys.length),
    )
  }

  /**
   * Generate a User Decryption Key
   *
   * @param {Uint8Array} masterSecretKeyBytes The Master Private Key Bytes
   * @param {string} accessPolicy the access policy as a boolean expression
   *  e.g. (Department::MKG || Department::FIN) && Security Level::Medium Secret
   * @param {Policy} policy the policy of the master key
   * @returns {Uint8Array} the user decryption key bytes
   */
  public generateUserSecretKey(
    masterSecretKeyBytes: Uint8Array,
    accessPolicy: string,
    policy: Policy,
  ): Uint8Array {
    const policyBytes = policy.toJsonEncoded()
    const userSecretKey = webassembly_generate_user_secret_key(
      masterSecretKeyBytes,
      accessPolicy,
      policyBytes,
    )

    return userSecretKey
  }

  /**
   * Rotate attributes in the given policy
   *
   * Note: this does NOT refresh the keys
   *
   * @param {string[]} attributes to rotate
   * e.g. ["Department::MKG" , "Department::FIN"]
   * @param {Policy} policy the policy
   * @returns {Policy} the updated policy
   */
  public rotateAttributes(attributes: string[], policy: Policy): Policy {
    const policyBytes = policy.toJsonEncoded()
    const attributesBytes = new TextEncoder().encode(JSON.stringify(attributes))
    const newPolicyString = webassembly_rotate_attributes(
      attributesBytes,
      policyBytes,
    )

    return Policy.fromJsonEncoded(newPolicyString)
  }
}
