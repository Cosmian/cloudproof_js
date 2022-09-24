import { PropertyMetadata } from '../decorators/function'
import { KmipStruct } from '../json/KmipStruct'
import { TtlvType } from '../serialize/TtlvType'

export class TransparentDHPrivateKey implements KmipStruct {
  @PropertyMetadata({
    name: 'Q',
    type: TtlvType.BigInteger
  }) private _p: BigInt

  private _q?: BigInt

  @PropertyMetadata({
    name: 'G',
    type: TtlvType.BigInteger
  })
  private _g: BigInt

  @PropertyMetadata({
    name: 'J',
    type: TtlvType.BigInteger
  })
  private _j?: BigInt

  @PropertyMetadata({
    name: 'X',
    type: TtlvType.BigInteger
  })
  private _x: BigInt

  public get p (): BigInt {
    return this._p
  }

  public set p (value: BigInt) {
    this._p = value
  }

  public get q (): BigInt | undefined {
    return this._q
  }

  public set q (value: BigInt | undefined) {
    this._q = value
  }

  public get g (): BigInt {
    return this._g
  }

  public set g (value: BigInt) {
    this._g = value
  }

  public get j (): BigInt | undefined {
    return this._j
  }

  public set j (value: BigInt | undefined) {
    this._j = value
  }

  public get x (): BigInt {
    return this._x
  }

  public set x (value: BigInt) {
    this._x = value
  }

  constructor (p: BigInt, q: BigInt, g: BigInt, j: BigInt,
    x: BigInt) {
    this._p = p
    this._q = q
    this._g = g
    this._j = j
    this._x = x
  }

  public equals (o: any): boolean {
    if (o == this) { return true }
    if (!(o instanceof TransparentDHPrivateKey)) {
      return false
    }
    const transparentDHPrivateKey = o
    return this.p === transparentDHPrivateKey.p && this.q === transparentDHPrivateKey.q &&
            this.g === transparentDHPrivateKey.g && this.j === transparentDHPrivateKey.j &&
            this.x === transparentDHPrivateKey.x
  }

  public toString (): string {
    return '{' + " p='" + this.p + "'" + ", q='" + this.q + "'" + ", g='" + this.g + "'" + ", j='" + this.j + "'" +
            ", x='" + this.x + "'" + '}'
  }
}
