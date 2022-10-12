import { KeyBlock } from "../data_structures/KeyBlock"
import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { SecretDataType } from "../types/SecretDataType"

export class SecretData {
  @metadata({
    name: "SecretDataType",
    type: TtlvType.Enumeration,
    classOrEnum: SecretDataType,
  })
  private _secretDataType: SecretDataType

  @metadata({
    name: "KeyBlock",
    type: TtlvType.Structure,
    classOrEnum: KeyBlock
  })
  private _keyBlock: KeyBlock

  constructor(secretDataType?: SecretDataType, keyBlock?: KeyBlock) {
    this._secretDataType = secretDataType ?? SecretDataType.Password
    this._keyBlock = keyBlock ?? new KeyBlock()
  }

  public get secretDataType(): SecretDataType {
    return this._secretDataType
  }

  public set secretDataType(value: SecretDataType) {
    this._secretDataType = value
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
    if (!(o instanceof SecretData)) {
      return false
    }
    const secretData = o
    return (
      this._secretDataType === secretData.secretDataType &&
      this._keyBlock === secretData.keyBlock
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
