import {
  NoiseGeneratorWithBounds as WebAssemblyNoiseGeneratorWithBounds,
  NoiseGeneratorWithParameters as WebAssemblyNoiseGeneratorWithParameters,
} from "../pkg/anonymization/cloudproof_anonymization"

/**
 * An interface for a noise generator that can apply noise to different types of data.
 */
interface NoiseGenerator {
  /**
   * Apply noise to a floating point number.
   *
   * @param data - The input number to apply noise to.
   * @returns The result of applying noise to the input number.
   */
  apply_on_float: (data: number) => number

  /**
   * Apply noise to a BigInt.
   *
   * @param data - The input BigInt to apply noise to.
   * @returns The result of applying noise to the input BigInt.
   */
  apply_on_int: (data: bigint) => bigint

  /**
   * Apply noise to a date string.
   *
   * @param data - The input date string to apply noise to.
   * @returns The result of applying noise to the input date string.
   */
  apply_on_date: (data: string) => string

  /**
   * Apply correlated noise to an array of floating point numbers.
   *
   * @param data - The input array of floating point numbers to apply correlated noise to.
   * @param factors - The array of correlation factors to use.
   * @returns The result of applying correlated noise to the input array of floating point numbers.
   */
  apply_correlated_noise_on_floats: (
    data: Float64Array,
    factors: Float64Array,
  ) => Float64Array

  /**
   * Apply correlated noise to an array of BigInts.
   *
   * @param data - The input array of BigInts to apply correlated noise to.
   * @param factors - The array of correlation factors to use.
   * @returns The result of applying correlated noise to the input array of BigInts.
   */
  apply_correlated_noise_on_ints: (
    data: BigInt64Array,
    factors: Float64Array,
  ) => BigInt64Array

  /**
   * Apply correlated noise to an array of date strings.
   *
   * @param data - The input array of date strings to apply correlated noise to.
   * @param factors - The array of correlation factors to use.
   * @returns The result of applying correlated noise to the input array of date strings.
   */
  apply_correlated_noise_on_dates: (
    data: string,
    factors: Float64Array,
  ) => string
}

/**
 * A class representing a noise generator.
 */
class Noise {
  /**
   * The underlying noise generator.
   */
  protected readonly _noise: NoiseGenerator

  /**
   * Creates a new instance of `Noise`.
   *
   * @param noise - The noise generator to use.
   */
  constructor(noise: NoiseGenerator) {
    this._noise = noise
  }

  /**
   * Applies noise to the input data.
   *
   * @param data - The input data to apply noise to.
   * @returns The input data with noise applied.
   * @throws An error if the type of `data` is not supported.
   */
  public apply(data: number | bigint | string): number | bigint | string {
    if (typeof data === "number") {
      return this._noise.apply_on_float(data)
    } else if (typeof data === "bigint") {
      return this._noise.apply_on_int(data)
    } else if (typeof data === "string") {
      return this._noise.apply_on_date(data)
    } else {
      throw new Error(`Type of ${typeof data} not supported.`)
    }
  }

  /**
   * Applies correlated noise to the input data.
   *
   * @param data - The input data to apply noise to.
   * @param factors - The factors to use for applying noise.
   * @returns The input data with noise applied.
   * @throws An error if the type of `data` is not supported.
   */
  public apply_correlated(
    data: Iterable<number> | Iterable<bigint> | Iterable<string>,
    factors: Iterable<number> = [],
  ): Iterable<number> | Iterable<bigint> | Iterable<string> {
    if (
      data instanceof Array &&
      data.every((value) => typeof value === "number")
    ) {
      const wasmResult = this._noise.apply_correlated_noise_on_floats(
        new Float64Array(data),
        new Float64Array(factors),
      )
      const result: number[] = []
      for (let i = 0; i < wasmResult.length; i++) {
        result.push(wasmResult[i])
      }
      return result
    } else if (
      data instanceof Array &&
      data.every((value) => typeof value === "bigint")
    ) {
      const wasmResult = this._noise.apply_correlated_noise_on_ints(
        new BigInt64Array(data),
        new Float64Array(factors),
      )
      const result: bigint[] = []
      for (let i = 0; i < wasmResult.length; i++) {
        result.push(BigInt(wasmResult[i]))
      }
      return result
    } else if (
      data instanceof Array &&
      data.every((value) => typeof value === "string")
    ) {
      const mergedData = data.join(";")
      const res = this._noise.apply_correlated_noise_on_dates(
        mergedData,
        new Float64Array(factors),
      )
      return res.split(";")
    } else {
      throw new Error(`Type of ${typeof data} not supported.`)
    }
  }
}

/**
 * A class representing a noise generator with parameters.
 *
 * @augments Noise
 */
export class NoiseWithParameters extends Noise {
  /**
   * Creates a new instance of `NoiseWithParameters`.
   *
   * @param methodName - the noise distribution to use ("Gaussian" or "Laplace")
   * @param mean - The mean value for generating noise.
   * @param stdDev - The standard deviation value for generating noise.
   */
  constructor(methodName: string, mean: number, stdDev: number) {
    super(new WebAssemblyNoiseGeneratorWithParameters(methodName, mean, stdDev))
  }
}

/**
 * A class representing a noise generator with bounds.
 *
 * @augments Noise
 */
export class NoiseWithBounds extends Noise {
  /**
   * Creates a new instance of `NoiseWithBounds`.
   *
   * @param methodName - the noise distribution to use ("Gaussian", "Laplace" or "Uniform")
   * @param minBound - The minimum bound for generating noise.
   * @param maxBound - The maximum bound for generating noise.
   */
  constructor(methodName: string, minBound: number, maxBound: number) {
    super(
      new WebAssemblyNoiseGeneratorWithBounds(methodName, minBound, maxBound),
    )
  }
}
