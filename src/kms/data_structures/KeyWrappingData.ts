import { metadata } from "../../kms/decorators/function"
import { KmipStruct } from "../../kms/json/KmipStruct"
import { TtlvType } from "../../kms/serialize/TtlvType"
import { EncodingOption } from "../../kms/types/EncodingOption"
import { EncryptionKeyInformation } from "../../kms/types/EncryptionKeyInformation"
import { MacSignatureKeyInformation } from "../../kms/types/MacSignatureKeyInformation"
import { WrappingMethod } from "../../kms/types/WrappingMethod"

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
  @metadata({
    name: "WrappingMethod",
    type: TtlvType.Enumeration,
    classOrEnum: WrappingMethod,
  })
  private _wrappingMethod: WrappingMethod

  @metadata({
    name: "EncryptionKeyInformation",
    type: TtlvType.Structure,
  })
  private _encryptionKeyInformation?: EncryptionKeyInformation

  @metadata({
    name: "MacOrSignatureKeyInformation",
    type: TtlvType.Structure,
  })
  private _macOrSignatureKeyInformation?: MacSignatureKeyInformation

  @metadata({
    name: "MacOrSignature",
    type: TtlvType.ByteString,
  })
  private _macOrSignature?: Uint8Array

  @metadata({
    name: "IvCounterNonce",
    type: TtlvType.ByteString,
  })
  private _ivCounterNonce?: Uint8Array

  /**
   * Specifies the encoding of the Key Value Byte String. If not present, the wrapped Key Value structure SHALL be
   * TTLV encoded.
   */
  private _encodingOption?: EncodingOption

  constructor(
    wrappingMethod: WrappingMethod,
    encryptionKeyInformation?: EncryptionKeyInformation,
    macOrSignatureKeyInformation?: MacSignatureKeyInformation,
    macOrSignature?: Uint8Array,
    ivCounterNonce?: Uint8Array,
    encodingOption?: EncodingOption,
  ) {
    this._wrappingMethod = wrappingMethod
    this._encryptionKeyInformation = encryptionKeyInformation
    this._macOrSignatureKeyInformation = macOrSignatureKeyInformation
    this._macOrSignature = macOrSignature
    this._ivCounterNonce = ivCounterNonce
    this._encodingOption = encodingOption
  }

  public get wrapping_method(): WrappingMethod {
    return this._wrappingMethod
  }

  public set wrapping_method(value: WrappingMethod) {
    this._wrappingMethod = value
  }

  public get encryptionKeyInformation(): EncryptionKeyInformation | undefined {
    return this._encryptionKeyInformation
  }

  public set encryptionKeyInformation(
    value: EncryptionKeyInformation | undefined,
  ) {
    this._encryptionKeyInformation = value
  }

  public get macOrSignatureKeyInformation():
    | MacSignatureKeyInformation
    | undefined {
    return this._macOrSignatureKeyInformation
  }

  public set macOrSignatureKeyInformation(
    value: MacSignatureKeyInformation | undefined,
  ) {
    this._macOrSignatureKeyInformation = value
  }

  public get macOrSignature(): Uint8Array | undefined {
    return this._macOrSignature
  }

  public set macOrSignature(value: Uint8Array | undefined) {
    this._macOrSignature = value
  }

  public get ivCounterNonce(): Uint8Array | undefined {
    return this._ivCounterNonce
  }

  public set ivCounterNonce(value: Uint8Array | undefined) {
    this._ivCounterNonce = value
  }

  public get encodingOption(): EncodingOption | undefined {
    return this._encodingOption
  }

  public set encodingOption(value: EncodingOption | undefined) {
    this._encodingOption = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof KeyWrappingData)) {
      return false
    }
    const keyWrappingData = o
    return (
      this.wrapping_method === keyWrappingData.wrapping_method &&
      this.encryptionKeyInformation ===
        keyWrappingData.encryptionKeyInformation &&
      this.macOrSignatureKeyInformation ===
        keyWrappingData.macOrSignatureKeyInformation &&
      this.macOrSignature === keyWrappingData.macOrSignature &&
      this.ivCounterNonce === keyWrappingData.ivCounterNonce &&
      this.encodingOption === keyWrappingData.encodingOption
    )
  }

  public toString(): string {
    return `{ wrapping_method=${
      this.wrapping_method
    }, EncryptionKeyInformation=${
      this.encryptionKeyInformation?.toString() ?? "N/A"
    }, MacOrSignatureKeyInformation=${
      this.macOrSignatureKeyInformation?.toString() ?? "N/A"
    }, MacOrSignature=${
      this.macOrSignature?.toString() ?? "N/A"
    }, IvCounterNonce=${
      this.ivCounterNonce?.toString() ?? "N/A"
    }, EncodingOption=${this.encodingOption ?? "N/A"}}`
  }
}
