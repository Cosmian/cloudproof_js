import { PropertyMetadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { AttributeReference } from "../types/AttributeReference"

export class GetAttributes implements KmipStruct {

    /// Determines the object whose attributes
    /// are being requested. If omitted, then
    /// the ID Placeholder value is used by the
    /// server as the Unique Identifier.
    @PropertyMetadata({
        name: "UniqueIdentifier",
        type: TtlvType.TextString,
    })
    private _unique_identifier?: string

    /// Specifies an attribute associated with
    /// the object.
    @PropertyMetadata({
        name: "AttributesReferences",
        type: TtlvType.Structure,
    })
    private _attribute_references?: AttributeReference[]

    constructor(unique_identifier?: string, attribute_references?: AttributeReference[]) {
        this.unique_identifier = unique_identifier
        this.attribute_references = attribute_references
    }

    public get unique_identifier(): string | undefined {
        return this._unique_identifier
    }
    public set unique_identifier(value: string | undefined) {
        this._unique_identifier = value
    }
    public get attribute_references(): AttributeReference[] | undefined {
        return this._attribute_references
    }
    public set attribute_references(value: AttributeReference[] | undefined) {
        this._attribute_references = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof GetAttributes)) {
            return false
        }
        const getAttributes = o as GetAttributes
        return this._unique_identifier === getAttributes.unique_identifier
            && this._attribute_references === getAttributes.attribute_references
    }

    public toString(): string {
        return "{" + " unique_identifier='" + this._unique_identifier + "'" + ", attribute_references='"
            + this._attribute_references + "'" + "}"
    }

}
