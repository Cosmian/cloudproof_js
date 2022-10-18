import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { RevocationReason } from "../types/RevocationReason"

/**
 * This operation requests the server to revoke a Managed Cryptographic Object or an Opaque Object. The request contains
 * a reason for the revocation (e.g., “key compromise”, “cessation of operation”, etc.). The operation has one of two
 * effects. If the revocation reason is “key compromise” or “CA compromise”, then the object is placed into the
 * “compromised” state; the Date is set to the current date and time; and the Compromise Occurrence Date is set to the
 * value (if provided) in the Revoke request and if a value is not provided in the Revoke request then Compromise
 * Occurrence Date SHOULD be set to the Initial Date for the object. If the revocation reason is neither “key
 * compromise” nor “CA compromise”, the object is placed into the “deactivated” state, and the Deactivation Date is set
 * to the current date and time.
 */
export class Revoke implements KmipStruct {
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string

  @metadata({
    name: "RevocationReason",
    type: TtlvType.Choice,
  })
  private _revocationReason: RevocationReason

  constructor(uniqueIdentifier: string, revocationReason: RevocationReason) {
    this._uniqueIdentifier = uniqueIdentifier
    this._revocationReason = revocationReason
  }

  public get uniqueIdentifier(): string {
    return this._uniqueIdentifier
  }

  public set uniqueIdentifier(value: string) {
    this._uniqueIdentifier = value
  }

  public get revocationReason(): RevocationReason {
    return this._revocationReason
  }

  public set revocationReason(value: RevocationReason) {
    this._revocationReason = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Revoke)) {
      return false
    }
    return (
      this._uniqueIdentifier === o.uniqueIdentifier &&
      this._revocationReason === o.revocationReason
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
