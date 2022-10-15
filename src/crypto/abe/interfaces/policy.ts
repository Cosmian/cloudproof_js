/* tslint:disable:max-classes-per-file */
import { VendorAttribute } from "kms/types/VendorAttribute"
import { logger } from "utils/logger"

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
  private readonly _axis: PolicyAxis[]
  private readonly _maxAttributeCreations: number
  private readonly _lastAttributeValue?: number
  private readonly _attributeToInt?: {}

  constructor(
    axis: PolicyAxis[],
    maxAttributeCreations?: number,
    lastAttributeValue?: number,
    attributeToInt?: {}
  ) {
    this._axis = axis
    this._maxAttributeCreations = maxAttributeCreations ?? 2 ^ 32 - 1
    this._lastAttributeValue = lastAttributeValue
    this._attributeToInt = attributeToInt
  }

  /**
   * This function convert a Policy to JSON format and returns the corresponding bytes
   *
   * @returns {Uint8Array} a byte array of the JSON encoding Policy
   */
  public toJsonEncoded(): Uint8Array {
    const policy: any = {}
    policy.axes = {}
    policy.attribute_to_int = {}
    if (this._lastAttributeValue === undefined) {
      let attributeNb = 0
      this._axis.forEach((axis: PolicyAxis) => {
        policy.axes[axis.name] = [axis.attributes, axis.hierarchical]
        axis.attributes.forEach((attr: string) => {
          attributeNb++
          policy.attribute_to_int[axis.name + "::" + attr] = [attributeNb]
        })
      })
      policy.last_attribute_value = attributeNb
    } else {
      policy.last_attribute_value = this._lastAttributeValue
      policy.attribute_to_int = this._attributeToInt
      this._axis.forEach((axis: PolicyAxis) => {
        policy.axes[axis.name] = [axis.attributes, axis.hierarchical]
      })
    }
    policy.max_attribute_creations = this._maxAttributeCreations

    const json = JSON.stringify(policy)
    logger.log(() => `policy (JSON)${json}`)
    const result = new TextEncoder().encode(json)
    return result
  }

  public static fromJsonEncoded(policy: string): Policy {
    logger.log(() => "policy: " + policy)
    const policyJson = JSON.parse(policy)

    // Fill Policy Axis
    const axis: PolicyAxis[] = []
    for (const e of Object.keys(policyJson.axes)) {
      const value = policyJson.axes[e]
      logger.log(() => "Axis name: " + e)
      logger.log(() => "Axis value: " + (value[0] as string))
      axis.push(new PolicyAxis(e, value[0], value[1]))
    }
    return new Policy(
      axis,
      policyJson.max_attribute_creations,
      policyJson.last_attribute_value,
      policyJson.attribute_to_int
    )
  }

  public toVendorAttribute(): VendorAttribute {
    return new VendorAttribute(VendorAttribute.VENDOR_ID_COSMIAN, VendorAttribute.VENDOR_ATTR_COVER_CRYPT_POLICY, this.toJsonEncoded())
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
