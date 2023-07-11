import { expect, test } from "vitest"
import { Anonymization } from ".."

/* Importing the functions from the Anonymization library. */
const {
  Hasher,
  NoiseWithParameters,
  NoiseWithBounds,
  WordMasker,
  NumberAggregator,
  NumberScaler,
  DateAggregator,
  WordPatternMasker,
  WordTokenizer,
} = await Anonymization()

test("hashing technique", async () => {
  const sha2Hasher = new Hasher("SHA2")
  const sha2Digest = sha2Hasher.apply("test sha2")
  const sha2Digest2 = sha2Hasher.apply(new TextEncoder().encode("test sha2"))
  const sha2Digest3 = sha2Hasher.apply(
    Array.from(new TextEncoder().encode("test sha2")),
  )

  expect(sha2Digest === "Px0txVYqBePXWF5K4xFn0Pa2mhnYA/jfsLtpIF70vJ8=")
  expect(sha2Digest2 === "Px0txVYqBePXWF5K4xFn0Pa2mhnYA/jfsLtpIF70vJ8=")
  expect(sha2Digest3 === "Px0txVYqBePXWF5K4xFn0Pa2mhnYA/jfsLtpIF70vJ8=")

  const sha3Hasher = new Hasher("SHA3")
  const sha3Digest = sha3Hasher.apply("test sha3")
  expect(sha3Digest === "b8rRtRqnSFs8s12jsKSXHFcLf5MeHx8g6m4tvZq04/I=")

  const argon2Hasher = new Hasher("Argon2", "example salt")
  const argon2Digest = argon2Hasher.apply("low entropy data")
  expect(argon2Digest === "JXiQyIYJAIMZoDKhA/BOKTo+142aTkDvtITEI7NXDEM=")
})

test("Gaussian noise technique", async () => {
  const noiser = new NoiseWithParameters("Gaussian", 0, 1)
  const noisyData = noiser.apply(40.0)
  expect(noisyData).greaterThan(30).lessThanOrEqual(50)

  const anotherNoiser = new NoiseWithBounds("Gaussian", -5, 5)
  const anotherData = anotherNoiser.apply(40.0) as number
  expect(anotherData).greaterThan(30).lessThanOrEqual(50)

  try {
    new NoiseWithParameters("Gaussian", 0, -1) // eslint-disable-line no-new
  } catch (error) {
    expect(error).toEqual(
      'Error initializing noise with parameters: AnonymizationError("Standard Deviation must be greater than 0 to generate noise.")',
    )
  }

  try {
    new NoiseWithBounds("Gaussian", 1, 0) // eslint-disable-line no-new
  } catch (error) {
    expect(error).toEqual(
      'Error initializing noise with bounds: AnonymizationError("Min bound must be inferior to Max bound.")',
    )
  }
})

test("Laplace noise technique", async () => {
  const noiser = new NoiseWithParameters("Laplace", 0, 1)
  let noisyData = noiser.apply(40.0)
  expect(noisyData).toBeGreaterThanOrEqual(30)
  expect(noisyData).toBeLessThanOrEqual(50)

  const noiserWithBounds = new NoiseWithBounds("Laplace", -10, 10)
  noisyData = noiserWithBounds.apply(40.0)
  expect(noisyData).toBeGreaterThanOrEqual(30)
  expect(noisyData).toBeLessThanOrEqual(50)
})

test("Uniform noise", async () => {
  try {
    const res = new NoiseWithParameters("Uniform", 0, 2)
    // The following assertion will only fail if the result is Err in Rust code
    expect(res).toBeUndefined()
  } catch (error) {
    expect(error).toEqual(
      'Error initializing noise with parameters: AnonymizationError("Uniform is not a supported distribution.")',
    )
  }

  const noiser = new NoiseWithBounds("Uniform", -10, 10)
  const noisyData = noiser.apply(40.0)
  expect(noisyData).toBeGreaterThanOrEqual(30)
  expect(noisyData).toBeLessThanOrEqual(50)
})

test("test_noise_gaussian_i64", async () => {
  const gaussianNoise = new NoiseWithParameters("Gaussian", 0, 1)
  let noisyData = gaussianNoise.apply(BigInt(40))
  expect(noisyData).toBeGreaterThanOrEqual(30)
  expect(noisyData).toBeLessThanOrEqual(50)

  const gaussianNoiseWithBounds = new NoiseWithBounds("Gaussian", -5, 5)
  noisyData = gaussianNoiseWithBounds.apply(BigInt(40))
  expect(noisyData).toBeGreaterThanOrEqual(30)
  expect(noisyData).toBeLessThanOrEqual(50)
})

test("test_correlated_noise_gaussian_f64", async () => {
  const noiseGenerator = new NoiseWithParameters("Gaussian", 10.0, 2.0)
  const values = [1.0, 1.0, 1.0]
  const factors = [1.0, 2.0, 4.0]
  const noisyValues = noiseGenerator.apply_correlated(
    values,
    factors,
  ) as number[]

  expect((noisyValues[0] - values[0]) * factors[1]).toBeCloseTo(
    (noisyValues[1] - values[1]) * factors[0],
    6,
  )

  expect((noisyValues[0] - values[0]) * factors[2]).toBeCloseTo(
    (noisyValues[2] - values[2]) * factors[0],
    6,
  )

  // Ordering only holds if noise is positive
  expect(noisyValues[0]).toBeLessThan(noisyValues[1])
  expect(noisyValues[1]).toBeLessThan(noisyValues[2])
})

