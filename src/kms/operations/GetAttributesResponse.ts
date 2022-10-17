import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"

export class GetAttributesResponse implements KmipStruct {
  // The Unique Identifier of the object
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string

  // Attributes
  @metadata({
    name: "Attributes",
    type: TtlvType.Structure,
  })
  private _attributes: Attributes

  constructor(uniqueIdentifier: string, attributes: Attributes) {
    this._uniqueIdentifier = uniqueIdentifier
    this._attributes = attributes
  }

  public get uniqueIdentifier(): string {
    return this._uniqueIdentifier
  }

  public set uniqueIdentifier(value: string) {
    this._uniqueIdentifier = value
  }

  public get attributes(): Attributes {
    return this._attributes
  }

  public set attributes(value: Attributes) {
    this._attributes = value
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true
    }
    if (!(o instanceof GetAttributesResponse)) {
      return false
    }
    const getAttributesResponse = o
    return (
      this._uniqueIdentifier === getAttributesResponse.uniqueIdentifier &&
      this._attributes === getAttributesResponse.attributes
    )
  }

  public toString(): string {
    return (
      "{" +
      " uniqueIdentifier='" +
      this._uniqueIdentifier +
      "'" +
      ", attributes='" +
      this._attributes +
      "'" +
      "}"
    )
  }
}
