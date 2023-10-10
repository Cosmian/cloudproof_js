import init, { WasmCallbacks } from "../pkg/findex/cloudproof_findex"

import { callbacksExamplesInMemory } from "./in_memory"
import { callbacksExamplesBetterSqlite3 } from "./sqlite"
import { Findex } from "./findex"

export * from "./types"

let initialized: Promise<void> | undefined

let wasmInit: (() => any) | undefined

export const setFindexInit = (arg: () => any): void => {
  wasmInit = arg
}

export async function loadWasm() {
  if (initialized === undefined) {
    // @ts-expect-error @ts-ignore-error
    initialized = init(wasmInit())
  }
  await initialized
}

export {
  Findex,
  WasmCallbacks,
  callbacksExamplesInMemory,
  callbacksExamplesBetterSqlite3,
}
