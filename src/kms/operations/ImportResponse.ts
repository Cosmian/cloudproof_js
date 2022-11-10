import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class ImportResponse implements KmipStruct {
  // The Unique Identifier of the object to be imported
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string

  constructor(uniqueIdentifier: string) {
    this._uniqueIdentifier = uniqueIdentifier
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
    if (!(o instanceof ImportResponse)) {
      return false
    }
    const importResponse = o
    return this._uniqueIdentifier === importResponse.uniqueIdentifier
  }

  public toString(): string {
    return "{" + " UniqueIdentifier='" + this._uniqueIdentifier + "'" + "}"
  }
}
