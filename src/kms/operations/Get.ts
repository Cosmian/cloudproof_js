import { KeyWrappingData } from "../data_structures/KeyWrappingData";
import { PropertyMetadata } from "../decorators/function";
import { KmipStruct } from "../json/KmipStruct";
import { TtlvType } from "../serialize/TtlvType";
import { KeyCompressionType } from "../types/KeyCompressionType";
import { KeyFormatType } from "../types/KeyFormatType";
import { KeyWrapType } from "../types/KeyWrapType";

export class Get implements KmipStruct {
  /// Determines the object being requested. If omitted, then the ID
  /// Placeholder value is used by the server as the Unique Identifier.
  @PropertyMetadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _unique_identifier?: string;

  /// Determines the key format type to be returned.
  @PropertyMetadata({
    name: "KeyFormatType",
    type: TtlvType.Enumeration,
    isEnum: KeyFormatType,
  })
  private _key_format_type?: KeyFormatType;

  /// Determines the Key Wrap Type of the returned key value.
  @PropertyMetadata({
    name: "KeyWrapType",
    type: TtlvType.Enumeration,
    isEnum: KeyWrapType,
  })
  private _key_wrap_type?: KeyWrapType;

  /// Determines the compression method for elliptic curve public keys.
  @PropertyMetadata({
    name: "KeyCompressionType",
    type: TtlvType.Enumeration,
    isEnum: KeyCompressionType,
  })
  private _key_compression_type?: KeyCompressionType;

  /// Specifies keys and other information for wrapping the returned object.
  @PropertyMetadata({
    name: "KeyWrappingData",
    type: TtlvType.Structure,
  })
  private _key_wrapping_data?: KeyWrappingData;

  constructor(
    unique_identifier?: string,
    key_format_type?: KeyFormatType,
    key_wrap_type?: KeyWrapType,
    key_compression_type?: KeyCompressionType,
    key_wrapping_data?: KeyWrappingData
  ) {
    this._unique_identifier = unique_identifier;
    this._key_format_type = key_format_type;
    this._key_wrap_type = key_wrap_type;
    this._key_compression_type = key_compression_type;
    this._key_wrapping_data = key_wrapping_data;
  }

  public get unique_identifier(): string | undefined {
    return this._unique_identifier;
  }

  public set unique_identifier(value: string | undefined) {
    this._unique_identifier = value;
  }

  public get key_format_type(): KeyFormatType | undefined {
    return this._key_format_type;
  }

  public set key_format_type(value: KeyFormatType | undefined) {
    this._key_format_type = value;
  }

  public get key_wrap_type(): KeyWrapType | undefined {
    return this._key_wrap_type;
  }

  public set key_wrap_type(value: KeyWrapType | undefined) {
    this._key_wrap_type = value;
  }

  public get key_compression_type(): KeyCompressionType | undefined {
    return this._key_compression_type;
  }

  public set key_compression_type(value: KeyCompressionType | undefined) {
    this._key_compression_type = value;
  }

  public get key_wrapping_data(): KeyWrappingData | undefined {
    return this._key_wrapping_data;
  }

  public set key_wrapping_data(value: KeyWrappingData | undefined) {
    this._key_wrapping_data = value;
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true;
    }
    if (!(o instanceof Get)) {
      return false;
    }
    const get = o;
    return (
      this._unique_identifier === get.unique_identifier &&
      this._key_format_type === get.key_format_type &&
      this._key_wrap_type === get.key_wrap_type &&
      this._key_compression_type === get.key_compression_type &&
      this._key_wrapping_data === get.key_wrapping_data
    );
  }

  public toString(): string {
    return (
      "{" +
      " unique_identifier='" +
      this._unique_identifier +
      "'" +
      ", key_format_type='" +
      this._key_format_type +
      "'" +
      ", key_wrap_type='" +
      this._key_wrap_type +
      "'" +
      ", key_compression_type='" +
      this._key_compression_type +
      "'" +
      ", key_wrapping_data='" +
      this._key_wrapping_data +
      "'" +
      "}"
    );
  }
}
