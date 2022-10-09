import { KmipStruct } from "kms/json/KmipStruct"
import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm"
import { KeyCompressionType } from "kms/types/KeyCompressionType"
import { KeyFormatType } from "kms/types/KeyFormatType"
import { KeyValue } from "kms/data_structures/KeyValue"
import { KeyWrappingData } from "./KeyWrappingData"
import { metadata } from "kms/decorators/function"
import { TtlvType } from "kms/serialize/TtlvType"

export class KeyBlock implements KmipStruct {
  @metadata({
    name: "KeyFormatType",
    type: TtlvType.Enumeration,
    classOrEnum: KeyFormatType,
  })
  private _key_format_type: KeyFormatType

  @metadata({
    name: "KeyValue",
    type: TtlvType.Structure,
  })
  private _key_value: KeyValue

  @metadata({
    name: "CryptographicAlgorithm",
    type: TtlvType.Enumeration,
    classOrEnum: CryptographicAlgorithm,
  })
  private _cryptographic_algorithm: CryptographicAlgorithm

  @metadata({
    name: "CryptographicLength",
    type: TtlvType.Integer,
  })
  private _cryptographic_length: number

  @metadata({
    name: "KeyWrappingData",
    type: TtlvType.Structure,
  })
  private _key_wrapping_data?: KeyWrappingData

  @metadata({
    name: "KeyCompressionType",
    type: TtlvType.Enumeration,
    classOrEnum: KeyCompressionType,
  })
  private _key_compression_type?: KeyCompressionType

  constructor(
    keyFormatType: KeyFormatType,
    keyValue: KeyValue,
    cryptographicAlgorithm: CryptographicAlgorithm,
    cryptographicLength: number,
    keyCompressionType?: KeyCompressionType,
    keyWrappingData?: KeyWrappingData
  ) {
    this._key_format_type = keyFormatType
    this._key_compression_type = keyCompressionType
    this._key_value = keyValue
    this._cryptographic_algorithm = cryptographicAlgorithm
    this._cryptographic_length = cryptographicLength
    this._key_wrapping_data = keyWrappingData
  }

  public get key_format_type(): KeyFormatType {
    return this._key_format_type
  }

  public set key_format_type(value: KeyFormatType) {
    this._key_format_type = value
  }

  public get key_compression_type(): KeyCompressionType | undefined {
    return this._key_compression_type
  }

  public set key_compression_type(value: KeyCompressionType | undefined) {
    this._key_compression_type = value
  }

  public get key_value(): KeyValue {
    return this._key_value
  }

  public set key_value(value: KeyValue) {
    this._key_value = value
  }

  public get cryptographic_algorithm(): CryptographicAlgorithm {
    return this._cryptographic_algorithm
  }

  public set cryptographic_algorithm(value: CryptographicAlgorithm) {
    this._cryptographic_algorithm = value
  }

  public get cryptographic_length(): number {
    return this._cryptographic_length
  }

  public set cryptographic_length(value: number) {
    this._cryptographic_length = value
  }

  public get key_wrapping_data(): KeyWrappingData | undefined {
    return this._key_wrapping_data
  }

  public set key_wrapping_data(value: KeyWrappingData | undefined) {
    this._key_wrapping_data = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof KeyBlock)) {
      return false
    }
    const keyBlock = o
    return (
      this.key_format_type === keyBlock.key_format_type &&
      this.key_compression_type === keyBlock.key_compression_type &&
      this.key_value === keyBlock.key_value &&
      this.cryptographic_algorithm === keyBlock.cryptographic_algorithm &&
      this.cryptographic_length === keyBlock.cryptographic_length &&
      this.key_wrapping_data === keyBlock.key_wrapping_data
    )
  }

  public toString(): string {
    return (
      `{ key_format_type=${this.key_format_type}, key_compression_type=${this.key_compression_type ?? "N/A"}, key_value=${this.key_value}, cryptographic_algorithm=${this.cryptographic_algorithm}, cryptographic_length=${this.cryptographic_length}, key_wrapping_data=${this.key_wrapping_data}}`
    )

  }
}
