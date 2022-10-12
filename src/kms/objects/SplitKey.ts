import { KeyBlock } from "../data_structures/KeyBlock"
import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { SplitKeyMethod } from "../types/SplitKeyMethod"

export class SplitKey {
  @metadata({
    name: "SplitKeyParts",
    type: TtlvType.Integer,
  })
  private _split_key_parts: number

  @metadata({
    name: "KeyPartIdentifier",
    type: TtlvType.Integer,
  })
  private _key_part_identifier: number

  @metadata({
    name: "SplitKeyThreshold",
    type: TtlvType.Integer,
  })
  private _split_key_threshold: number

  @metadata({
    name: "SplitKeyMethod",
    type: TtlvType.Enumeration,
    classOrEnum: SplitKeyMethod,
  })
  private _split_key_method: SplitKeyMethod

  @metadata({
    name: "KeyBlock",
    type: TtlvType.Structure,
    classOrEnum: KeyBlock
  })
  private _keyBlock: KeyBlock

  @metadata({
    name: "PrimeFieldSize",
    type: TtlvType.BigInteger,
  })
  // REQUIRED only if Split Key Method is Polynomial Sharing Prime Field.
  private _prime_field_size?: BigInt

  constructor(
    splitKeyParts?: number,
    keyPartIdentifier?: number,
    splitKeyThreshold?: number,
    splitKeyMethod?: SplitKeyMethod,
    keyBlock?: KeyBlock,
    primeFieldSize?: bigint
  ) {
    this._split_key_parts = splitKeyParts ?? 0
    this._key_part_identifier = keyPartIdentifier ?? 0
    this._split_key_threshold = splitKeyThreshold ?? 0
    this._split_key_method = splitKeyMethod ?? SplitKeyMethod.XOR
    this._prime_field_size = primeFieldSize
    this._keyBlock = keyBlock ?? new KeyBlock()
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
    if (o === this) {
      return true
    }
    if (!(o instanceof SplitKey)) {
      return false
    }
    const splitKey = o
    return (
      this._split_key_parts === splitKey.split_key_parts &&
      this._key_part_identifier === splitKey.key_part_identifier &&
      this._split_key_threshold === splitKey.split_key_threshold &&
      this._split_key_method === splitKey.split_key_method &&
      this._prime_field_size === splitKey.prime_field_size &&
      this._keyBlock === splitKey.keyBlock
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
