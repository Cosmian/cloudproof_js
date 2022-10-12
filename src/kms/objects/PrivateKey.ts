import { KeyBlock } from "../data_structures/KeyBlock"
import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class PrivateKey {
  @metadata({
    name: "KeyBlock",
    type: TtlvType.Structure,
    classOrEnum: KeyBlock
  })
  private _keyBlock: KeyBlock

  constructor(keyBlock?: KeyBlock) {
    this._keyBlock = keyBlock ?? new KeyBlock()
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
    if (!(o instanceof PrivateKey)) {
      return false
    }
    const privateKey = o
    return this._keyBlock === privateKey.keyBlock
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
