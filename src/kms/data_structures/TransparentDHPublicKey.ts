import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class TransparentDHPublicKey implements KmipStruct {
  tag = "TransparentDHPublicKey"

  @metadata({
    name: "P",
    type: TtlvType.BigInteger,
  })
  private _p: BigInt

  @metadata({
    name: "Q",
    type: TtlvType.BigInteger,
  })
  private _q?: BigInt

  @metadata({
    name: "G",
    type: TtlvType.BigInteger,
  })
  private _g: BigInt

  @metadata({
    name: "J",
    type: TtlvType.BigInteger,
  })
  private _j?: BigInt

  @metadata({
    name: "Y",
    type: TtlvType.BigInteger,
  })
  private _y: BigInt

  public get p(): BigInt {
    return this._p
  }

  public set p(value: BigInt) {
    this._p = value
  }

  public get q(): BigInt | undefined {
    return this._q
  }

  public set q(value: BigInt | undefined) {
    this._q = value
  }

  public get g(): BigInt {
    return this._g
  }

  public set g(value: BigInt) {
    this._g = value
  }

  public get j(): BigInt | undefined {
    return this._j
  }

  public set j(value: BigInt | undefined) {
    this._j = value
  }

  public get y(): BigInt {
    return this._y
  }

  public set y(value: BigInt) {
    this._y = value
  }

  constructor(p: BigInt, g: BigInt, y: BigInt, q?: BigInt, j?: BigInt) {
    this._p = p
    this._q = q
    this._g = g
    this._j = j
    this._y = y
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof TransparentDHPublicKey)) {
      return false
    }
    const transparentDHPublicKey = o
    return (
      this.p === transparentDHPublicKey.p &&
      this.q === transparentDHPublicKey.q &&
      this.g === transparentDHPublicKey.g &&
      this.j === transparentDHPublicKey.j &&
      this.y === transparentDHPublicKey.y
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
