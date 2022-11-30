import { GetResponse } from "../responses/GetResponse"
import { KmsRequest } from "../kms"

export class Get implements KmsRequest<GetResponse> {
  __response: GetResponse | undefined
  tag = "Get"

  uniqueIdentifier: string

  constructor(uniqueIdentifier: string) {
    this.uniqueIdentifier = uniqueIdentifier
  }
}