test("test_correlated_noise_uniform_date", async () => {
  const noiseGenerator = new NoiseWithBounds("Uniform", 0, 10)

  const values = [
    "2023-05-02T00:00:00Z",
    "2023-05-02T00:00:00Z",
    "2023-05-02T00:00:00Z",
  ]
  const factors = [1.0, 2.0, 4.0]

  const noisyValues = Array.from(
    noiseGenerator.apply_correlated(values, factors) as Iterable<number>,
  ).map((value) => new Date(value))

  // Ordering only holds if noise is positive
  expect(noisyValues[0].getSeconds()).toBeLessThanOrEqual(
    noisyValues[1].getSeconds(),
  )
  expect(noisyValues[1].getSeconds()).toBeLessThanOrEqual(
    noisyValues[2].getSeconds(),
  )
})

test("mask word", () => {
  const inputStr = "Confidential: contains -secret- documents"
  const blockWords = ["confidential", "SECRET"]
  const wordMasker = new WordMasker(blockWords)

  const safeStr = wordMasker.apply(inputStr)

  expect(safeStr).toEqual("XXXX: contains -XXXX- documents")
})

test("test_token_word", () => {
  const inputStr =
    "confidential : contains secret documents with confidential info"
  const blockWords = ["confidential", "SECRET"]
  const wordTokenizer = new WordTokenizer(blockWords)

  const safeStr = wordTokenizer.apply(inputStr)

  const words = safeStr.split(" ")
  expect(words).not.toContain("confidential")
  expect(words).not.toContain("secret")
  expect(words).toContain("documents")
})

test("test_word_pattern", () => {
  const inputStr =
    "Confidential: contains -secret- documents with confidential info"
  const pattern = "-\\w+-"
  const patternMatcher = new WordPatternMasker(pattern, "####")

  const matchedStr = patternMatcher.apply(inputStr)
  expect(matchedStr).toBe(
    "Confidential: contains #### documents with confidential info",
  )

  expect(() => new WordPatternMasker("[", "####")).toThrow()
})

test("test_float_aggregation", () => {
  let floatAggregator = new NumberAggregator(-1)
  let res = floatAggregator.apply(1234.567)
  expect(res).toEqual("1234.6")

  floatAggregator = new NumberAggregator(2)
  res = floatAggregator.apply(1234.567)
  expect(res).toEqual("1200")

  floatAggregator = new NumberAggregator(10)
  res = floatAggregator.apply(1234.567)
  expect(res).toEqual("0")

  floatAggregator = new NumberAggregator(-10)
  res = floatAggregator.apply(1234.567)
  expect(res).toEqual("1234.5670000000")

  try {
    new NumberAggregator(309) // eslint-disable-line no-new
  } catch (error) {
    expect(error).toEqual(
      'Error initializing NumberAggregator: AnonymizationError("Exponent must be lower than 308, given 309.")',
    )
  }
})

test("test_int_aggregation", () => {
  let intAggregator = new NumberAggregator(2)
  let res = intAggregator.apply(BigInt(1234))
  expect(res).toEqual("1200")

  intAggregator = new NumberAggregator(-2)
  res = intAggregator.apply(BigInt(1234))
  expect(res).toEqual("1234")
})

test("test_time_aggregation", () => {
  const timeAggregator = new DateAggregator("Hour")
  const inputDateStr = "2023-04-07T12:34:56+02:00"
  const outputDateStr = timeAggregator.apply(inputDateStr)

  const expectedDate = "2023-04-07T12:00:00+02:00"
  expect(expectedDate).toBe(outputDateStr)

  const outputDate = new Date(outputDateStr.slice(0, -6)) // remove the timezone for simplification
  expect(outputDate.getDate()).toBe(7)
  expect(outputDate.getMonth()).toBe(3) // Months are zero-based in JavaScript
  expect(outputDate.getFullYear()).toBe(2023)

  expect(outputDate.getHours()).toBe(12)
  expect(outputDate.getMinutes()).toBe(0)
  expect(outputDate.getSeconds()).toBe(0)

  // Check that the output date has the same timezone as the input
  expect(outputDate.getTimezoneOffset()).toBe(
    new Date(inputDateStr).getTimezoneOffset(),
  )

  try {
    timeAggregator.apply("AAAA")
  } catch (error) {
    expect(error).toEqual(
      'Error rounding date: ConversionError("input contains invalid characters")',
    )
  }
})

test("test_date_aggregation", () => {
  const dateAggregator = new DateAggregator("Month")
  const inputDateStr = "2023-04-07T12:34:56-05:00"
  const outputDateStr = dateAggregator.apply(inputDateStr)

  const expectedDate = "2023-04-01T00:00:00-05:00"
  expect(expectedDate).toBe(outputDateStr)

  const outputDate = new Date(outputDateStr.slice(0, -6)) // remove the timezone for simplification
  expect(outputDate.getDate()).toBe(1)
  expect(outputDate.getMonth() + 1).toBe(4)
  expect(outputDate.getFullYear()).toBe(2023)

  expect(outputDate.getHours()).toBe(0)
  expect(outputDate.getMinutes()).toBe(0)
  expect(outputDate.getSeconds()).toBe(0)

  // Check that the output date has the same timezone as the input
  expect(outputDate.getTimezoneOffset()).toBe(
    new Date(inputDateStr).getTimezoneOffset(),
  )
})

test("test_float_scale", () => {
  const floatScaler = new NumberScaler(10.0, 5.0, 2.0, -50.0)

  const n1 = floatScaler.apply(20.0)
  const n2 = floatScaler.apply(19.5)

  expect(n1).toBeGreaterThan(n2)
})

test("test_int_scale", () => {
  const intScaler = new NumberScaler(10.0, 5.0, 20.0, -50.0)

  const n1 = intScaler.apply(20)
  const n2 = intScaler.apply(19)

  expect(n1).toBeGreaterThanOrEqual(n2)
})
