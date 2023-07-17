import { toBytes } from "utils/utils"
import {
  webassembly_aes256gcm_encrypt,
  webassembly_aes256gcm_decrypt,
} from "../pkg/aesgcm/cloudproof_aesgcm"

/**
 * Represents a class that applies AES256GCM to data.
 *
 */
export class Aes256Gcm {
  SYMMETRIC_KEY_LENGTH: number = 32

  public static encrypt(
    plaintext: string | Uint8Array,
    key: string | Uint8Array,
    nonce: string | Uint8Array,
    authenticatedData: string | Uint8Array,
  ): Uint8Array {
    return webassembly_aes256gcm_encrypt(
      toBytes(plaintext),
      toBytes(key),
      toBytes(nonce),
      toBytes(authenticatedData),
    )
  }

  public static decrypt(
    plaintext: string | Uint8Array,
    key: string | Uint8Array,
    nonce: string | Uint8Array,
    authenticatedData: string | Uint8Array,
  ): Uint8Array {
    return webassembly_aes256gcm_decrypt(
      toBytes(plaintext),
      toBytes(key),
      toBytes(nonce),
      toBytes(authenticatedData),
    )
  }
}
