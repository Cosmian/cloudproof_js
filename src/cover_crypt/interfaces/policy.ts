import {
  Attributes,
  VendorAttributes,
} from "../../kms/structs/object_attributes"
import { PublicKey, PrivateKey } from "../../kms/structs/objects"
import {
  webassembly_policy,
  webassembly_add_axis,
  webassembly_policy_axis,
} from "../../pkg/cover_crypt/cloudproof_cover_crypt"

/* tslint:disable:max-classes-per-file */
export class PolicyAxis {
  private readonly _policyAxisJson: string

  constructor(
    name: string,
    attributeProperties: Array<{ name: string; isHybridized: boolean }>,
    isHierarchical: boolean,
  ) {
    this._policyAxisJson = webassembly_policy_axis(
      name,
      attributeProperties,
      isHierarchical,
    )
  }

  public toString(): string {
    return this._policyAxisJson
  }
}

export class Policy {
  private _policyBytes: Uint8Array

  constructor(axes: PolicyAxis[], nbCreations?: number) {
    let policy = webassembly_policy(nbCreations ?? (2 ^ 32) - 1)
    for (const axis of axes) {
      policy = webassembly_add_axis(policy, axis.toString())
    }
    this._policyBytes = policy
  }

  /**
   * Packages the policy into a vendor attribute to include in a key
   * @returns {VendorAttributes} the Policy as a VendorAttributes
   */
  public toVendorAttribute(): VendorAttributes {
    return new VendorAttributes(
      VendorAttributes.VENDOR_ID_COSMIAN,
      VendorAttributes.VENDOR_ATTR_COVER_CRYPT_POLICY,
      this._policyBytes,
    )
  }

  /**
   * Recover the Policy from the key attributes, throws otherwise
   * @param {Attributes} attributes the key attributes to parse
   * @returns {Policy} the Policy
   */
  public static fromAttributes(attributes: Attributes): Policy {
    const attrs = attributes.vendorAttributes
    if (typeof attrs === "undefined" || attrs.length === 0) {
      throw new Error("No policy available in the vendor attributes")
    }
    for (const att of attrs) {
      if (
        att.attributeName === VendorAttributes.VENDOR_ATTR_COVER_CRYPT_POLICY
      ) {
        return Policy.fromBytes(att.attributeValue)
      }
    }
    throw new Error("No policy available in the vendor attributes")
  }

  /**
   * Attempt to extract the Policy from a CoverCrypt public or private key
   * Throws if not found
   * @param {PrivateKey | PublicKey} key the CoverCrypt key
   * @returns {Policy} the recovered Policy
   */
  public static fromKey(key: PrivateKey | PublicKey): Policy {
    return key.policy()
  }

  /**
   * Returns the policy bytes.
   * @returns {Uint8Array} the string
   */
  public toBytes(): Uint8Array {
    return this._policyBytes
  }

  static fromBytes(policyBytes: Uint8Array): Policy {
    const policy = new Policy([], 0)
    policy._policyBytes = policyBytes
    return policy
  }
}
