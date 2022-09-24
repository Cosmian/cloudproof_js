import { UniqueIdentifier } from "./UniqueIdentifier"
import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

/**
 * Either:
 *
 * - String : Unique Identifier of a Managed Object
 *
 * - Enumeration: Zero based nth Unique Identifier in the response. If negative
 * the count is backwards from the beginning of the current operation’s batch
 * item.
 *
 * - Integer: Index
 */
export class LinkedObjectIdentifier {

    @PropertyMetadata({
        name: "LinkedObjectIdentifier",
        type: TtlvType.TextString,
    })
    private _str?: string | undefined

    @PropertyMetadata({
        name: "LinkedObjectIdentifier",
        type: TtlvType.Integer,
    })
    private _num?: number | undefined

    @PropertyMetadata({
        name: "LinkedObjectIdentifier",
        type: TtlvType.Enumeration,
        isEnum: UniqueIdentifier
    })
    private _uid?: UniqueIdentifier | undefined

    constructor(str?: string, num?: number, uid?: UniqueIdentifier) {
        this.str = str
        this.num = num
        this.uid = uid
    }

    public get str(): string | undefined {
        return this._str
    }
    public set str(value: string | undefined) {
        this._str = value
    }
    public get num(): number | undefined {
        return this._num
    }
    public set num(value: number | undefined) {
        this._num = value
    }

    public get uid(): UniqueIdentifier | undefined {
        return this._uid
    }
    public set uid(value: UniqueIdentifier | undefined) {
        this._uid = value
    }

    public equals(o: object): boolean {
        if (o == this)
            return true
        if (!(o instanceof LinkedObjectIdentifier)) {
            return false
        }
        const kmipChoice = o as LinkedObjectIdentifier
        return this.str === kmipChoice._str &&
            this.num === kmipChoice._num &&
            this.uid === kmipChoice._uid
    }

    public toString(): string {
        return "{" + " linked_object_identifier='" + (this.str, this.num, this.uid) + "}"
    }

}
