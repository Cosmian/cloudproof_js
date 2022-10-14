import { CryptographicAlgorithm } from "kms/types/CryptographicAlgorithm"
import { KeyCompressionType } from "kms/types/KeyCompressionType"
import { KeyFormatType } from "kms/types/KeyFormatType"
import { KeyValue } from "kms/data_structures/KeyValue"
import { KeyWrappingData } from "./KeyWrappingData"
import { metadata } from "kms/decorators/function"
import { TtlvType } from "kms/serialize/TtlvType"
import { TTLV } from "kms/serialize/Ttlv"
import { defaultStructureParser } from "kms/deserialize/deserializer"
import { hexDecode } from "utils/utils"
import { PlainTextKeyValue } from "./PlainTextKeyValue"

export class KeyBlock {
  @metadata({
    name: "KeyFormatType",
    type: TtlvType.Enumeration,
    classOrEnum: KeyFormatType,
  })
  private _key_format_type: KeyFormatType

  @metadata({
    name: "KeyValue",
    type: TtlvType.Choice,
    classOrEnum: KeyValue,
    fromTtlv(propertyName: string, ttlv: TTLV, parentInstance: Object): KeyValue {
      if (ttlv.type === TtlvType.ByteString) {
        return new KeyValue(hexDecode(ttlv.value as string))
      }
      if (ttlv.type === TtlvType.Structure) {
        const kb: KeyBlock = parentInstance as KeyBlock
        const plainTextKeyValue = new PlainTextKeyValue(kb._key_format_type)
        return new KeyValue(undefined, defaultStructureParser(plainTextKeyValue, ttlv, "_key_value"))
      }
      throw new Error(
        `Deserializer: KeyValue has invalid type ${ttlv.type} ` +
        ` in structure: KeyBlock` +
        ` in ${propertyName}`
      )
    },
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
    keyFormatType?: KeyFormatType,
    keyValue?: KeyValue,
    cryptographicAlgorithm?: CryptographicAlgorithm,
    cryptographicLength?: number,
    keyCompressionType?: KeyCompressionType,
    keyWrappingData?: KeyWrappingData
  ) {
    this._key_format_type = keyFormatType ?? KeyFormatType.TransparentSymmetricKey
    this._key_compression_type = keyCompressionType
    this._key_value = keyValue ?? new KeyValue()
    this._cryptographic_algorithm = cryptographicAlgorithm ?? CryptographicAlgorithm.AES
    this._cryptographic_length = cryptographicLength ?? 256
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
    return JSON.stringify(this, null, 4)
  }

}
