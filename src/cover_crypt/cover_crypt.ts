import init from "../pkg/cover_crypt/cosmian_cover_crypt"
import { Policy, PolicyAxis } from "./interfaces/policy"
import { CoverCryptHybridDecryption, decrypt } from "./decryption"
import { CoverCryptHybridEncryption, encrypt } from "./encryption"
import {
  CoverCryptKeyGeneration,
  generateMasterKeys,
  generateUserSecretKey,
  rotateAttributes,
} from "./key_generation"

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
    encrypt,
    decrypt,

    generateMasterKeys,
    generateUserSecretKey,
    rotateAttributes,

    CoverCryptKeyGeneration,
    CoverCryptHybridDecryption,
    CoverCryptHybridEncryption,
    Policy,
    PolicyAxis,
  }
}
