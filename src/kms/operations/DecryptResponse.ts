import { PropertyMetadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class DecryptResponse implements KmipStruct {

    /// The Unique Identifier of the Managed
    /// Cryptographic Object that was the key
    /// used for the decryption operation.
    @PropertyMetadata({
        name: "UniqueIdentifier",
        type: TtlvType.TextString,
    })
    private _unique_identifier: string

    /// The decrypted data (as a Byte String).
    @PropertyMetadata({
        name: "Data",
        type: TtlvType.ByteString,
    })
    private _data?: Uint8Array

    /// Specifies the stream or by-parts value
    /// to be provided in subsequent calls to
    /// this operation for performing
    /// cryptographic operations.
    @PropertyMetadata({
        name: "CorrelationValue",
        type: TtlvType.ByteString,
    })
    private _correlation_value?: Uint8Array

    constructor(unique_identifier: string, data?: Uint8Array, correlation_value?: Uint8Array) {
        this._unique_identifier = unique_identifier
        this._data = data
        this._correlation_value = correlation_value
    }

    public get unique_identifier(): string {
        return this._unique_identifier
    }
    public set unique_identifier(value: string) {
        this._unique_identifier = value
    }
    public get data(): Uint8Array | undefined {
        return this._data
    }
    public set data(value: Uint8Array | undefined) {
        this._data = value
    }
    public get correlation_value(): Uint8Array | undefined {
        return this._correlation_value
    }
    public set correlation_value(value: Uint8Array | undefined) {
        this._correlation_value = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof DecryptResponse)) {
            return false
        }
        let decryptResponse = o as DecryptResponse
        return this._unique_identifier === decryptResponse.unique_identifier
            && this._data === decryptResponse.data
            && this._correlation_value === decryptResponse.correlation_value
    }

    public toString(): string {
        return "{" + " unique_identifier='" + this._unique_identifier + "'" + ", data='" + this._data + "'"
            + ", correlation_value='" + this._correlation_value + "'" + "}"
    }

}
