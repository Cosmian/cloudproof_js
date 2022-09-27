import { PropertyMetadata } from "../decorators/function";
import { TtlvType } from "../serialize/TtlvType";
import { OpaqueDataType } from "../types/OpaqueDataType";
import { KmipObject } from "./KmipObject";

export class OpaqueObject extends KmipObject {
  @PropertyMetadata({
    name: "OpaqueDataType",
    type: TtlvType.Enumeration,
    isEnum: OpaqueDataType,
  })
  private _opaque_data_type: OpaqueDataType;

  @PropertyMetadata({
    name: "OpaqueDataValue",
    type: TtlvType.Integer,
  })
  private _opaque_data_value: number;

  public constructor(
    opaque_data_type: OpaqueDataType,
    opaque_data_value: number
  ) {
    super();
    this._opaque_data_type = opaque_data_type;
    this._opaque_data_value = opaque_data_value;
  }

  public get opaque_data_type(): OpaqueDataType {
    return this._opaque_data_type;
  }

  public set opaque_data_type(value: OpaqueDataType) {
    this._opaque_data_type = value;
  }

  public get opaque_data_value(): number {
    return this._opaque_data_value;
  }

  public set opaque_data_value(value: number) {
    this._opaque_data_value = value;
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true;
    }
    if (!(o instanceof OpaqueObject)) {
      return false;
    }
    const opaqueObject = o;
    return (
      this.opaque_data_type === opaqueObject.opaque_data_type &&
      this.opaque_data_value === opaqueObject.opaque_data_value
    );
  }

  public toString(): string {
    return (
      "{" +
      " opaque_data_type='" +
      this.opaque_data_type +
      "'" +
      ", opaque_data_value='" +
      this.opaque_data_value +
      "'" +
      "}"
    );
  }
}
