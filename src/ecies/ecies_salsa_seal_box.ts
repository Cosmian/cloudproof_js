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
  X25519_PRIVATE_KEY_LENGTH: number = 32

  public static generateKeyPair(): [Uint8Array, Uint8Array] {
    const publicKeyPrivateKey = webassembly_x25519_generate_key_pair()
    return [publicKeyPrivateKey.slice(0, 32), publicKeyPrivateKey.slice(32)]
  }

  /**
   * The function encrypts a plaintext message using the ECIES-Salsa20 encryption
   * algorithm with a given public key and authenticated data.
   *
   * @param {string | Uint8Array} plaintext - The `plaintext` parameter is the
   * message that you want to encrypt. It can be either a string or a Uint8Array
   * (an array of bytes).
   * @param {Uint8Array} publicKey - The `publicKey` parameter is a Uint8Array that
   * represents the public key used for encryption. It is typically generated using
   * a cryptographic algorithm and is used to encrypt the plaintext data.
   * @param {string | Uint8Array} authenticatedData - The `authenticatedData`
   * parameter is additional data that is included in the encryption process but is
   * not encrypted. It is used to provide integrity and authenticity to the
   * encrypted message. This data can be any string or binary data that you want to
   * include with the encrypted message.
   * @returns a Uint8Array.
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

  /**
   * The function decrypts a ciphertext using a private key and authenticated data.
   *
   * @param {string | Uint8Array} ciphertext - The `ciphertext` parameter is the
   * encrypted data that you want to decrypt. It can be either a string or a
   * Uint8Array, which represents the encrypted data in either text or binary
   * format.
   * @param {Uint8Array} privateKey - The `privateKey` parameter is a Uint8Array
   * that represents the private key used for decryption. It is a binary
   * representation of the private key.
   * @param {string | Uint8Array} authenticatedData - The `authenticatedData`
   * parameter is additional data that is used for authentication but is not
   * encrypted. It can be any string or binary data that you want to include for
   * authentication purposes.
   * @returns a Uint8Array.
   */
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
