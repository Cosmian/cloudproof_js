import { PropertyMetadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { CryptographicParameters } from "./CryptographicParameters"

export class EncryptionKeyInformation implements KmipStruct {
    @PropertyMetadata({
        name: "UniqueIdentifier",
        type: TtlvType.TextString,
    })
    private _unique_identifier: string

    @PropertyMetadata({
        name: "CryptographicParameters",
        type: TtlvType.Structure,
    })
    private _cryptographic_parameters?: CryptographicParameters

    constructor(unique_identifier: string,
        cryptographic_parameters?: CryptographicParameters) {
        this._unique_identifier = unique_identifier
        this._cryptographic_parameters = cryptographic_parameters
    }

    public get unique_identifier(): string {
        return this._unique_identifier
    }
    public set unique_identifier(value: string) {
        this._unique_identifier = value
    }
    public get cryptographic_parameters(): CryptographicParameters | undefined {
        return this._cryptographic_parameters
    }
    public set cryptographic_parameters(value: CryptographicParameters | undefined) {
        this._cryptographic_parameters = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof EncryptionKeyInformation)) {
            return false
        }
        const encryptionKeyInformation = o as EncryptionKeyInformation
        return this.unique_identifier === encryptionKeyInformation.unique_identifier
            && this.cryptographic_parameters === encryptionKeyInformation.cryptographic_parameters
    }

    public toString(): string {
        return "{" + " unique_identifier='" + this.unique_identifier + "'" + ", cryptographic_parameters='"
            + this.cryptographic_parameters + "'" + "}"
    }

}
