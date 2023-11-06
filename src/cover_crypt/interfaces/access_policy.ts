export class AccessPolicy {
  private readonly _booleanAccessPolicy: string

  /**
   * Create an Access Policy from a boolean expression over the attributes e.g.
   * (Department::MKG || Department::FIN) && Security Level::Confidential
   * @param {string} booleanAccessPolicy the boolean expression
   */
  constructor(booleanAccessPolicy: string) {
    this._booleanAccessPolicy = booleanAccessPolicy
  }

  public get booleanAccessPolicy(): string {
    return this._booleanAccessPolicy
  }
}

/**
 * Convert a JSON KMIP access policy into a boolean access policy
 * @param {string} jsonAccessPolicy the KMIP JSON access policy
 * @returns {string} the boolean access policy
 */
export function toBooleanExpression(jsonAccessPolicy: string): string {
  const ap = JSON.parse(jsonAccessPolicy)
  return toBooleanExpression_(ap, 0)
}

// eslint-disable-next-line jsdoc/require-jsdoc
function toBooleanExpression_(obj: Object, depth: number): string {
  const [op, next] = Object.entries(obj)[0]
  if (op.toLowerCase() === "attr") {
    return next
  }
  let leftBracket = "("
  let rightBracket = ")"
  if (depth === 0) {
    leftBracket = ""
    rightBracket = ""
  }
  if (op.toLowerCase() === "and") {
    return `${leftBracket}${toBooleanExpression_(
      next[0],
      depth + 1,
    )} && ${toBooleanExpression_(next[1], depth + 1)}${rightBracket}`
  }
  if (op.toLowerCase() === "or") {
    return `${leftBracket}${toBooleanExpression_(
      next[0],
      depth + 1,
    )} || ${toBooleanExpression_(next[1], depth + 1)}${rightBracket}`
  }
  return next
}
