import { fromTTLV } from "kms/deserialize/deserializer"
import { toTTLV } from "kms/serialize/serializer"
import { TTLV } from "kms/serialize/Ttlv"
import { hexDecode, hexEncode } from "utils/utils"
import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"
import { TransparentDHPrivateKey } from "./TransparentDHPrivateKey"
import { TransparentDHPublicKey } from "./TransparentDHPublicKey"
import { TransparentECPrivateKey } from "./TransparentECPrivateKey"
import { TransparentECPublicKey } from "./TransparentECPublicKey"
import { TransparentSymmetricKey } from "./TransparentSymmetricKey"
type KeyMaterial = Uint8Array | TransparentDHPrivateKey | TransparentDHPublicKey | TransparentECPrivateKey | TransparentECPublicKey | TransparentSymmetricKey


export class PlainTextKeyValue implements KmipStruct {
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
    fromTtlv(propertyName: string, ttlv: TTLV): KeyMaterial {
      if (ttlv.type === TtlvType.ByteString) {
        return hexDecode(ttlv.value as string)
      }
      if (ttlv.value.constructor.name !== "Array") {
        throw new Error(`Invalid KeyMaterial for property ${propertyName}`)
      }
      const ttlvChildren: TTLV[] = ttlv.value as TTLV[]
      if (typeof ttlvChildren.find(v => v.tag === "Key") !== "undefined") {
        // a transparent symmetric key
        return fromTTLV(TransparentSymmetricKey, ttlv)
      }
      if (typeof ttlvChildren.find(v => v.tag === "RecommendedCurve") !== "undefined") {
        // an EC  Key
        return fromTTLV(TransparentSymmetricKey, ttlv)
      }
      throw new Error(`Unknown KeyMaterial for property ${propertyName}`)
    },
  })
  private _key_material: KeyMaterial

  @metadata({
    name: "Attributes",
    type: TtlvType.Structure,
    classOrEnum: Attributes

  })
  private _attributes?: Attributes

  public constructor(keyMaterial: KeyMaterial, attributes?: Attributes) {
    this._key_material = keyMaterial
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
