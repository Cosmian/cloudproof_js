import init from "../pkg/ecies/cloudproof_ecies"
import { EciesSalsaSealBox } from "./ecies_salsa_seal_box"

let initialized: Promise<void> | undefined

let wasmInit: (() => any) | undefined
export const setEciesInit = (arg: () => any): void => {
  wasmInit = arg
}

/**
 * This is the main function for reusing webassembly code
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function Ecies() {
  if (initialized === undefined) {
    if (wasmInit === undefined) {
      throw new Error("Please provide a WASM init function")
    }

    const loadModule = wasmInit()
    initialized = init(loadModule).then(() => undefined)
  }

  await initialized

  return {
    EciesSalsaSealBox,
  }
}
