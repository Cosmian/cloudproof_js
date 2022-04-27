import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class KmipChoiceKey<C1, C2, C3, C4, C5, C6> {

    @PropertyMetadata({
        name: "Key",
        type: TtlvType.ByteString,
    })
    private _c1?: C1 | undefined

    @PropertyMetadata({
        name: "Key",
        type: TtlvType.Structure,
    })
    private _c2?: C2 | undefined

    @PropertyMetadata({
        name: "Key",
        type: TtlvType.Structure,
    })
    private _c3?: C3 | undefined
    public get c3(): C3 | undefined {
        return this._c3
    }
    public set c3(value: C3 | undefined) {
        this._c3 = value
    }

    @PropertyMetadata({
        name: "Key",
        type: TtlvType.Structure,
    })
    private _c4?: C4 | undefined
    public get c4(): C4 | undefined {
        return this._c4
    }
    public set c4(value: C4 | undefined) {
        this._c4 = value
    }

    @PropertyMetadata({
        name: "Key",
        type: TtlvType.Structure,
    })
    private _c5?: C5 | undefined
    public get c5(): C5 | undefined {
        return this._c5
    }
    public set c5(value: C5 | undefined) {
        this._c5 = value
    }

    @PropertyMetadata({
        name: "Key",
        type: TtlvType.Structure,
    })
    private _c6?: C6 | undefined
    public get c6(): C6 | undefined {
        return this._c6
    }
    public set c6(value: C6 | undefined) {
        this._c6 = value
    }

    constructor(c1?: C1, c2?: C2, c3?: C3, c4?: C4, c5?: C5, c6?: C6) {
        this._c1 = c1
        this._c2 = c2
        this._c3 = c3
        this._c4 = c4
        this._c5 = c5
        this._c6 = c6
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

    public equals(o: object): boolean {
        if (o == this)
            return true
        if (!(o instanceof KmipChoiceKey)) {
            return false
        }
        let kmipChoice = o as KmipChoiceKey<any, any, any, any, any, any>
        return this.c1 === kmipChoice.c1 && this.c2 === kmipChoice.c2
            && this.c3 === kmipChoice.c3 && this.c4 === kmipChoice.c4
            && this.c5 === kmipChoice.c5 && this.c6 === kmipChoice.c6
    }

    public toString(): string {
        return "{" + " key_material='" + (this.c1, this.c2, this.c3, this.c4, this.c5, this.c6) + "}"
    }

}