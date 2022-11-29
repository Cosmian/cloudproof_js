import init from "../pkg/cover_crypt/cosmian_cover_crypt"
import { CoverCryptHybridDecryption } from "./decryption"
import { CoverCryptHybridEncryption } from "./encryption"
import { CoverCryptKeyGeneration } from "./key_generation"

let initialized: Promise<void> | undefined

let wasmInit: (() => any) | undefined
export const setCoverCryptInit = (arg: () => any): void => {
  wasmInit = arg
}

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function CoverCrypt() {
  if (initialized === undefined) {
    // @ts-expect-error @ts-ignore-error
    const loadModule = wasmInit()
    initialized = init(loadModule).then(() => undefined)
  }

  await initialized

  return {
    CoverCryptKeyGeneration,
    CoverCryptHybridDecryption,
    CoverCryptHybridEncryption,
  }
}
