import { KmipStruct } from "../json/KmipStruct"
import { CryptographicAlgorithm } from "../types/CryptographicAlgorithm"
import { KeyCompressionType } from "../types/KeyCompressionType"
import { KeyFormatType } from "../types/KeyFormatType"
import { KeyValue } from "../data_structures/KeyValue"
import { KeyWrappingData } from "./KeyWrappingData"
import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class KeyBlock implements KmipStruct {

    @PropertyMetadata({
        name: "KeyFormatType",
        type: TtlvType.Enumeration,
        isEnum: KeyFormatType
    })
    private _key_format_type: KeyFormatType

    @PropertyMetadata({
        name: "KeyValue",
        type: TtlvType.Structure,
    })
    private _key_value: KeyValue

    @PropertyMetadata({
        name: "CryptographicAlgorithm",
        type: TtlvType.Enumeration,
        isEnum: CryptographicAlgorithm
    })
    private _cryptographic_algorithm: CryptographicAlgorithm

    @PropertyMetadata({
        name: "CryptographicLength",
        type: TtlvType.Integer,
    })
    private _cryptographic_length: number

    @PropertyMetadata({
        name: "KeyWrappingData",
        type: TtlvType.Structure,
    })
    private _key_wrapping_data?: KeyWrappingData

    @PropertyMetadata({
        name: "KeyCompressionType",
        type: TtlvType.Enumeration,
        isEnum: KeyCompressionType
    })
    private _key_compression_type?: KeyCompressionType

    constructor(key_format_type: KeyFormatType,
        key_value: KeyValue, cryptographic_algorithm: CryptographicAlgorithm, cryptographic_length: number, key_compression_type?: KeyCompressionType,
        key_wrapping_data?: KeyWrappingData) {
        this._key_format_type = key_format_type
        this._key_compression_type = key_compression_type
        this._key_value = key_value
        this._cryptographic_algorithm = cryptographic_algorithm
        this._cryptographic_length = cryptographic_length
        this._key_wrapping_data = key_wrapping_data
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
        if (o == this)
            return true
        if (!(o instanceof KeyBlock)) {
            return false
        }
        let keyBlock = o as KeyBlock
        return this.key_format_type === keyBlock.key_format_type
            && this.key_compression_type === keyBlock.key_compression_type
            && this.key_value == keyBlock.key_value
            && this.cryptographic_algorithm == keyBlock.cryptographic_algorithm
            && this.cryptographic_length === keyBlock.cryptographic_length
            && this.key_wrapping_data === keyBlock.key_wrapping_data
    }

    public toString(): string {
        return "{" + " key_format_type='" + this.key_format_type + "'" + ", key_compression_type='"
            + this.key_compression_type + "'" + ", key_value='" + this.key_value + "'"
            + ", cryptographic_algorithm='" + this.cryptographic_algorithm + "'" + ", cryptographic_length='"
            + this.cryptographic_length + "'" + ", key_wrapping_data='" + this.key_wrapping_data + "'" + "}"
    }

}
