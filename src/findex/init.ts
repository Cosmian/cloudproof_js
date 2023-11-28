import init from "../pkg/findex/cloudproof_findex"

let initialized: Promise<void> | undefined

let wasmInit: (() => any) | undefined

export const setFindexInit = (arg: () => any): void => {
  wasmInit = arg
}

/**
 * This is the main function for reusing webassembly code
 * @returns initialized objects
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function loadWasm() {
  if (initialized === undefined) {
    if (wasmInit === undefined) {
      throw new Error("Please provide a WASM init function")
    }

    const loadModule = wasmInit()
    initialized = init(loadModule).then(() => undefined)
  }

  await initialized
}
