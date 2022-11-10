// TODO: find correct types

/**
 *
 * @param {any} e error
 * @returns {string} sanitized error
 */
export function toString(e?: any): string {
  return e.name().replace("_", "")
}

/**
 *
 * @param {any} e error
 * @returns {string} sanitized error
 */
export function toMap(e: any[]): string[] {
  return e.map((error) => error.toString())
}
