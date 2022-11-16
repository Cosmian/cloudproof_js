import init, { InitInput }  from "../../../pkg/cover_crypt/cosmian_cover_crypt"
import { CoverCryptHybridDecryption } from "./hybrid_crypto/cover_crypt/decryption"
import { CoverCryptHybridEncryption } from "./hybrid_crypto/cover_crypt/encryption"
import { CoverCryptKeyGeneration } from "./keygen/cover_crypt"

let initialized: Promise<void> | undefined;

let wasmInit: (() => InitInput) | undefined;
export const setCoverCryptInit = (arg: () => InitInput): void => {
  wasmInit = arg;
};

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function CoverCrypt() {
  if (initialized === undefined) {
    // @ts-expect-error
    const loadModule = wasmInit();
    initialized = init(loadModule).then(() => undefined);
  }

  await initialized;

  return {
    CoverCryptKeyGeneration,
    CoverCryptHybridDecryption,
    CoverCryptHybridEncryption,
  }
}
