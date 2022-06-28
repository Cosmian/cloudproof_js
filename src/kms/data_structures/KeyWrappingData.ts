import { KmipStruct } from "../json/KmipStruct"
import { EncodingOption } from "../types/EncodingOption"
import { EncryptionKeyInformation } from "../types/EncryptionKeyInformation"
import { MacSignatureKeyInformation } from "../types/MacSignatureKeyInformation"
import { WrappingMethod } from "../types/WrappingMethod"
import { PropertyMetadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

/**
 * The Key Block MAY also supply OPTIONAL information about a cryptographic key wrapping mechanism used to wrap the Key
 * Value. This consists of a Key Wrapping Data structure. It is only used inside a Key Block. This structure contains
 * fields for:
 *
 * Value Description
 *
 * Wrapping Method Indicates the method used to wrap the Key Value.
 *
 * Encryption Key Information Contains the Unique Identifier value of the encryption key and associated cryptographic
 * parameters.
 *
 * MAC/Signature Key Information Contains the Unique Identifier value of the MAC/signature key and associated
 * cryptographic parameters.
 *
 * MAC/Signature Contains a MAC or signature of the Key Value
 *
 * IV/Counter/Nonce If REQUIRED by the wrapping method.
 *
 * Encoding Option Specifies the encoding of the Key Material within the Key Value structure of the Key Block that has
 * been wrapped. If No Encoding is specified, then the Key Value structure SHALL NOT contain any attributes.
 *
 * If wrapping is used, then the whole Key Value structure is wrapped unless otherwise specified by the Wrapping Method.
 * The algorithms used for wrapping are given by the Cryptographic Algorithm attributes of the encryption key and/or
 * MAC/signature key; the block-cipher mode, padding method, and hashing algorithm used for wrapping are given by the
 * Cryptographic Parameters in the Encryption Key Information and/or MAC/Signature Key Information, or, if not present,
 * from the Cryptographic Parameters attribute of the respective key(s). Either the Encryption Key Information or the
 * MAC/Signature Key Information (or both) in the Key Wrapping Data structure SHALL be specified.
 */
export class KeyWrappingData implements KmipStruct {

    @PropertyMetadata({
        name: "WrappingMethod",
        type: TtlvType.Enumeration,
        isEnum: WrappingMethod
    })
    private _wrapping_method: WrappingMethod

    @PropertyMetadata({
        name: "EncryptionKeyInformation",
        type: TtlvType.Structure,
    })
    private _encryption_key_information?: EncryptionKeyInformation

    @PropertyMetadata({
        name: "MacOrSignatureKeyInformation",
        type: TtlvType.Structure,
    })
    private _mac_or_signature_key_information?: MacSignatureKeyInformation

    @PropertyMetadata({
        name: "MacOrSignature",
        type: TtlvType.ByteString,
    })
    private _mac_or_signature?: Uint8Array

    @PropertyMetadata({
        name: "IvCounterNonce",
        type: TtlvType.ByteString,
    })
    private _iv_counter_nonce?: Uint8Array

    /**
     * Specifies the encoding of the Key Value Byte String. If not present, the wrapped Key Value structure SHALL be
     * TTLV encoded.
     */
    private _encoding_option?: EncodingOption

    constructor(wrapping_method: WrappingMethod,
        encryption_key_information?: EncryptionKeyInformation,
        mac_or_signature_key_information?: MacSignatureKeyInformation, mac_or_signature?: Uint8Array,
        iv_counter_nonce?: Uint8Array, encoding_option?: EncodingOption) {
        this._wrapping_method = wrapping_method
        this._encryption_key_information = encryption_key_information
        this._mac_or_signature_key_information = mac_or_signature_key_information
        this._mac_or_signature = mac_or_signature
        this._iv_counter_nonce = iv_counter_nonce
        this._encoding_option = encoding_option
    }

    public get wrapping_method(): WrappingMethod {
        return this._wrapping_method
    }
    public set wrapping_method(value: WrappingMethod) {
        this._wrapping_method = value
    }
    public get encryption_key_information(): EncryptionKeyInformation | undefined {
        return this._encryption_key_information
    }
    public set encryption_key_information(value: EncryptionKeyInformation | undefined) {
        this._encryption_key_information = value
    }
    public get mac_or_signature_key_information(): MacSignatureKeyInformation | undefined {
        return this._mac_or_signature_key_information
    }
    public set mac_or_signature_key_information(value: MacSignatureKeyInformation | undefined) {
        this._mac_or_signature_key_information = value
    }
    public get mac_or_signature(): Uint8Array | undefined {
        return this._mac_or_signature
    }
    public set mac_or_signature(value: Uint8Array | undefined) {
        this._mac_or_signature = value
    }
    public get iv_counter_nonce(): Uint8Array | undefined {
        return this._iv_counter_nonce
    }
    public set iv_counter_nonce(value: Uint8Array | undefined) {
        this._iv_counter_nonce = value
    }
    public get encoding_option(): EncodingOption | undefined {
        return this._encoding_option
    }
    public set encoding_option(value: EncodingOption | undefined) {
        this._encoding_option = value
    }

    public equals(o: any): boolean {
        if (o == this)
            return true
        if (!(o instanceof KeyWrappingData)) {
            return false
        }
        let keyWrappingData = o as KeyWrappingData
        return this.wrapping_method === keyWrappingData.wrapping_method
            && this.encryption_key_information === keyWrappingData.encryption_key_information
            && this.mac_or_signature_key_information === keyWrappingData.mac_or_signature_key_information
            && this.mac_or_signature === keyWrappingData.mac_or_signature
            && this.iv_counter_nonce === keyWrappingData.iv_counter_nonce
            && this.encoding_option === keyWrappingData.encoding_option
    }

    public toString(): string {
        return "{" + " wrapping_method='" + this.wrapping_method + "'" + ", encryption_key_information='"
            + this.encryption_key_information + "'" + ", mac_or_signature_key_information='"
            + this.mac_or_signature_key_information + "'" + ", mac_or_signature='" + this.mac_or_signature + "'"
            + ", iv_counter_nonce='" + this.iv_counter_nonce + "'" + ", encoding_option='" + this.encoding_option + "'"
            + "}"
    }

}