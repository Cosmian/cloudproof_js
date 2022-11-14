import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { ObjectType } from "../types/ObjectType"

export class CreateResponse implements KmipStruct {
  tag = "CreateResponse";

  @metadata({
    name: "ObjectType",
    type: TtlvType.Enumeration,
    classOrEnum: ObjectType,
  }) /// Type of object created.
  private _objectType: ObjectType

  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  /// The Unique Identifier of the object created
  private _uniqueIdentifier: string

  constructor(objectType: ObjectType, uniqueIdentifier: string) {
    this._objectType = objectType
    this._uniqueIdentifier = uniqueIdentifier
  }

  public get objectType(): ObjectType {
    return this._objectType
  }

  public set objectType(value: ObjectType) {
    this._objectType = value
  }

  public get uniqueIdentifier(): string {
    return this._uniqueIdentifier
  }

  public set uniqueIdentifier(value: string) {
    this._uniqueIdentifier = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof CreateResponse)) {
      return false
    }
    const createResponse = o
    return (
      this._objectType === createResponse.objectType &&
      this._uniqueIdentifier === createResponse.uniqueIdentifier
    )
  }

  public toString(): string {
    return `{ ObjectType='${this._objectType}', UniqueIdentifier='${this._uniqueIdentifier}'}`
  }
}
