import { PropertyMetadata } from "../decorators/function";
import { KmipStruct } from "../json/KmipStruct";
import { TtlvType } from "../serialize/TtlvType";

export class TransparentSymmetricKey implements KmipStruct {
  @PropertyMetadata({
    name: "Key",
    type: TtlvType.ByteString,
  })
  private _key: Uint8Array;

  constructor(key: Uint8Array) {
    this._key = key;
  }

  public get key(): Uint8Array {
    return this._key;
  }

  public set key(value: Uint8Array) {
    this._key = value;
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true;
    }
    if (!(o instanceof TransparentSymmetricKey)) {
      return false;
    }
    const transparentSymmetricKey = o;
    return this.key === transparentSymmetricKey.key;
  }

  public toString(): string {
    return "{" + " key='" + this._key + "'" + "}";
  }
}
