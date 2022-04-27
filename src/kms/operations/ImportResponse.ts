import { PropertyMetadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class ImportResponse implements KmipStruct {

    // The Unique Identifier of the object to be imported
    @PropertyMetadata({
        name: "UniqueIdentifier",
        type: TtlvType.TextString,
    })
    private _uniqueIdentifier: string

    constructor(uniqueIdentifier: string) {
        this._uniqueIdentifier = uniqueIdentifier
    }

    public get uniqueIdentifier(): string {
        return this._uniqueIdentifier
    }
    public set uniqueIdentifier(value: string) {
        this._uniqueIdentifier = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof ImportResponse)) {
            return false
        }
        let importResponse = o as ImportResponse
        return this._uniqueIdentifier === importResponse.uniqueIdentifier
    }

    public toString(): string {
        return "{" + " uniqueIdentifier='" + this._uniqueIdentifier + "'" + "}"
    }

}
