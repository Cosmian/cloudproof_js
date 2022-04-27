import { PropertyMetadata } from "../decorators/function"
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

    /**
     * Text String (with usage limited to alphanumeric, underscore and period – i.e.
     * [A-Za-z0-9_.])
     */

    @PropertyMetadata({
        name: "VendorIdentification",
        type: TtlvType.TextString,
    })
    private _vendor_identification: string

    @PropertyMetadata({
        name: "AttributeName",
        type: TtlvType.TextString,
    })
    private _attribute_name: string

    @PropertyMetadata({
        name: "AttributeValue",
        type: TtlvType.ByteString,
    })
    private _attribute_value: Uint8Array

    /**
     *
     */
    constructor(vendor_identification: string, attribute_name: string, attribute_value: Uint8Array) {
        this._vendor_identification = vendor_identification
        this._attribute_name = attribute_name
        this._attribute_value = attribute_value
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
        if (o == this)
            return true
        if (!(o instanceof VendorAttribute)) {
            return false
        }
        let vendorAttribute = o as VendorAttribute
        return this.vendor_identification === vendorAttribute.vendor_identification
            && this.attribute_name === vendorAttribute.attribute_name
            && this.attribute_value === vendorAttribute.attribute_value
    }

    public toString(): string {
        return "{" + " vendor_identification='" + this.vendor_identification + "'" + ", attribute_name='"
            + this.attribute_name + "'" + ", attribute_value='" + this.attribute_value + "'" + "}"
    }

}
