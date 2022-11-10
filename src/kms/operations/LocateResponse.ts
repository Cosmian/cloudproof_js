import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class LocateResponse implements KmipStruct {
  /// An Integer object that indicates the number of object identifiers that
  /// satisfy the identification criteria specified in the request. A server
  /// MAY elect to omit this value from the Response if it is unable or
  /// unwilling to determine the total count of matched items.
  // A server MAY elect to return the Located Items value even if Offset Items is
  /// not present in
  // the Request.
  @metadata({
    name: "LocatedItems",
    type: TtlvType.Integer,
  })
  private _locatedItems?: number

  /// The Unique Identifier of the located objects.
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string[]

  constructor(uniqueIdentifier: string[], locatedItems?: number) {
    this._locatedItems = locatedItems
    this._uniqueIdentifier = uniqueIdentifier
  }

  public get located_items(): number | undefined {
    return this._locatedItems
  }

  public set located_items(value: number | undefined) {
    this._locatedItems = value
  }

  public get unique_identifier(): string[] {
    return this._uniqueIdentifier
  }

  public set unique_identifier(value: string[]) {
    this._uniqueIdentifier = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof LocateResponse)) {
      return false
    }
    const locateResponse = o
    return (
      this._locatedItems === locateResponse.located_items &&
      this._uniqueIdentifier === locateResponse.unique_identifier
    )
  }

  public toString(): string {
    return `{ LocatedItems='${
      this._locatedItems?.toString() as string
    }', UniqueIdentifier='${this._uniqueIdentifier.toString()}'}`
  }
}
