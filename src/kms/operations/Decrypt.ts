import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { CryptographicParameters } from "../types/CryptographicParameters"

export class Decrypt implements KmipStruct {
  /// The Unique Identifier of the Managed
  /// Cryptographic Object that is the key to
  /// use for the decryption operation. If
  /// omitted, then the ID Placeholder value
  /// SHALL be used by the server as the
  /// Unique Identifier.
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier?: string

  /// The Cryptographic Parameters (Block
  /// Cipher Mode, Padding Method)
  /// corresponding to the particular
  /// decryption method requested.
  /// If there are no Cryptographic
  /// Parameters associated with the
  /// Managed Cryptographic Object and
  /// the algorithm requires parameters then
  /// the operation SHALL return with a
  /// Result Status of Operation Failed.
  @metadata({
    name: "CryptographicParameters",
    type: TtlvType.Structure,
  })
  private _cryptographicParameters?: CryptographicParameters

  /// The data to be decrypted.
  @metadata({
    name: "Data",
    type: TtlvType.ByteString,
  })
  private _data?: Uint8Array

  /// The initialization vector, counter or
  /// nonce to be used (where appropriate)
  @metadata({
    name: "IvCounterNonce",
    type: TtlvType.ByteString,
  })
  private _ivCounterNonce?: Uint8Array

  /// Initial operation as Boolean
  @metadata({
    name: "InitIndicator",
    type: TtlvType.Boolean,
  })
  private _initIndicator?: boolean

  /// Final operation as Boolean
  @metadata({
    name: "FinalIndicator",
    type: TtlvType.Boolean,
  })
  private _finalIndicator?: boolean

  /// Additional data to be authenticated via
  /// the Authenticated Encryption Tag. If
  /// supplied in multi-part decryption, this
  /// data MUST be supplied on the initial
  /// Decrypt request
  @metadata({
    name: "AuthenticatedEncryptionAdditionalData",
    type: TtlvType.ByteString,
  })
  private _authenticatedEncryptionAdditionalData?: Uint8Array

  /// Specifies the tag that will be needed to
  /// authenticate the decrypted data and
  /// the additional authenticated data. If
  /// supplied in multi-part decryption, this
  /// data MUST be supplied on the initial
  /// Decrypt request
  @metadata({
    name: "AuthenticatedEncryptionTag",
    type: TtlvType.ByteString,
  })
  private _authenticatedEncryptionTag?: Uint8Array

  constructor(
    uniqueIdentifier?: string,
    cryptographicParameters?: CryptographicParameters,
    data?: Uint8Array,
    ivCounterNonce?: Uint8Array,
    initIndicator?: boolean,
    finalIndicator?: boolean,
    authenticatedEncryptionAdditionalData?: Uint8Array,
    authenticatedEncryptionTag?: Uint8Array,
  ) {
    this._uniqueIdentifier = uniqueIdentifier
    this._cryptographicParameters = cryptographicParameters
    this._data = data
    this._ivCounterNonce = ivCounterNonce
    this._initIndicator = initIndicator
    this._finalIndicator = finalIndicator
    this._authenticatedEncryptionAdditionalData =
      authenticatedEncryptionAdditionalData
    this._authenticatedEncryptionTag = authenticatedEncryptionTag
  }

  public get iv_counter_nonce(): Uint8Array | undefined {
    return this._ivCounterNonce
  }

  public set iv_counter_nonce(value: Uint8Array | undefined) {
    this._ivCounterNonce = value
  }

  public get data(): Uint8Array | undefined {
    return this._data
  }

  public set data(value: Uint8Array | undefined) {
    this._data = value
  }

  public get unique_identifier(): string | undefined {
    return this._uniqueIdentifier
  }

  public set unique_identifier(value: string | undefined) {
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

  public get init_indicator(): boolean | undefined {
    return this._initIndicator
  }

  public set init_indicator(value: boolean | undefined) {
    this._initIndicator = value
  }

  public get final_indicator(): boolean | undefined {
    return this._finalIndicator
  }

  public set final_indicator(value: boolean | undefined) {
    this._finalIndicator = value
  }

  public get authenticated_encryption_additional_data():
    | Uint8Array
    | undefined {
    return this._authenticatedEncryptionAdditionalData
  }

  public set authenticated_encryption_additional_data(
    value: Uint8Array | undefined,
  ) {
    this._authenticatedEncryptionAdditionalData = value
  }

  public get authenticated_encryption_tag(): Uint8Array | undefined {
    return this._authenticatedEncryptionTag
  }

  public set authenticated_encryption_tag(value: Uint8Array | undefined) {
    this._authenticatedEncryptionTag = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Decrypt)) {
      return false
    }
    const decrypt = o
    return (
      this._uniqueIdentifier === decrypt.unique_identifier &&
      this._cryptographicParameters === decrypt.cryptographic_parameters &&
      this._data === decrypt.data &&
      this._ivCounterNonce === decrypt.iv_counter_nonce &&
      this._initIndicator === decrypt.init_indicator &&
      this._finalIndicator === decrypt.final_indicator &&
      this._authenticatedEncryptionAdditionalData ===
        decrypt.authenticated_encryption_additional_data &&
      this._authenticatedEncryptionTag === decrypt.authenticated_encryption_tag
    )
  }

  public toString(): string {
    return `{ UniqueIdentifier='${
      this._uniqueIdentifier?.toString() as string
    }', CryptographicParameters='${
      this._cryptographicParameters?.toString() as string
    }', Data='${this._data?.toString() as string}', IvCounterNonce='${
      this._ivCounterNonce?.toString() as string
    }', InitIndicator='${
      this._initIndicator?.toString() as string
    }', FinalIndicator='${
      this._finalIndicator?.toString() as string
    }', AuthenticatedEncryptionAdditional_data='${
      this._authenticatedEncryptionAdditionalData?.toString() as string
    }', AuthenticatedEncryptionTag='${
      this._authenticatedEncryptionTag?.toString() as string
    }'}`
  }
}
