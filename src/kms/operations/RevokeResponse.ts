import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class RevokeResponse implements KmipStruct {
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier?: string

  constructor(
    uniqueIdentifier?: string,
  ) {
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
    if (!(o instanceof RevokeResponse)) {
      return false
    }
    return this._uniqueIdentifier === o.uniqueIdentifier
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
