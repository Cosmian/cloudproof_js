import { KeyBlock } from "../data_structures/KeyBlock";
import { PropertyMetadata } from "../decorators/function";
import { TtlvType } from "../serialize/TtlvType";
import { SecretDataType } from "../types/SecretDataType";
import { KmipObject } from "./KmipObject";

export class SecretData extends KmipObject {
  @PropertyMetadata({
    name: "SecretDataType",
    type: TtlvType.Enumeration,
    isEnum: SecretDataType,
  })
  private _secretDataType: SecretDataType;

  @PropertyMetadata({
    name: "KeyBlock",
    type: TtlvType.Structure,
  })
  private _keyBlock: KeyBlock;

  constructor(secretDataType: SecretDataType, keyBlock: KeyBlock) {
    super();
    this._secretDataType = secretDataType;
    this._keyBlock = keyBlock;
  }

  public get secretDataType(): SecretDataType {
    return this._secretDataType;
  }

  public set secretDataType(value: SecretDataType) {
    this._secretDataType = value;
  }

  public get keyBlock(): KeyBlock {
    return this._keyBlock;
  }

  public set keyBlock(value: KeyBlock) {
    this._keyBlock = value;
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true;
    }
    if (!(o instanceof SecretData)) {
      return false;
    }
    const secretData = o;
    return (
      this._secretDataType === secretData.secretDataType &&
      this._keyBlock === secretData.keyBlock
    );
  }

  public toString(): string {
    return (
      "{" +
      " secretDataType='" +
      this._secretDataType +
      "'" +
      ", keyBlock='" +
      this._keyBlock +
      "'" +
      "}"
    );
  }
}
