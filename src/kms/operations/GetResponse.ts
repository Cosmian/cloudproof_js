import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { KmipObject } from "../objects/KmipObject"
import { TtlvType } from "../serialize/TtlvType"
import { ObjectType } from "../types/ObjectType"

export class GetResponse implements KmipStruct {
  // Determines the type of object being retrieved.
  @metadata({
    name: "ObjectType",
    type: TtlvType.Enumeration,
    classOrEnum: ObjectType,
  })
  private _objectType: ObjectType

  // The Unique Identifier of the object to be retrieved
  @metadata({
    name: "Uniqueidentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string

  // The object being retrieved.
  @metadata({
    name: "AuthenticatedEncryptionAdditionalData",
    type: TtlvType.ByteString,
  })
  private _object: KmipObject

  constructor(
    objectType: ObjectType,
    uniqueIdentifier: string,
    object: KmipObject
  ) {
    this._objectType = objectType
    this._uniqueIdentifier = uniqueIdentifier
    this._object = object
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

  public get object(): KmipObject {
    return this._object
  }

  public set object(value: KmipObject) {
    this._object = value
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true
    }
    if (!(o instanceof GetResponse)) {
      return false
    }
    const getResponse = o
    return (
      this._objectType === getResponse.objectType &&
      this._uniqueIdentifier === getResponse.uniqueIdentifier &&
      this._object === getResponse.object
    )
  }

  public toString(): string {
    return (
      "{" +
      " objectType='" +
      this._objectType +
      "'" +
      ", uniqueIdentifier='" +
      this._uniqueIdentifier +
      "'" +
      ", object='" +
      this._object +
      "'" +
      "}"
    )
  }
}
