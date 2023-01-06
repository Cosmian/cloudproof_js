import {
  Attributes,
  VendorAttributes,
} from "../../kms/structs/object_attributes"
import { PublicKey, PrivateKey } from "../../kms/structs/objects"
import {
  webassembly_policy,
  webassembly_add_axis,
  webassembly_policy_axis,
} from "../../pkg/cover_crypt/cosmian_cover_crypt"

/* tslint:disable:max-classes-per-file */
export class PolicyAxis {
  private readonly _data: string

  constructor(
    name: string,
    attributeProperties: Array<{ name: string; isHybridized: boolean }>,
    isHierarchical: boolean,
  ) {
    this._data = webassembly_policy_axis(
      name,
      attributeProperties,
      isHierarchical,
    )
  }

  public toString(): string {
    return this._data
  }
}

export class Policy {
  private readonly _data: Uint8Array

  constructor(data: Uint8Array) {
    this._data = data
  }

  public static generate(nbCreations: number, axes: PolicyAxis[]): Policy {
    let policy = webassembly_policy(nbCreations)
    for (const axis of axes) {
      policy = webassembly_add_axis(policy, axis.toString())
    }

    return new Policy(policy)
  }

  /**
   * Packages the policy into a vendor attribute to include in a key
   *
   * @returns {VendorAttributes} the Policy as a VendorAttributes
   */
  public toVendorAttribute(): VendorAttributes {
    return new VendorAttributes(
      VendorAttributes.VENDOR_ID_COSMIAN,
      VendorAttributes.VENDOR_ATTR_COVER_CRYPT_POLICY,
      this._data,
    )
  }

  /**
   * Recover the Policy from the key attributes, throws otherwise
   *
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
        return new Policy(att.attributeValue)
      }
    }
    throw new Error("No policy available in the vendor attributes")
  }

  /**
   * Attempt to extract the Policy from a CoverCrypt public or private key
   * Throws if not found
   *
   * @param {PrivateKey | PublicKey} key the CoverCrypt key
   * @returns {Policy} the recovered Policy
   */
  public static fromKey(key: PrivateKey | PublicKey): Policy {
    return key.policy()
  }

  /**
   * Returns the policy bytes.
   *
   * @returns {Uint8Array} the string
   */
  public toBytes(): Uint8Array {
    return this._data
  }
}
