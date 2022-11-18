import { GenericUniqueIdentifierResponse } from "../responses/GenericUniqueIdentifierResponse"
import { KmsRequest } from ".."
import { Serializable } from "../kmip"
import { RevocationReasonEnumeration } from "../structs/types"

export class Revoke implements KmsRequest<GenericUniqueIdentifierResponse> {
  __response: GenericUniqueIdentifierResponse | undefined
  tag = "Revoke"

  uniqueIdentifier: string
  revocationReason: string | RevocationReasonEnumeration

  constructor(
    uniqueIdentifier: string,
    revocationReason: string | RevocationReasonEnumeration,
  ) {
    this.uniqueIdentifier = uniqueIdentifier
    this.revocationReason = revocationReason
  }
}
