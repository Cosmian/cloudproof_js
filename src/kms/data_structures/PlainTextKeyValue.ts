import { hexDecode, hexEncode } from "../../utils/utils"
import { metadata } from "../decorators/function"
import { fromTTLV } from "../deserialize/deserializer"
import { toTTLV } from "../serialize/serializer"
import { TTLV } from "../serialize/Ttlv"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"
import { KeyFormatType } from "../types/KeyFormatType"
import { TransparentDHPrivateKey } from "./TransparentDHPrivateKey"
import { TransparentDHPublicKey } from "./TransparentDHPublicKey"
import { TransparentECPrivateKey } from "./TransparentECPrivateKey"
import { TransparentECPublicKey } from "./TransparentECPublicKey"
import { TransparentSymmetricKey } from "./TransparentSymmetricKey"
type KeyMaterial =
  | Uint8Array
  | TransparentDHPrivateKey
  | TransparentDHPublicKey
  | TransparentECPrivateKey
  | TransparentECPublicKey
  | TransparentSymmetricKey

export class PlainTextKeyValue {
  tag = "PlainTextKeyValue";

  // This property is only used to help deserialization
  // see KeyBlock
  @metadata({
    name: "IGNORED",
    type: TtlvType.Ignore,
  })
  private readonly _keyFormatType?: KeyFormatType

  @metadata({
    name: "KeyMaterial",
    type: TtlvType.Structure,
    toTtlv(instance: KeyMaterial): TTLV {
      if (instance instanceof Uint8Array) {
        return new TTLV("KeyMaterial", TtlvType.ByteString, hexEncode(instance))
      }
      const ttlv = toTTLV(instance)
      ttlv.tag = "KeyMaterial"
      return ttlv
    },
    fromTtlv(
      propertyName: string,
      ttlv: TTLV,
      parentInstance: PlainTextKeyValue,
    ): KeyMaterial {
      if (ttlv.type === TtlvType.ByteString) {
        return hexDecode(ttlv.value as string)
      }
      if (ttlv.value.constructor.name !== "Array") {
        throw new Error(`Invalid KeyMaterial for property ${propertyName}`)
      }
      if (typeof parentInstance._keyFormatType === "undefined") {
        throw new Error(
          `Deserializer: unknown KeyFormatType when deserializing the KeyMaterial for property ${propertyName}`,
        )
      }
      if (
        parentInstance._keyFormatType === KeyFormatType.TransparentSymmetricKey
      ) {
        return fromTTLV(TransparentSymmetricKey, ttlv)
      }
      if (
        parentInstance._keyFormatType === KeyFormatType.TransparentDHPrivateKey
      ) {
        return fromTTLV(TransparentDHPrivateKey, ttlv)
      }
      if (
        parentInstance._keyFormatType === KeyFormatType.TransparentDHPublicKey
      ) {
        return fromTTLV(TransparentDHPublicKey, ttlv)
      }
      if (
        parentInstance._keyFormatType === KeyFormatType.TransparentECPrivateKey
      ) {
        return fromTTLV(TransparentECPrivateKey, ttlv)
      }
      if (
        parentInstance._keyFormatType === KeyFormatType.TransparentECPublicKey
      ) {
        return fromTTLV(TransparentECPublicKey, ttlv)
      }
      throw new Error(
        `Deserializer: unable to deserialize KeyMaterial with Key Format Type ${parentInstance._keyFormatType} for property ${propertyName}`,
      )
    },
  })
  private _key_material: KeyMaterial

  @metadata({
    name: "Attributes",
    type: TtlvType.Structure,
    classOrEnum: Attributes,
  })
  private _attributes?: Attributes

  public constructor(
    keyFormatType?: KeyFormatType,
    keyMaterial?: KeyMaterial,
    attributes?: Attributes,
  ) {
    this._keyFormatType = keyFormatType
    this._key_material = keyMaterial ?? new Uint8Array()
    this._attributes = attributes
  }

  public get keyMaterial(): KeyMaterial {
    return this._key_material
  }

  public set keyMaterial(value: KeyMaterial) {
    this._key_material = value
  }

  public get attributes(): Attributes | undefined {
    return this._attributes
  }

  public set attributes(value: Attributes | undefined) {
    this._attributes = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof PlainTextKeyValue)) {
      return false
    }
    const plainTextKeyValue = o
    return (
      this.keyMaterial === plainTextKeyValue.keyMaterial &&
      this.attributes === plainTextKeyValue.attributes
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
