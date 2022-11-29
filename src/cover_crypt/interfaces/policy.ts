import {
  Attributes,
  VendorAttributes,
} from "../../kms/structs/object_attributes"
import { PublicKey, PrivateKey } from "../../kms/structs/objects"
import { logger } from "../../utils/logger"

/* tslint:disable:max-classes-per-file */
export class PolicyAxis {
  private _name: string
  private _attributes: string[]
  private _hierarchical: boolean

  // Getters and setters
  public get attributes(): string[] {
    return this._attributes
  }

  public set attributes(value: string[]) {
    this._attributes = value
  }

  public get name(): string {
    return this._name
  }

  public set name(value: string) {
    this._name = value
  }

  public get hierarchical(): boolean {
    return this._hierarchical
  }

  public set hierarchical(value: boolean) {
    this._hierarchical = value
  }

  // Constructor
  constructor(name: string, attributes: string[], hierarchical: boolean) {
    this._name = name
    this._attributes = attributes
    this._hierarchical = hierarchical
  }
}

export class Policy {
  private readonly _axes: PolicyAxis[]
  private readonly _maxAttributeCreations: number
  private readonly _lastAttributeValue: number
  private readonly _attributeToInt: { [attribute: string]: number[] }

  constructor(
    axes: PolicyAxis[],
    maxAttributeCreations?: number,
    lastAttributeValue?: number,
    attributeToInt?: { [attribute: string]: number[] },
  ) {
    this._axes = axes
    this._maxAttributeCreations = maxAttributeCreations ?? (2 ^ 32) - 1
    if (typeof attributeToInt !== "undefined") {
      this._attributeToInt = attributeToInt
    } else {
      this._attributeToInt = {}
      let attributeNb = 0
      this._axes.forEach((axis: PolicyAxis) => {
        axis.attributes.forEach((attr: string) => {
          attributeNb++
          this._attributeToInt[`${axis.name}::${attr}`] = [attributeNb]
        })
      })
    }
    if (typeof lastAttributeValue !== "undefined") {
      this._lastAttributeValue = lastAttributeValue
    } else {
      let lastVal = 0
      Object.entries(this._attributeToInt).forEach(([, values]) =>
        values.forEach((v) => {
          if (v > lastVal) {
            lastVal = v
          }
        }),
      )
      this._lastAttributeValue = lastVal
    }
  }

  /**
   * This function converts a Policy toa KMIP JSON format
   * and returns the corresponding bytes
   *
   * @returns {Uint8Array} a byte array of the KMIP JSON encoded Policy
   */
  public toJsonEncoded(): Uint8Array {
    const policy: any = {}
    policy.last_attribute_value = this._lastAttributeValue
    policy.axes = {}
    this._axes.forEach((axis: PolicyAxis) => {
      policy.axes[axis.name] = [axis.attributes, axis.hierarchical]
    })
    policy.attribute_to_int = this._attributeToInt
    policy.max_attribute_creations = this._maxAttributeCreations
    const json = JSON.stringify(policy)
    logger.log(() => `toJsonEncoded: policy (JSON)${json}`)
    const result = new TextEncoder().encode(json)
    return result
  }

  /**
   * Parse the Policy from a KMIP encoded JSON string
   *
   * @param {string} jsonPolicy the KMIP encoded JSON
   * @returns {Policy} the policy
   */
  public static fromJsonEncoded(jsonPolicy: string): Policy {
    const policyJson = JSON.parse(jsonPolicy)
    logger.log(
      () =>
        `fromJsonEncoded: input policy json: ${JSON.stringify(
          policyJson,
          null,
          4,
        )}`,
    )

    // Fill Policy Axis
    const axes: PolicyAxis[] = []
    for (const axis of Object.keys(policyJson.axes)) {
      const value = policyJson.axes[axis]
      logger.log(
        () => `fromJsonEncoded: axis: ${axis}, value: ${value[0] as string}`,
      )
      axes.push(new PolicyAxis(axis, value[0], value[1]))
    }
    return new Policy(
      axes,
      policyJson.max_attribute_creations,
      policyJson.last_attribute_value,
      policyJson.attribute_to_int,
    )
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
      this.toJsonEncoded(),
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
        att.attributeName === VendorAttributes.VENDOR_ATTR_COVER_CRYPT_POLICY ||
        att.attributeName === VendorAttributes.VENDOR_ATTR_ABE_POLICY
      ) {
        return Policy.fromJsonEncoded(
          new TextDecoder().decode(att.attributeValue),
        )
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

  /**
   * Print the policy as a JSON string
   *
   * @returns {string} the JSON string
   */

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Policy)) {
      return false
    }

    if (this._axes.length !== o._axes.length) {
      return false
    }
    const aAxis = this._axes.sort((a, b) => {
      return a.name > b.name ? 1 : -1
    })
    const bAxis = o._axes.sort((a, b) => {
      return a.name > b.name ? 1 : -1
    })

    const aKeys = Object.keys(this._attributeToInt)
    const bKeys = Object.keys(o._attributeToInt)
    if (aKeys.length !== bKeys.length) {
      return false
    }
    for (const k of aKeys) {
      if (
        JSON.stringify(this._attributeToInt[k]) !==
        JSON.stringify(o._attributeToInt[k])
      ) {
        return false
      }
    }

    return (
      JSON.stringify(aAxis) === JSON.stringify(bAxis) &&
      this._maxAttributeCreations === o._maxAttributeCreations &&
      this._lastAttributeValue === o._lastAttributeValue
    )
  }
}
