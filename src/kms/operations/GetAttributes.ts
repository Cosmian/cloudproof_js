import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { AttributeReference } from "../types/AttributeReference"

export class GetAttributes implements KmipStruct {
  /// Determines the object whose attributes
  /// are being requested. If omitted, then
  /// the ID Placeholder value is used by the
  /// server as the Unique Identifier.
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier?: string

  /// Specifies an attribute associated with
  /// the object.
  @metadata({
    name: "AttributesReferences",
    type: TtlvType.Structure,
  })
  private _attributeReferences?: AttributeReference[]

  constructor(
    uniqueIdentifier?: string,
    attributeReferences?: AttributeReference[],
  ) {
    this.unique_identifier = uniqueIdentifier
    this.attribute_references = attributeReferences
  }

  public get unique_identifier(): string | undefined {
    return this._uniqueIdentifier
  }

  public set unique_identifier(value: string | undefined) {
    this._uniqueIdentifier = value
  }

  public get attribute_references(): AttributeReference[] | undefined {
    return this._attributeReferences
  }

  public set attribute_references(value: AttributeReference[] | undefined) {
    this._attributeReferences = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof GetAttributes)) {
      return false
    }
    const getAttributes = o
    return (
      this._uniqueIdentifier === getAttributes.unique_identifier &&
      this._attributeReferences === getAttributes.attribute_references
    )
  }

  public toString(): string {
    return `{ UniqueIdentifier='${
      this._uniqueIdentifier?.toString() as string
    }', AttributeReferences='${
      this._attributeReferences?.toString() as string
    }'}`
  }
}
