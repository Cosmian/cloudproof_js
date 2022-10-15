import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { RevocationReasonEnumeration } from "./RevocationReasonEnumeration"

/**
 * Either:
 *
 * - String : a plain text reason
 *
 * - Enumeration: one of the listed evocation reason enumeration
 */
export class RevocationReason {
  @metadata({
    name: "RevocationReason",
    type: TtlvType.TextString,
  })
  private _str?: string | undefined

  @metadata({
    name: "RevocationReason",
    type: TtlvType.Enumeration,
  })
  private _reason?: RevocationReasonEnumeration | undefined


  constructor(str?: string, reason?: RevocationReasonEnumeration) {
    this.str = str
    this._reason = reason
  }

  public get str(): string | undefined {
    return this._str
  }

  public set str(value: string | undefined) {
    this._str = value
  }

  public get reason(): RevocationReasonEnumeration | undefined {
    return this._reason
  }

  public set reason(value: RevocationReasonEnumeration | undefined) {
    this._reason = value
  }


  public equals(o: object): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof RevocationReason)) {
      return false
    }
    return (
      this.str === o._str &&
      this.reason === o._reason
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
