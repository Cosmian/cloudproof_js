import { KeyBlock } from '../data_structures/KeyBlock'
import { KmipObject } from '../objects/KmipObject'
import 'reflect-metadata'
import { PropertyMetadata } from '../decorators/function'
import { TtlvType } from '../serialize/TtlvType'
export class SymmetricKey extends KmipObject {
  @PropertyMetadata({
    name: 'KeyBlock',
    type: TtlvType.Structure
  })
  private _keyBlock: KeyBlock

  constructor (keyBlock: KeyBlock) {
    super()
    this._keyBlock = keyBlock
  }

  public get keyBlock () {
    return this._keyBlock
  }

  public set keyBlock (value) {
    this._keyBlock = value
  }

  public equals (o: any): boolean {
    if (o == this) return true
    if (!(o instanceof SymmetricKey)) {
      return false
    }
    const symmetricKey = o
    return this.keyBlock === symmetricKey.keyBlock
  }

  public toString (): string {
    return '{' + " keyBlock='" + this.keyBlock + "'" + '}'
  }
}
