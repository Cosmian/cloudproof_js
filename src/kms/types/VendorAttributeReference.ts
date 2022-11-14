import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class VendorAttributeReference {
  /**
   * Text String (with usage limited to alphanumeric, underscore and period – i.e.
   * [A-Za-z0-9_.])
   */

  @metadata({
    name: "VendorIdentification",
    type: TtlvType.TextString,
  })
  private _vendorIdentification: string

  @metadata({
    name: "AttributeName",
    type: TtlvType.TextString,
  })
  private _attributeName: string

  constructor(vendorIdentification: string, attributeName: string) {
    this._vendorIdentification = vendorIdentification
    this._attributeName = attributeName
  }

  public get vendor_identification(): string {
    return this._vendorIdentification
  }

  public set vendor_identification(value: string) {
    this._vendorIdentification = value
  }

  public get attribute_name(): string {
    return this._attributeName
  }

  public set attribute_name(value: string) {
    this._attributeName = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof VendorAttributeReference)) {
      return false
    }
    const vendorAttributeReference = o
    return (
      this._vendorIdentification ===
        vendorAttributeReference.vendor_identification &&
      this._attributeName === vendorAttributeReference.attribute_name
    )
  }

  public toString(): string {
    return `{ vendor_identification='${this._vendorIdentification}', attribute_name='${this._attributeName}'}`
  }
}
