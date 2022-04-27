import { DateTimeExtended } from "./DateTimeExtended"
import { Interval } from "./Interval"
import { LongInt } from "./LongInt"
import { TtlvType } from "./TtlvType"

export type TtlvValue = TTLV[] | Date | Uint8Array | LongInt | Interval | DateTimeExtended | number | bigint | boolean | string

export class TTLV {

    private _tag: string
    private _type: TtlvType
    private _value: TtlvValue

    constructor(_tag: string, _type: TtlvType, _value: TtlvValue) {
        this._tag = _tag
        this._type = _type
        this._value = _value
    }

    public get tag(): string {
        return this._tag
    }
    public set tag(value: string) {
        this._tag = value
    }
    public get type(): TtlvType {
        return this._type
    }
    public set type(value: TtlvType) {
        this._type = value
    }
    public get value(): TtlvValue {
        return this._value
    }
    public set value(value: TtlvValue) {
        this._value = value
    }
}