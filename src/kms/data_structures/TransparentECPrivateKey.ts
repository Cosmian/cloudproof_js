import { PropertyMetadata } from "../decorators/function";
import { KmipStruct } from "../json/KmipStruct";
import { TtlvType } from "../serialize/TtlvType";
import { RecommendedCurve } from "../types/RecommendedCurve";

export class TransparentECPrivateKey implements KmipStruct {
    @PropertyMetadata({
        name: "RecommendedCurve",
        type: TtlvType.Enumeration,
        isEnum: RecommendedCurve
    })
    private _recommendedCurve: RecommendedCurve;

    @PropertyMetadata({
        name: "D",
        type: TtlvType.BigInteger,
    })
    private _d: BigInt;
    
    public get recommendedCurve(): RecommendedCurve {
        return this._recommendedCurve;
    }
    public set recommendedCurve(value: RecommendedCurve) {
        this._recommendedCurve = value;
    }
    public get d(): BigInt {
        return this._d;
    }
    public set d(value: BigInt) {
        this._d = value;
    }

    public constructor(recommendedCurve: RecommendedCurve, d: BigInt) {
        this._recommendedCurve = recommendedCurve;
        this._d = d;
    }

    public equals(o: any): boolean {
        if (o == this)
            return true;
        if (!(o instanceof TransparentECPrivateKey)) {
            return false;
        }
        let transparentECPrivateKey = o as TransparentECPrivateKey;
        return this.recommendedCurve === transparentECPrivateKey.recommendedCurve
            && this.d === transparentECPrivateKey.d;
    }

    public toString(): string {
        return "{" + " recommendedCurve='" + this.recommendedCurve + "'" + ", d='" + this.d + "'" + "}";
    }

}