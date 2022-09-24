import { KeyBlock } from "../data_structures/KeyBlock"
import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { KmipObject } from "./KmipObject"

/**
 * A Managed Cryptographic Object that is a text-based representation of a PGP
 * key. The Key Block field, indicated below, will contain the ASCII-armored
 * export of a PGP key in the format as specified in RFC 4880. It MAY contain
 * only a public key block, or both a public and private key block. Two
 * different versions of PGP keys, version 3 and version 4, MAY be stored in
 * this Managed Cryptographic Object.
 *
 * KMIP implementers SHOULD treat the Key Block field as an opaque blob.
 * PGP-aware KMIP clients SHOULD take on the responsibility of decomposing the
 * Key Block into other Managed Cryptographic Objects (Public Keys, Private
 * Keys, etc.).
 */
export class PGPKey extends KmipObject {
    @PropertyMetadata({
        name: "PgpKeyVersion",
        type: TtlvType.Integer,
    })
    private _pgp_key_version: number

    @PropertyMetadata({
        name: "KeyBlock",
        type: TtlvType.Structure,
    })
    private _keyBlock: KeyBlock

    constructor(pgp_key_version: number, keyBlock: KeyBlock) {
        super()
        this._pgp_key_version = pgp_key_version
        this._keyBlock = keyBlock
    }

    public get keyBlock(): KeyBlock {
        return this._keyBlock
    }
    public set keyBlock(value: KeyBlock) {
        this._keyBlock = value
    }
    public get pgp_key_version(): number {
        return this._pgp_key_version
    }
    public set pgp_key_version(value: number) {
        this._pgp_key_version = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof PGPKey)) {
            return false
        }
        const pGPKey = o as PGPKey
        return this._pgp_key_version === pGPKey.pgp_key_version && this._keyBlock === pGPKey.keyBlock
    }

    public toString(): string {
        return "{" + " pgp_key_version='" + this._pgp_key_version + "'" + ", keyBlock='" + this._keyBlock + "'" + "}"
    }

}
