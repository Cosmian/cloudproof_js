import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class Destroy implements KmipStruct {
  tag = "Destroy";
  
  /// Determines the object being destroyed. If omitted, then the ID
  /// Placeholder value is used by the server as the Unique Identifier.
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier?: string

  constructor(uniqueIdentifier?: string) {
    this._uniqueIdentifier = uniqueIdentifier
  }

  public get uniqueIdentifier(): string | undefined {
    return this._uniqueIdentifier
  }

  public set uniqueIdentifier(value: string | undefined) {
    this._uniqueIdentifier = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Destroy)) {
      return false
    }
    return this._uniqueIdentifier === o.uniqueIdentifier
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
