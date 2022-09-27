import { PropertyMetadata } from "../decorators/function";
import { TtlvType } from "../serialize/TtlvType";

export class VendorAttributeReference {
  /**
   * Text String (with usage limited to alphanumeric, underscore and period – i.e.
   * [A-Za-z0-9_.])
   */

  @PropertyMetadata({
    name: "VendorIdentification",
    type: TtlvType.TextString,
  })
  private _vendor_identification: string;

  @PropertyMetadata({
    name: "AttributeName",
    type: TtlvType.TextString,
  })
  private _attribute_name: string;

  constructor(vendor_identification: string, attribute_name: string) {
    this._vendor_identification = vendor_identification;
    this._attribute_name = attribute_name;
  }

  public get vendor_identification(): string {
    return this._vendor_identification;
  }

  public set vendor_identification(value: string) {
    this._vendor_identification = value;
  }

  public get attribute_name(): string {
    return this._attribute_name;
  }

  public set attribute_name(value: string) {
    this._attribute_name = value;
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true;
    }
    if (!(o instanceof VendorAttributeReference)) {
      return false;
    }
    const vendorAttributeReference = o;
    return (
      this._vendor_identification ===
        vendorAttributeReference.vendor_identification &&
      this._attribute_name === vendorAttributeReference.attribute_name
    );
  }

  public toString(): string {
    return (
      "{" +
      " vendor_identification='" +
      this._vendor_identification +
      "'" +
      ", attribute_name='" +
      this._attribute_name +
      "'" +
      "}"
    );
  }
}
