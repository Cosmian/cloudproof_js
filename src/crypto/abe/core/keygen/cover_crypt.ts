/* tslint:disable:max-classes-per-file */
import {
  webassembly_generate_master_keys,
  webassembly_generate_user_private_key,
  webassembly_rotate_attributes,
} from "cosmian_cover_crypt"
import { logger } from "../../../../utils/logger"
import { fromBeBytes, hexEncode } from "../../../../utils/utils"
import { Policy } from "../../interfaces/policy"

export class CoverCryptMasterKey {
  private _privateKey: Uint8Array
  private _publicKey: Uint8Array

  // Getters and setters
  public get privateKey(): Uint8Array {
    return this._privateKey
  }

  public set privateKey(value: Uint8Array) {
    this._privateKey = value
  }

  public get publicKey(): Uint8Array {
    return this._publicKey
  }

  public set publicKey(value: Uint8Array) {
    this._publicKey = value
  }

  // Constructor
  constructor(privateKey: Uint8Array, publicKey: Uint8Array) {
    this._privateKey = privateKey
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
    logger.log(() => `policy: ${policy.toString()}`)

    const policyBytes = policy.toJsonEncoded()
    const masterKeys = webassembly_generate_master_keys(policyBytes)
    const privateKeySize = fromBeBytes(masterKeys.slice(0, 4))
    logger.log(() => `private key size: ${privateKeySize}`)
    return new CoverCryptMasterKey(
      masterKeys.slice(4, 4 + privateKeySize),
      masterKeys.slice(4 + privateKeySize, masterKeys.length)
    )
  }

  /**
   * Generate a User Decryption Key
   *
   * @param {Uint8Array} masterPrivateKeyBytes The Master Private Key Bytes
   * @param {string} accessPolicy the access policy as a boolean expression
   *  e.g. (Department::MKG || Department::FIN) && Security Level::Medium Secret
   * @param {Policy} policy the policy of the master key
   * @returns the user decryption key bytes
   */
  public generateUserDecryptionKey(
    masterPrivateKeyBytes: Uint8Array,
    accessPolicy: string,
    policy: Policy
  ): Uint8Array {
    logger.log(() => `privateKey: ${hexEncode(masterPrivateKeyBytes)}`)
    logger.log(() => "accessPolicy: " + accessPolicy)
    logger.log(() => `policy: ${policy.toString()}`)

    const policyBytes = policy.toJsonEncoded()
    const userPrivateKey = webassembly_generate_user_private_key(
      masterPrivateKeyBytes,
      accessPolicy,
      policyBytes
    )

    return userPrivateKey
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
    logger.log(() => `attributes: ${JSON.stringify(attributes)}`)
    logger.log(() => `policy: ${policy.toString()}`)

    const policyBytes = policy.toJsonEncoded()
    const attributesBytes = new TextEncoder().encode(JSON.stringify(attributes))
    const newPolicyString = webassembly_rotate_attributes(
      attributesBytes,
      policyBytes
    )

    return Policy.fromJsonEncoded(newPolicyString)
  }
}
