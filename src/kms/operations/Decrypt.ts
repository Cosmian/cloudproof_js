import { PropertyMetadata } from "../decorators/function";
import { KmipStruct } from "../json/KmipStruct";
import { TtlvType } from "../serialize/TtlvType";
import { CryptographicParameters } from "../types/CryptographicParameters";

export class Decrypt implements KmipStruct {
  /// The Unique Identifier of the Managed
  /// Cryptographic Object that is the key to
  /// use for the decryption operation. If
  /// omitted, then the ID Placeholder value
  /// SHALL be used by the server as the
  /// Unique Identifier.
  @PropertyMetadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _unique_identifier?: string;

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
  @PropertyMetadata({
    name: "CryptographicParameters",
    type: TtlvType.Structure,
  })
  private _cryptographic_parameters?: CryptographicParameters;

  /// The data to be decrypted.
  @PropertyMetadata({
    name: "Data",
    type: TtlvType.ByteString,
  })
  private _data?: Uint8Array;

  /// The initialization vector, counter or
  /// nonce to be used (where appropriate)
  @PropertyMetadata({
    name: "IvCounterNonce",
    type: TtlvType.ByteString,
  })
  private _iv_counter_nonce?: Uint8Array;

  /// Initial operation as Boolean
  @PropertyMetadata({
    name: "InitIndicator",
    type: TtlvType.Boolean,
  })
  private _init_indicator?: boolean;

  /// Final operation as Boolean
  @PropertyMetadata({
    name: "FinalIndicator",
    type: TtlvType.Boolean,
  })
  private _final_indicator?: boolean;

  /// Additional data to be authenticated via
  /// the Authenticated Encryption Tag. If
  /// supplied in multi-part decryption, this
  /// data MUST be supplied on the initial
  /// Decrypt request
  @PropertyMetadata({
    name: "AuthenticatedEncryptionAdditionalData",
    type: TtlvType.ByteString,
  })
  private _authenticated_encryption_additional_data?: Uint8Array;

  /// Specifies the tag that will be needed to
  /// authenticate the decrypted data and
  /// the additional authenticated data. If
  /// supplied in multi-part decryption, this
  /// data MUST be supplied on the initial
  /// Decrypt request
  @PropertyMetadata({
    name: "AuthenticatedEncryptionTag",
    type: TtlvType.ByteString,
  })
  private _authenticated_encryption_tag?: Uint8Array;

  constructor(
    unique_identifier?: string,
    cryptographic_parameters?: CryptographicParameters,
    data?: Uint8Array,
    iv_counter_nonce?: Uint8Array,
    init_indicator?: boolean,
    final_indicator?: boolean,
    authenticated_encryption_additional_data?: Uint8Array,
    authenticated_encryption_tag?: Uint8Array
  ) {
    this._unique_identifier = unique_identifier;
    this._cryptographic_parameters = cryptographic_parameters;
    this._data = data;
    this._iv_counter_nonce = iv_counter_nonce;
    this._init_indicator = init_indicator;
    this._final_indicator = final_indicator;
    this._authenticated_encryption_additional_data =
      authenticated_encryption_additional_data;
    this._authenticated_encryption_tag = authenticated_encryption_tag;
  }

  public get iv_counter_nonce(): Uint8Array | undefined {
    return this._iv_counter_nonce;
  }

  public set iv_counter_nonce(value: Uint8Array | undefined) {
    this._iv_counter_nonce = value;
  }

  public get data(): Uint8Array | undefined {
    return this._data;
  }

  public set data(value: Uint8Array | undefined) {
    this._data = value;
  }

  public get unique_identifier(): string | undefined {
    return this._unique_identifier;
  }

  public set unique_identifier(value: string | undefined) {
    this._unique_identifier = value;
  }

  public get cryptographic_parameters(): CryptographicParameters | undefined {
    return this._cryptographic_parameters;
  }

  public set cryptographic_parameters(
    value: CryptographicParameters | undefined
  ) {
    this._cryptographic_parameters = value;
  }

  public get init_indicator(): boolean | undefined {
    return this._init_indicator;
  }

  public set init_indicator(value: boolean | undefined) {
    this._init_indicator = value;
  }

  public get final_indicator(): boolean | undefined {
    return this._final_indicator;
  }

  public set final_indicator(value: boolean | undefined) {
    this._final_indicator = value;
  }

  public get authenticated_encryption_additional_data():
    | Uint8Array
    | undefined {
    return this._authenticated_encryption_additional_data;
  }

  public set authenticated_encryption_additional_data(
    value: Uint8Array | undefined
  ) {
    this._authenticated_encryption_additional_data = value;
  }

  public get authenticated_encryption_tag(): Uint8Array | undefined {
    return this._authenticated_encryption_tag;
  }

  public set authenticated_encryption_tag(value: Uint8Array | undefined) {
    this._authenticated_encryption_tag = value;
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true;
    }
    if (!(o instanceof Decrypt)) {
      return false;
    }
    const decrypt = o;
    return (
      this._unique_identifier === decrypt.unique_identifier &&
      this._cryptographic_parameters === decrypt.cryptographic_parameters &&
      this._data === decrypt.data &&
      this._iv_counter_nonce === decrypt.iv_counter_nonce &&
      this._init_indicator === decrypt.init_indicator &&
      this._final_indicator === decrypt.final_indicator &&
      this._authenticated_encryption_additional_data ===
        decrypt.authenticated_encryption_additional_data &&
      this._authenticated_encryption_tag ===
        decrypt.authenticated_encryption_tag
    );
  }

  public toString(): string {
    return (
      "{" +
      " unique_identifier='" +
      this._unique_identifier +
      "'" +
      ", cryptographic_parameters='" +
      this._cryptographic_parameters +
      "'" +
      ", data='" +
      this._data +
      "'" +
      ", iv_counter_nonce='" +
      this._iv_counter_nonce +
      "'" +
      ", init_indicator='" +
      this._init_indicator +
      "'" +
      ", final_indicator='" +
      this._final_indicator +
      "'" +
      ", authenticated_encryption_additional_data='" +
      this._authenticated_encryption_additional_data +
      "'" +
      ", authenticated_encryption_tag='" +
      this._authenticated_encryption_tag +
      "'" +
      "}"
    );
  }
}
