import { Hasher as WebAssemblyHasher } from "../pkg/anonymization/cloudproof_anonymization"

/**
 * Represents a class that applies a hash function to data.
 *
 */
export class Hasher {
  private readonly _hasher: WebAssemblyHasher

  /**
   * Creates a Hasher instance with the specified hash function and salt.
   * @param {string} hasherMethod - The name of the hash function to use.
   * @param {Iterable<number>|undefined} [salt] - The optional salt to use in the hash function.
   */
  constructor(
    hasherMethod: string,
    salt?: string | Iterable<number> | undefined,
  ) {
    if (salt !== undefined) {
      if (typeof salt === "string") {
        const saltArray = new TextEncoder().encode(salt)
        this._hasher = new WebAssemblyHasher(hasherMethod, saltArray)
      } else if (
        salt instanceof Array &&
        salt.every((value) => typeof value === "number")
      ) {
        const saltArray = new Uint8Array(Array.from(salt))
        this._hasher = new WebAssemblyHasher(hasherMethod, saltArray)
      } else {
        throw new Error(`Type of ${typeof salt} not supported.`)
      }
    } else {
      this._hasher = new WebAssemblyHasher(hasherMethod, undefined)
    }
  }

  /**
   * Applies the hash function to the specified elements and returns the resulting hash value.
   * @param {string|Iterable<number>} data - The elements to apply the hash function to.
   * @returns {string} The resulting hash value as a string.
   */
  public apply(data: string | Iterable<number>): string | Uint8Array {
    if (typeof data === "string") {
      return this._hasher.apply_str(data)
    } else if (
      data instanceof Array &&
      data.every((value) => typeof value === "number")
    ) {
      return this._hasher.apply_bytes(new Uint8Array(data))
    } else if (data instanceof Uint8Array) {
      return this._hasher.apply_bytes(new Uint8Array(data))
    } else {
      throw new Error(`Type of ${typeof data} not supported.`)
    }
  }
}
