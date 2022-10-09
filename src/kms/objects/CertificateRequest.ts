import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { CertificateRequestType } from "../types/CertificateRequestType"
import { KmipObject } from "./KmipObject"

export class CertificateRequest extends KmipObject {
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

  public constructor(
    certificate_request_type: CertificateRequestType,
    certificate_request_value: number[]
  ) {
    super()
    this._certificate_request_type = certificate_request_type
    this._certificate_request_value = certificate_request_value
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
    if (o == this) {
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
    return (
      "{" +
      " certificate_request_type='" +
      this.certificate_request_type +
      "'" +
      ", certificate_request_value='" +
      this.certificate_request_value +
      "'" +
      "}"
    )
  }
}
