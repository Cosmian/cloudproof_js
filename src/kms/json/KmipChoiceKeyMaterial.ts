import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class KmipChoiceKeyMaterial<C1, C2> {

    @PropertyMetadata({
        name: "KeyMaterial",
        type: TtlvType.ByteString,
    })
    private _c1?: C1 | undefined

    @PropertyMetadata({
        name: "KeyMaterial",
        type: TtlvType.Structure,
    })
    private _c2?: C2 | undefined

    constructor(c1?: C1 | undefined, c2?: C2 | undefined) {
        this.c1 = c1
        this.c2 = c2
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
        if (!(o instanceof KmipChoiceKeyMaterial)) {
            return false
        }
        let kmipChoice = o as KmipChoiceKeyMaterial<any, any>
        return this.c1 === kmipChoice.c1 && this.c2 === kmipChoice.c2
    }

    public toString(): string {
        return "{" + " key_material='" + (this.c1, this.c2) + "}"
    }

}