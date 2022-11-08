import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { CryptographicParameters } from "./CryptographicParameters"

export class MacSignatureKeyInformation implements KmipStruct {
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string

  @metadata({
    name: "CryptographicParameters",
    type: TtlvType.Structure,
  })
  private _cryptographicParameters?: CryptographicParameters

  constructor(
    uniqueIdentifier: string,
    cryptographicParameters?: CryptographicParameters
  ) {
    this._uniqueIdentifier = uniqueIdentifier
    this._cryptographicParameters = cryptographicParameters
  }

  public get uniqueIdentifier(): string {
    return this._uniqueIdentifier
  }

  public set uniqueIdentifier(value: string) {
    this._uniqueIdentifier = value
  }

  public get cryptographicParameters(): CryptographicParameters | undefined {
    return this._cryptographicParameters
  }

  public set cryptographicParameters(
    value: CryptographicParameters | undefined
  ) {
    this._cryptographicParameters = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof MacSignatureKeyInformation)) {
      return false
    }
    const macSignatureKeyInformation = o
    return (
      this.uniqueIdentifier === macSignatureKeyInformation.uniqueIdentifier &&
      this.cryptographicParameters ===
        macSignatureKeyInformation.cryptographicParameters
    )
  }

  public toString(): string {
    return `{ UniqueIdentifier='${
      this.uniqueIdentifier
    }', CryptographicParameters='${
      this.cryptographicParameters?.toString() as string
    }'}`
  }
}
