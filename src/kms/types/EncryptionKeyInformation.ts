import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { CryptographicParameters } from "./CryptographicParameters"

export class EncryptionKeyInformation implements KmipStruct {
  tag = "EncryptionKeyInformation"

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
    cryptographicParameters?: CryptographicParameters,
  ) {
    this._uniqueIdentifier = uniqueIdentifier
    this._cryptographicParameters = cryptographicParameters
  }

  public get unique_identifier(): string {
    return this._uniqueIdentifier
  }

  public set unique_identifier(value: string) {
    this._uniqueIdentifier = value
  }

  public get cryptographic_parameters(): CryptographicParameters | undefined {
    return this._cryptographicParameters
  }

  public set cryptographic_parameters(
    value: CryptographicParameters | undefined,
  ) {
    this._cryptographicParameters = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof EncryptionKeyInformation)) {
      return false
    }
    const encryptionKeyInformation = o
    return (
      this.unique_identifier === encryptionKeyInformation.unique_identifier &&
      this.cryptographic_parameters ===
        encryptionKeyInformation.cryptographic_parameters
    )
  }

  public toString(): string {
    return `{ UniqueIdentifier='${
      this.unique_identifier
    }', CryptographicParameters='${
      this.cryptographic_parameters?.toString() as string
    }'}`
  }
}
