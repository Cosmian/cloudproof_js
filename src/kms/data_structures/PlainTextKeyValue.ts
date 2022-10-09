import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { Attributes } from "../types/Attributes"
import { KeyMaterial } from "./KeyMaterial"

export class PlainTextKeyValue implements KmipStruct {
  @metadata({
    name: "KeyMaterial",
    type: TtlvType.Structure,
  })
  private _key_material: KeyMaterial

  @metadata({
    name: "Attributes",
    type: TtlvType.Structure,
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
    return (
      "{" +
      " keyMaterial='" +
      this.keyMaterial +
      "'" +
      ", attributes='" +
      this.attributes +
      "'" +
      "}"
    )
  }
}
