import { logger } from "../../utils/logger";
import hmac from 'js-crypto-hmac';

export class Hkdf {
  /**
   * HKDF HMAC-SHA256
   *
   * @param key hmac key
   * @param salt salt
   * @returns a 32 bytes value being the output HMAC
   */
  public static hmacSha256(key: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
    const outputHmac = hmac.compute(key, salt, 'SHA-256').then((output) => {
      // now you get a keyed-hash of msg in Uint8Array
      logger.log(() => "hmac: " + output);
      return output;
    }).catch(err => {
      logger.log(() => "err: " + err);
      throw err
    })

    return outputHmac
  }
}
