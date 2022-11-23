import { webassembly_parse_boolean_access_policy } from "../../../pkg/cover_crypt/cosmian_cover_crypt"
import {
  Attributes,
  VendorAttributes,
} from "../../../kms/structs/object_attributes"
import { PrivateKey } from "../../../kms/structs/objects"
import { CoverCrypt } from "../core/cover_crypt"

export class AccessPolicy {
  private readonly _booleanAccessPolicy: string

  /**
   * Create an Access Policy from a boolean expression over the attributes e.g.
   * (Department::MKG || Department::FIN) && Security Level::Confidential
   *
   * @param {string} booleanAccessPolicy the boolean expression
   */
  constructor(booleanAccessPolicy: string) {
    this._booleanAccessPolicy = booleanAccessPolicy
  }

  public get booleanAccessPolicy(): string {
    return this._booleanAccessPolicy
  }

  /**
   * Convert to KMIP JSON format (to set in Vendor Attributes)
   *
   * @returns {string} the KMIP JSON Format
   */
  public async toKmipJson(): Promise<string> {
    await CoverCrypt();
    return webassembly_parse_boolean_access_policy(this._booleanAccessPolicy)
  }

  /**
   * Packages the access policy into a vendor attribute to include in a user decryption key
   *
   * @returns {VendorAttributes} the Access Policy as a VendorAttributes
   */
  public async toVendorAttribute(): Promise<VendorAttributes> {
    return new VendorAttributes(
      VendorAttributes.VENDOR_ID_COSMIAN,
      VendorAttributes.VENDOR_ATTR_COVER_CRYPT_ACCESS_POLICY,
      new TextEncoder().encode(await this.toKmipJson()),
    )
  }

  /**
   * Create an Access Policy from the KMIP JSON format
   *
   * @param {string} kmipJsonAccessPolicy the KMIP JSON access policy format
   * @returns {AccessPolicy} the access policy
   */
  public static fromKmipJson(kmipJsonAccessPolicy: string): AccessPolicy {
    return new AccessPolicy(toBooleanExpression(kmipJsonAccessPolicy))
  }

  /**
   * Recover the Access Policy from the key attributes, throws otherwise
   *
   * @param {Attributes} attributes the key attributes to parse
   * @returns {AccessPolicy} the Access Policy
   */
  public static fromAttributes(attributes: Attributes): AccessPolicy {
    const attrs = attributes.vendorAttributes
    if (typeof attrs === "undefined" || attrs.length === 0) {
      throw new Error("No access policy available in the vendor attributes")
    }
    for (const att of attrs) {
      if (
        att.attributeName ===
        VendorAttributes.VENDOR_ATTR_COVER_CRYPT_ACCESS_POLICY ||
        att.attributeName === VendorAttributes.VENDOR_ATTR_ABE_ACCESS_POLICY
      ) {
        return AccessPolicy.fromKmipJson(
          new TextDecoder().decode(att.attributeValue),
        )
      }
    }
    throw new Error("No access policy available in the vendor attributes")
  }

  /**
   * Attempt to extract the Access Policy from a CoverCrypt User Decryption Key
   * Throws if not found
   *
   * @param {PrivateKey} key the CoverCrypt User Decryption Key
   * @returns {AccessPolicy} the recovered Access Policy
   */
  public static fromKey(key: PrivateKey): AccessPolicy {
    const keyValue = key.keyBlock.keyValue
    if (
      keyValue === null ||
      keyValue instanceof Uint8Array ||
      keyValue.attributes === null
    ) {
      throw new Error("No policy can be extracted from that key")
    }

    return this.fromAttributes(keyValue.attributes)
  }
}
/**
 * Convert a JSON KMIP access policy into a boolean access policy
 *
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
