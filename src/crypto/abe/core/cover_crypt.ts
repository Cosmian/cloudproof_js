import { initCoverCrypt } from "../../../utils/utils";
import { CoverCryptHybridDecryption } from "./hybrid_crypto/cover_crypt/decryption";
import { CoverCryptHybridEncryption } from "./hybrid_crypto/cover_crypt/encryption";
import { CoverCryptKeyGeneration } from "./keygen/cover_crypt";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function CoverCrypt() {
    await initCoverCrypt();
  
    return {
      CoverCryptKeyGeneration,
      CoverCryptHybridDecryption,
      CoverCryptHybridEncryption,
    }
  }
  