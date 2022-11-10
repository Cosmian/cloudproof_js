import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { CertificateRequestType } from "../types/CertificateRequestType"

export class CertificateRequest {
  @metadata({
    name: "CertificateRequestType",
    type: TtlvType.Enumeration,
    classOrEnum: CertificateRequestType,
  })
  private _certificate_request_type: CertificateRequestType

  @metadata({
    name: "CertificateRequestValue",
    type: TtlvType.Integer,
  })
  private _certificate_request_value: number[]

  /**
   *
   */

  public constructor(
    certificateRequestType?: CertificateRequestType,
    certificateRequestValue?: number[],
  ) {
    this._certificate_request_type =
      certificateRequestType ?? CertificateRequestType.PEM
    this._certificate_request_value = certificateRequestValue ?? []
  }

  public get certificate_request_type(): CertificateRequestType {
    return this._certificate_request_type
  }

  public set certificate_request_type(value: CertificateRequestType) {
    this._certificate_request_type = value
  }

  public get certificate_request_value(): number[] {
    return this._certificate_request_value
  }

  public set certificate_request_value(value: number[]) {
    this._certificate_request_value = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof CertificateRequest)) {
      return false
    }
    const certificateRequest = o
    return (
      this.certificate_request_type ===
        certificateRequest.certificate_request_type &&
      this.certificate_request_value ===
        certificateRequest.certificate_request_value
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
