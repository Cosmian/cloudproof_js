import {
  NumberAggregator as WebAssemblyNumberAggregator,
  NumberScaler as WebAssemblyNumberScaler,
  DateAggregator as WebAssemblyDateAggregator,
} from "../pkg/anonymization/cloudproof_anonymization"

/**
The NumberAggregator is a data anonymization technique used to round sensitive measurements
to the desired power of ten.
 */
export class NumberAggregator {
  private readonly _numberAggregator: WebAssemblyNumberAggregator
  /**
   * Creates an instance of NumberAggregator.
   * @param powerOfTen The desired power of ten to round the measurements to.
   */
  constructor(powerOfTen: number) {
    this._numberAggregator = new WebAssemblyNumberAggregator(powerOfTen)
  }

  /**
   * Applies the number aggregator on the provided data.
   * @param data The number or bigint to apply the number aggregator on.
   * @returns The rounded value of the data.
   * @throws An error if the type of data is not supported.
   */
  public apply(data: number | bigint): string {
    if (typeof data === "number") {
      return this._numberAggregator.apply_on_float(data)
    } else if (typeof data === "bigint") {
      return this._numberAggregator.apply_on_int(data)
    } else {
      throw new Error(`Type of ${typeof data} not supported.`)
    }
  }
}
/**
 * A data anonymization technique to round dates to the unit of time specified.
 * @class
 */
export class DateAggregator {
  private readonly _dateAggregator: WebAssemblyDateAggregator

  /**
   * Creates a new instance of the `DateAggregator`.
   * @param {string} timeUnit - The unit of time to round the date to.
   */
  constructor(timeUnit: string) {
    this._dateAggregator = new WebAssemblyDateAggregator(timeUnit)
  }

  /**
   * Applies the `DateAggregator` to the given date.
   * @param {string} data - The date to apply the `DateAggregator` to.
   * @returns {string} - The rounded date string.
   * @throws {Error} - If the input data is not a valid date string.
   */
  public apply(data: string): string {
    return this._dateAggregator.apply_on_date(data)
  }
}

/// A data anonymization method that scales individual values while keeping the
/// overall distribution of the data.
export class NumberScaler {
  private readonly _numberScaler: WebAssemblyNumberScaler

  constructor(
    mean: number,
    stdDeviation: number,
    scale: number,
    translate: number,
  ) {
    this._numberScaler = new WebAssemblyNumberScaler(
      mean,
      stdDeviation,
      scale,
      translate,
    )
  }

  public apply(data: number | bigint): number | bigint {
    if (typeof data === "number") {
      return this._numberScaler.apply_on_float(data)
    } else if (typeof data === "bigint") {
      return this._numberScaler.apply_on_int(data)
    } else {
      throw new Error(`Type of ${typeof data} not supported.`)
    }
  }
}
