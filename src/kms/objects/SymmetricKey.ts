import { KeyBlock } from "../data_structures/KeyBlock"
import "reflect-metadata"
import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { TransparentSymmetricKey } from "kms/data_structures/TransparentSymmetricKey"
export class SymmetricKey {
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

  public set keyBlock(value) {
    this._keyBlock = value
  }

  public equals(o: any): boolean {
    if (o === this) return true
    if (!(o instanceof SymmetricKey)) {
      return false
    }
    const symmetricKey = o
    return this.keyBlock === symmetricKey.keyBlock
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }

  /**
   * Extract the symmetric key bytes
   * 
   * @returns {Uint8Array} the key bytes
   */
  public bytes(): Uint8Array {
    const kv = this.keyBlock.key_value
    if (typeof kv.bytes !== "undefined") {
      return kv.bytes
    }
    const ptKv = kv.plaintext
    if (typeof ptKv === "undefined") {
      throw new Error(`no key bytes found on the symmetric key`)
    }
    if (ptKv.keyMaterial instanceof Uint8Array) {
      return ptKv.keyMaterial
    }
    if (ptKv.keyMaterial instanceof TransparentSymmetricKey) {
      return ptKv.keyMaterial.key
    }
    throw new Error(`no key bytes found: invalid symmetric key`)
  }
}
