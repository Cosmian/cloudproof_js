import { PropertyMetadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class LocateResponse implements KmipStruct {

    /// An Integer object that indicates the number of object identifiers that
    /// satisfy the identification criteria specified in the request. A server
    /// MAY elect to omit this value from the Response if it is unable or
    /// unwilling to determine the total count of matched items.
    // A server MAY elect to return the Located Items value even if Offset Items is
    /// not present in
    // the Request.
    @PropertyMetadata({
        name: "LocatedItems",
        type: TtlvType.Integer,
    })
    private _located_items?: number

    /// The Unique Identifier of the located objects.    
    @PropertyMetadata({
        name: "UniqueIdentifier",
        type: TtlvType.TextString,
    })
    private _unique_identifier: string[]

    constructor(unique_identifier: string[], located_items?: number) {
        this._located_items = located_items
        this._unique_identifier = unique_identifier
    }

    public get located_items(): number | undefined {
        return this._located_items
    }
    public set located_items(value: number | undefined) {
        this._located_items = value
    }
    public get unique_identifier(): string[] {
        return this._unique_identifier
    }
    public set unique_identifier(value: string[]) {
        this._unique_identifier = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof LocateResponse)) {
            return false
        }
        let locateResponse = o as LocateResponse
        return this._located_items === locateResponse.located_items
            && this._unique_identifier === locateResponse.unique_identifier
    }

    public toString(): string {
        return "{" + " located_items='" + this._located_items + "'" + ", unique_identifier='" + this._unique_identifier
            + "'" + "}"
    }

}
