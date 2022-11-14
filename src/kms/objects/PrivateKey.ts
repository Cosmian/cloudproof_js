import { hexDecode } from "../../utils/utils"
import { KeyBlock } from "../data_structures/KeyBlock"
import { TransparentECPrivateKey } from "../data_structures/TransparentECPrivateKey"
import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class PrivateKey {
  @metadata({
    name: "KeyBlock",
    type: TtlvType.Structure,
    classOrEnum: KeyBlock,
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

  /**
   * Extract the key bytes
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
      throw new Error("no key bytes found on the private key")
    }
    if (ptKv.keyMaterial instanceof Uint8Array) {
      return ptKv.keyMaterial
    }
    if (ptKv.keyMaterial instanceof TransparentECPrivateKey) {
      return hexDecode(ptKv.keyMaterial.d.toString(16))
    }
    throw new Error("no key bytes found: invalid private key")
  }
}
