import { KeyBlock } from "../data_structures/KeyBlock"
import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { SplitKeyMethod } from "../types/SplitKeyMethod"
import { KmipObject } from "./KmipObject"

export class SplitKey extends KmipObject {
    @PropertyMetadata({
        name: "SplitKeyParts",
        type: TtlvType.Integer,
    })
    private _split_key_parts: number

    @PropertyMetadata({
        name: "KeyPartIdentifier",
        type: TtlvType.Integer,
    })
    private _key_part_identifier: number

    @PropertyMetadata({
        name: "SplitKeyThreshold",
        type: TtlvType.Integer,
    })
    private _split_key_threshold: number

    @PropertyMetadata({
        name: "SplitKeyMethod",
        type: TtlvType.Enumeration,
        isEnum: SplitKeyMethod,
    })
    private _split_key_method: SplitKeyMethod

    @PropertyMetadata({
        name: "KeyBlock",
        type: TtlvType.Structure,
    })
    private _keyBlock: KeyBlock

    @PropertyMetadata({
        name: "PrimeFieldSize",
        type: TtlvType.BigInteger,
    })
    // REQUIRED only if Split Key Method is Polynomial Sharing Prime Field.
    private _prime_field_size?: BigInt

    constructor(split_key_parts: number, key_part_identifier: number, split_key_threshold: number,
        split_key_method: SplitKeyMethod, keyBlock: KeyBlock, prime_field_size?: bigint) {
        super()
        this._split_key_parts = split_key_parts
        this._key_part_identifier = key_part_identifier
        this._split_key_threshold = split_key_threshold
        this._split_key_method = split_key_method
        this._prime_field_size = prime_field_size
        this._keyBlock = keyBlock
    }

    public get split_key_parts(): number {
        return this._split_key_parts
    }
    public set split_key_parts(value: number) {
        this._split_key_parts = value
    }
    public get key_part_identifier(): number {
        return this._key_part_identifier
    }
    public set key_part_identifier(value: number) {
        this._key_part_identifier = value
    }
    public get split_key_threshold(): number {
        return this._split_key_threshold
    }
    public set split_key_threshold(value: number) {
        this._split_key_threshold = value
    }
    public get split_key_method(): SplitKeyMethod {
        return this._split_key_method
    }
    public set split_key_method(value: SplitKeyMethod) {
        this._split_key_method = value
    }
    public get prime_field_size(): BigInt | undefined {
        return this._prime_field_size
    }
    public set prime_field_size(value: BigInt | undefined) {
        this._prime_field_size = value
    }
    public get keyBlock(): KeyBlock {
        return this._keyBlock
    }
    public set keyBlock(value: KeyBlock) {
        this._keyBlock = value
    }

    public equals(o: any): boolean {
        if (o === this)
            return true
        if (!(o instanceof SplitKey)) {
            return false
        }
        const splitKey = o as SplitKey
        return this._split_key_parts === splitKey.split_key_parts && this._key_part_identifier === splitKey.key_part_identifier
            && this._split_key_threshold == splitKey.split_key_threshold && this._split_key_method == splitKey.split_key_method
            && this._prime_field_size == splitKey.prime_field_size && this._keyBlock == splitKey.keyBlock
    }

    public toString(): string {
        return "{" + " split_key_parts='" + this._split_key_parts + "'" + ", key_part_identifier='"
            + this._key_part_identifier + "'" + ", split_key_threshold='" + this._split_key_threshold + "'"
            + ", split_key_method='" + this._split_key_method + "'" + ", prime_field_size='" + this._prime_field_size
            + "'" + ", keyBlock='" + this._keyBlock + "'" + "}"
    }

}
