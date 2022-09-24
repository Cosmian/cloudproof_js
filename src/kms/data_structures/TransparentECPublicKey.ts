import { PropertyMetadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { RecommendedCurve } from "../types/RecommendedCurve"

export class TransparentECPublicKey implements KmipStruct {

    @PropertyMetadata({
        name: "RecommendedCurve",
        type: TtlvType.Enumeration,
        isEnum: RecommendedCurve
    })
    private _recommendedCurve: RecommendedCurve

    @PropertyMetadata({
        name: "QString",
        type: TtlvType.ByteString,
    })
    private _qString: Uint8Array

    constructor(recommendedCurve: RecommendedCurve, qString: Uint8Array) {
        this._recommendedCurve = recommendedCurve
        this._qString = qString
    }

    public get recommendedCurve(): RecommendedCurve {
        return this._recommendedCurve
    }
    public set recommendedCurve(value: RecommendedCurve) {
        this._recommendedCurve = value
    }
    public get qString(): Uint8Array {
        return this._qString
    }
    public set qString(value: Uint8Array) {
        this._qString = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof TransparentECPublicKey)) {
            return false
        }
        const transparentECPublicKey = o as TransparentECPublicKey
        return this.recommendedCurve === transparentECPublicKey.recommendedCurve
            && this.qString === transparentECPublicKey.qString
    }

    public toString(): string {
        return "{" + " recommendedCurve='" + this.recommendedCurve + "'" + ", qString='" + this.qString + "'" + "}"
    }

}
