import { PropertyMetadata } from "../decorators/function";
import { KmipStruct } from "../json/KmipStruct";
import { TtlvType } from "../serialize/TtlvType";
import { ObjectType } from "../types/ObjectType";

export class CreateResponse implements KmipStruct {
    @PropertyMetadata({
        name: "ObjectType",
        type: TtlvType.Enumeration,
        isEnum: ObjectType,
    })    /// Type of object created.
    private _objectType: ObjectType;

    @PropertyMetadata({
        name: "UniqueIdentifier",
        type: TtlvType.TextString,
    })
    /// The Unique Identifier of the object created
    private _uniqueIdentifier: string;

    constructor(objectType: ObjectType, uniqueIdentifier: string) {
        this._objectType = objectType;
        this._uniqueIdentifier = uniqueIdentifier;
    }

    public get objectType(): ObjectType {
        return this._objectType;
    }
    public set objectType(value: ObjectType) {
        this._objectType = value;
    }
    public get uniqueIdentifier(): string {
        return this._uniqueIdentifier;
    }
    public set uniqueIdentifier(value: string) {
        this._uniqueIdentifier = value;
    }
    public equals(o: any): boolean {
        if (o == this)
            return true;
        if (!(o instanceof CreateResponse)) {
            return false;
        }
        const createResponse = o as CreateResponse;
        return this._objectType === createResponse.objectType
                && this._uniqueIdentifier === createResponse.uniqueIdentifier;
    }

    public toString(): string {
        return "{" + " objectType='" + this._objectType + "'" + ", uniqueIdentifier='" + this._uniqueIdentifier + "'"
                + "}";
    }

}
