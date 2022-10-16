import { DateTimeExtended } from "./DateTimeExtended"
import { Interval } from "./Interval"
// import { LongInt } from "./LongInt";
import { TtlvType } from "./TtlvType"

export type LongInt = BigInt

export type TtlvValue =
  | TTLV[]
  | Date
  | Uint8Array
  | LongInt
  | Interval
  | DateTimeExtended
  | number
  | BigInt
  | boolean
  | string


// Allows JSON.toString on BigInt
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// eslint-disable-next-line no-extend-native
(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export class TTLV {
  public tag: string
  public type: TtlvType
  public value: TtlvValue

  constructor(tag: string, type: TtlvType, value: TtlvValue) {
    this.tag = tag
    this.type = type
    this.value = value
  }

  public toJSON(): Object {
    const obj: { tag: string, type: string, value?: TtlvValue } = {
      tag: this.tag,
      type: this.type
    }
    if (this.type === TtlvType.BigInteger || this.type === TtlvType.LongInteger) {
      obj.value = "0x" + (this.value as BigInt).toString(16).toUpperCase()
    } else {
      obj.value = this.value
    }
    return obj
  }

  public static fromJSON(json: string): TTLV {
    const obj: TTLV = JSON.parse(json)
    if (obj.type === TtlvType.LongInteger || obj.type === TtlvType.BigInteger) {
      obj.value = BigInt(obj.value as string)
    }
    return new TTLV(obj.tag, obj.type, obj.value)
  }
}
