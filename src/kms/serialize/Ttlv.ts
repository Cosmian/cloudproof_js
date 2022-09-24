import { DateTimeExtended } from './DateTimeExtended'
import { Interval } from './Interval'
import { LongInt } from './LongInt'
import { TtlvType } from './TtlvType'

export type TtlvValue = TTLV[] | Date | Uint8Array | LongInt | Interval | DateTimeExtended | number | bigint | boolean | string

export class TTLV {
  public tag: string
  public type: TtlvType
  public value: TtlvValue

  constructor (tag: string, type: TtlvType, value: TtlvValue) {
    this.tag = tag
    this.type = type
    this.value = value
  }
}
