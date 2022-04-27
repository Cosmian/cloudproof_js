import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { UniqueIdentifier } from "../types/UniqueIdentifier"

export class KmipChoiceLinkedObjectIdentifier<C1, C2, C3> {

    @PropertyMetadata({
        name: "LinkedObjectIdentifier",
        type: TtlvType.TextString,
    })
    private _c1?: C1 | undefined

    @PropertyMetadata({
        name: "LinkedObjectIdentifier",
        type: TtlvType.Integer,
    })
    private _c2?: C2 | undefined

    @PropertyMetadata({
        name: "LinkedObjectIdentifier",
        type: TtlvType.Enumeration,
        isEnum: UniqueIdentifier
    })
    private _c3?: C3 | undefined

    constructor(c1?: C1, c2?: C2, c3?: C3) {
        this.c1 = c1
        this.c2 = c2
        this.c3 = c3
    }

    public get c1(): C1 | undefined {
        return this._c1
    }
    public set c1(value: C1 | undefined) {
        this._c1 = value
    }
    public get c2(): C2 | undefined {
        return this._c2
    }
    public set c2(value: C2 | undefined) {
        this._c2 = value
    }

    public get c3(): C3 | undefined {
        return this._c3
    }
    public set c3(value: C3 | undefined) {
        this._c3 = value
    }

    public equals(o: object): boolean {
        if (o == this)
            return true
        if (!(o instanceof KmipChoiceLinkedObjectIdentifier)) {
            return false
        }
        let kmipChoice = o as KmipChoiceLinkedObjectIdentifier<any, any, any>
        return this.c1 === kmipChoice.c1 && this.c2 === kmipChoice.c2
    }

    public toString(): string {
        return "{" + " linked_object_identifier='" + (this.c1, this.c2, this.c3) + "}"
    }
}