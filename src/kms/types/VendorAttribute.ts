import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

/**
 * A vendor specific Attribute is a structure used for sending and receiving a
 * Managed Object attribute. The Vendor Identification and Attribute Name are
 * text-strings that are used to identify the attribute. The Attribute Value is
 * either a primitive data type or structured object, depending on the
 * attribute. Vendor identification values “x” and “y” are reserved for KMIP
 * v2.0 and later implementations referencing KMIP v1.x Custom Attributes.
 *
 * Vendor Attributes created by the client with Vendor Identification “x” are
 * not created (provided during object creation), set, added, adjusted, modified
 * or deleted by the server.
 *
 * Vendor Attributes created by the server with Vendor Identification “y” are
 * not created (provided during object creation), set, added, adjusted, modified
 * or deleted by the client.
 */
export class VendorAttribute implements KmipStruct {
  public static VENDOR_ID_COSMIAN = "cosmian"

  public static VENDOR_ATTR_ABE_ATTR = "abe_attributes"

  public static VENDOR_ATTR_ABE_POLICY = "abe_policy"

  public static VENDOR_ATTR_ABE_ACCESS_POLICY = "abe_access_policy"

  public static VENDOR_ATTR_COVER_CRYPT_ATTR = "cover_crypt_attributes"

  public static VENDOR_ATTR_COVER_CRYPT_POLICY = "cover_crypt_policy"

  public static VENDOR_ATTR_COVER_CRYPT_ACCESS_POLICY =
    "cover_crypt_access_policy"

  /**
   * Text String (with usage limited to alphanumeric, underscore and period – i.e.
   * [A-Za-z0-9_.])
   */

  @metadata({
    name: "VendorIdentification",
    type: TtlvType.TextString,
  })
  private _vendor_identification: string

  @metadata({
    name: "AttributeName",
    type: TtlvType.TextString,
  })
  private _attribute_name: string

  @metadata({
    name: "AttributeValue",
    type: TtlvType.ByteString,
  })
  private _attribute_value: Uint8Array

  /**
   *
   * @param {string} vendorIdentification the vendor ID
   * @param {string} attributeName the name of the attribute
   * @param {Uint8Array} attributeValue the value of the attribute
   */
  constructor(
    vendorIdentification: string,
    attributeName: string,
    attributeValue: Uint8Array,
  ) {
    this._vendor_identification = vendorIdentification
    this._attribute_name = attributeName
    this._attribute_value = attributeValue
  }

  public get vendor_identification(): string {
    return this._vendor_identification
  }

  public set vendor_identification(value: string) {
    this._vendor_identification = value
  }

  public get attribute_name(): string {
    return this._attribute_name
  }

  public set attribute_name(value: string) {
    this._attribute_name = value
  }

  public get attribute_value(): Uint8Array {
    return this._attribute_value
  }

  public set attribute_value(value: Uint8Array) {
    this._attribute_value = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof VendorAttribute)) {
      return false
    }
    const vendorAttribute = o
    return (
      this.vendor_identification === vendorAttribute.vendor_identification &&
      this.attribute_name === vendorAttribute.attribute_name &&
      this.attribute_value === vendorAttribute.attribute_value
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
