import { PropertyMetadata } from "../decorators/function";
import { TtlvType } from "../serialize/TtlvType";
import { CertificateType } from "../types/CertificateType";
import { KmipObject } from "./KmipObject";

/**
 * A Managed Cryptographic Object that is a digital certificate. It is a
 * DER-encoded X.509 public key certificate. Object Encoding REQUIRED
 * Certificate Structure Certificate Type Enumeration Yes Certificate Value Byte
 * String Yes
 */
export class Certificate extends KmipObject {
  @PropertyMetadata({
    name: "CertificateType",
    type: TtlvType.Enumeration,
    isEnum: CertificateType,
  })
  private _certificateType: CertificateType;

  @PropertyMetadata({
    name: "CertificateValue",
    type: TtlvType.Integer,
  })
  private _certificateValue: number[];

  public constructor(
    certificateType: CertificateType,
    certificateValue: number[]
  ) {
    super();
    this._certificateType = certificateType;
    this._certificateValue = certificateValue;
  }

  public get certificateType(): CertificateType {
    return this._certificateType;
  }

  public set certificateType(value: CertificateType) {
    this._certificateType = value;
  }

  public get certificateValue(): number[] {
    return this._certificateValue;
  }

  public set certificateValue(value: number[]) {
    this._certificateValue = value;
  }

  public equals(o: Object): boolean {
    if (o == this) {
      return true;
    }
    if (!(o instanceof Certificate)) {
      return false;
    }
    const certificate = o;
    return (
      this.certificateType === certificate.certificateType &&
      this.certificateValue === certificate.certificateValue
    );
  }

  public toString(): string {
    return (
      "{" +
      " certificateType='" +
      this.certificateType +
      "'" +
      ", certificateValue='" +
      this.certificateValue +
      "'" +
      "}"
    );
  }
}
