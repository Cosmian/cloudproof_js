import init from "../pkg/aesgcm/cloudproof_aesgcm"
import { Aes256Gcm } from "./aes256gcm"

let initialized: Promise<void> | undefined

let wasmInit: (() => any) | undefined
export const setAesGcmInit = (arg: () => any): void => {
  wasmInit = arg
}

/**
 * This is the main function for reusing webassembly code
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function AesGcm() {
  if (initialized === undefined) {
    if (wasmInit === undefined) {
      throw new Error("Please provide a WASM init function")
    }

    const loadModule = wasmInit()
    initialized = init(loadModule).then(() => undefined)
  }

  await initialized

  return {
    Aes256Gcm,
  }
}
