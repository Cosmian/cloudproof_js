import { KeyBlock } from "../data_structures/KeyBlock";
import { PropertyMetadata } from "../decorators/function";
import { TtlvType } from "../serialize/TtlvType";
import { KmipObject } from "./KmipObject";

export class PublicKey extends KmipObject {
    @PropertyMetadata({
        name: "KeyBlock",
        type: TtlvType.Structure,
    })
    private _keyBlock: KeyBlock;

    constructor(keyBlock: KeyBlock) {
        super();
        this._keyBlock = keyBlock;
    }

    public get keyBlock(): KeyBlock {
        return this._keyBlock;
    }
    public set keyBlock(value: KeyBlock) {
        this._keyBlock = value;
    }

    public equals(o: any): boolean {
        if (o == this)
            return true;
        if (!(o instanceof PublicKey)) {
            return false;
        }
        let publicKey = o as PublicKey;
        return this._keyBlock === publicKey.keyBlock;
    }

    public toString(): string {
        return "{" + " keyBlock='" + this._keyBlock + "'" + "}";
    }

}
