import { toBytes } from "utils/utils"
import {
  webassembly_x25519_generate_key_pair,
  webassembly_ecies_salsa_seal_box_encrypt,
  webassembly_ecies_salsa_seal_box_decrypt,
} from "../pkg/ecies/cloudproof_ecies"

/**
 * Represents a class that applies a hash function to data.
 *
 */
export class EciesSalsaSealBox {
  public static generateKeyPair(): [Uint8Array, Uint8Array] {
    const pk_sk = webassembly_x25519_generate_key_pair()
    return [pk_sk.slice(0, 32), pk_sk.slice(32)]
  }

  /**
   * The function encrypts a plaintext message using ECIES salsa seal box
   * @param {Uint8Array} plaintext - The `plaintext` parameter is the data that you
   * want to encrypt. It should be provided as a `Uint8Array`, which is an
   * array-like object that represents an array of 8-bit unsigned integers.
   * @param {Uint8Array} publicKey - The publicKey parameter is a Uint8Array that
   * represents the public key used for encryption. It is typically a binary
   * representation of the public key, which can be generated using a cryptographic
   * library or algorithm.
   * @param {Uint8Array} authenticatedData - The authenticatedData parameter is
   * additional data that you want to include in the encryption process. This data
   * is not encrypted but is authenticated, meaning it is included in the
   * encryption process to ensure its integrity and authenticity. It can be any
   * arbitrary data that you want to associate with the encrypted message.
   * @returns a Uint8Array, which is an array-like object that represents an array
   * of 8-bit unsigned integers.
   */
  public static encrypt(
    plaintext: string | Uint8Array,
    publicKey: Uint8Array,
    authenticatedData: string | Uint8Array,
  ): Uint8Array {
    return webassembly_ecies_salsa_seal_box_encrypt(
      toBytes(plaintext),
      publicKey,
      toBytes(authenticatedData),
    )
  }

  public static decrypt(
    ciphertext: string | Uint8Array,
    privateKey: Uint8Array,
    authenticatedData: string | Uint8Array,
  ): Uint8Array {
    return webassembly_ecies_salsa_seal_box_decrypt(
      toBytes(ciphertext),
      privateKey,
      toBytes(authenticatedData),
    )
  }
}
