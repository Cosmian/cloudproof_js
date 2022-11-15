import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { OpaqueDataType } from "../types/OpaqueDataType"

export class OpaqueObject {
  @metadata({
    name: "OpaqueDataType",
    type: TtlvType.Enumeration,
    classOrEnum: OpaqueDataType,
  })
  private _opaque_data_type: OpaqueDataType

  @metadata({
    name: "OpaqueDataValue",
    type: TtlvType.Integer,
  })
  private _opaque_data_value: number

  public constructor(
    opaqueDataType?: OpaqueDataType,
    opaqueDataValue?: number,
  ) {
    this._opaque_data_type = opaqueDataType ?? OpaqueDataType.Unknown
    this._opaque_data_value = opaqueDataValue ?? 0
  }

  public get opaque_data_type(): OpaqueDataType {
    return this._opaque_data_type
  }

  public set opaque_data_type(value: OpaqueDataType) {
    this._opaque_data_type = value
  }

  public get opaque_data_value(): number {
    return this._opaque_data_value
  }

  public set opaque_data_value(value: number) {
    this._opaque_data_value = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof OpaqueObject)) {
      return false
    }
    const opaqueObject = o
    return (
      this.opaque_data_type === opaqueObject.opaque_data_type &&
      this.opaque_data_value === opaqueObject.opaque_data_value
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
