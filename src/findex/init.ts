import init from "../pkg/findex/cloudproof_findex"

import { FindexWithCloudBackend, FindexWithWasmBackend } from "./findex"
import { callbacksExamplesInMemory } from "./in_memory"
import { callbacksExamplesBetterSqlite3 } from "./sqlite"
import { Callbacks } from "./callbacks"
import { ServerToken } from "./server_token"

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
export async function Findex() {
  if (initialized === undefined) {
    if (wasmInit === undefined) {
      throw new Error("Please provide a WASM init function")
    }

    const loadModule = wasmInit()
    initialized = init(loadModule).then(() => undefined)
  }

  await initialized

  return {
    Callbacks,
    callbacksExamplesInMemory,
    callbacksExamplesBetterSqlite3,
    FindexWithWasmBackend,
    FindexWithCloudBackend,
    ServerToken,
  }
}
