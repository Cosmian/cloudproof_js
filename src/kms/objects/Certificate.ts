import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { CertificateType } from "../types/CertificateType"

/**
 * A Managed Cryptographic Object that is a digital certificate. It is a
 * DER-encoded X.509 public key certificate. Object Encoding REQUIRED
 * Certificate Structure Certificate Type Enumeration Yes Certificate Value Byte
 * String Yes
 */
export class Certificate {
  @metadata({
    name: "CertificateType",
    type: TtlvType.Enumeration,
    classOrEnum: CertificateType,
  })
  private _certificateType: CertificateType

  @metadata({
    name: "CertificateValue",
    type: TtlvType.Integer,
  })
  private _certificateValue: number[]

  public constructor(
    certificateType?: CertificateType,
    certificateValue?: number[],
  ) {
    this._certificateType = certificateType ?? CertificateType.X509
    this._certificateValue = certificateValue ?? []
  }

  public get certificateType(): CertificateType {
    return this._certificateType
  }

  public set certificateType(value: CertificateType) {
    this._certificateType = value
  }

  public get certificateValue(): number[] {
    return this._certificateValue
  }

  public set certificateValue(value: number[]) {
    this._certificateValue = value
  }

  public equals(o: Object): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Certificate)) {
      return false
    }
    const certificate = o
    return (
      this.certificateType === certificate.certificateType &&
      this.certificateValue === certificate.certificateValue
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
