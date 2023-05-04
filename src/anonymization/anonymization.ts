import init from "../pkg/anonymization/cloudproof_anonymization"
import { Hasher } from "./hash"
import { NoiseWithBounds, NoiseWithParameters } from "./noise"
import { NumberAggregator, NumberScaler, DateAggregator } from "./number"
import { WordMasker, WordPatternMasker, WordTokenizer } from "./word"

let initialized: Promise<void> | undefined

let wasmInit: (() => any) | undefined
export const setAnonymizationInit = (arg: () => any): void => {
  wasmInit = arg
}

/**
 * This is the main function for reusing webassembly code
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function Anonymization() {
  if (initialized === undefined) {
    if (wasmInit === undefined) {
      throw new Error("Please provide a WASM init function")
    }

    const loadModule = wasmInit()
    initialized = init(loadModule).then(() => undefined)
  }

  await initialized

  return {
    Hasher,

    NoiseWithParameters,
    NoiseWithBounds,

    NumberAggregator,
    NumberScaler,
    DateAggregator,

    WordMasker,
    WordPatternMasker,
    WordTokenizer,
  }
}
