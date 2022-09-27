import {
  DecryptionWorkerMessage,
  HybridDecryption,
} from "crypto/abe/interfaces/decryption";
import { logger } from "utils/logger";
import { hexDecode } from "utils/utils";
import { ClearTextHeader } from "crypto/abe/interfaces/cleartext_header";
import { CoverCryptHybridDecryption } from "../cover_crypt/decryption";
import { GpswHybridDecryption } from "../gpsw/decryption";

const ctx: Worker = self as any;

class DecryptWorker {
  hybridDecryption: HybridDecryption | null = null;

  init(asymmetricDecryptionKey: string, isGpswImplementation: boolean) {
    if (isGpswImplementation) {
      this.hybridDecryption = new GpswHybridDecryption(
        hexDecode(asymmetricDecryptionKey)
      );
    } else {
      this.hybridDecryption = new CoverCryptHybridDecryption(
        hexDecode(asymmetricDecryptionKey)
      );
    }
  }

  /**
   * Destroy the hybrid decryption crypto
   */
  destroy(): void {
    if (this.hybridDecryption == null) {
      return;
    }
    this.hybridDecryption.destroyInstance();
  }

  decrypt(encryptedEntries: Array<{ ciphertextHex: string }>): Uint8Array[] {
    if (this.hybridDecryption === null) {
      // TODO handle hybrid crypto not initialized here if needed
      throw new Error("The hybrid decryption scheme is not initialized");
    }
    const dec: HybridDecryption = this.hybridDecryption;

    const cleartextValues: Uint8Array[] = [];
    for (let index = 0; index < encryptedEntries.length; index++) {
      const { ciphertextHex } = encryptedEntries[index];

      // Hex decode (uid and value)
      const encryptedValue = hexDecode(ciphertextHex);

      // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
      const headerSize = dec.getHeaderSize(encryptedValue);
      const asymmetricHeader = encryptedValue.slice(4, 4 + headerSize);
      const encryptedSymmetricBytes = encryptedValue.slice(
        4 + headerSize,
        encryptedValue.length
      );

      // HEADER decryption: asymmetric decryption
      let cleartextHeader: ClearTextHeader;
      try {
        cleartextHeader = dec.decryptHybridHeader(asymmetricHeader);
      } catch (error) {
        // TODO Handle additional ABE decryption errors if need be
        continue;
      }

      // AES_DATA: AES Symmetric part decryption
      let cleartext: Uint8Array;
      try {
        cleartext = dec.decryptHybridBlock(
          cleartextHeader.symmetricKey,
          encryptedSymmetricBytes,
          cleartextHeader.metadata.uid,
          0
        );
      } catch (error) {
        // TODO Handle AES decryption errors if need be
        continue;
      }
      cleartextValues.push(cleartext);
    }

    return cleartextValues;
  }
}

const decrypter = new DecryptWorker();

ctx.onmessage = (event) => {
  const msg = event.data as DecryptionWorkerMessage;
  const msgName = msg.name;
  const input = msg.value;
  const isGpswImplementation = msg.isGpswImplementation;

  if (msgName === "INIT") {
    decrypter.init(input as string, isGpswImplementation);
    logger.log(() => "worker cache initialized");
    ctx.postMessage({
      name: "INIT",
      value: "SUCCESS",
    });
  } else if (msgName == "DECRYPT") {
    logger.log(() => "worker decrypting");
    ctx.postMessage({
      name: "DECRYPT",
      value: decrypter.decrypt(input),
    });
    logger.log(() => "... done decrypting");
  } else if (msgName == "DESTROY") {
    ctx.postMessage({
      name: "DESTROY",
      value: "SUCCESS",
    });
    logger.log(() => "worker cache destroyed");
  } else {
    ctx.postMessage({
      name: "ERROR",
      error: "Invalid message: " + msgName,
    });
  }
};
