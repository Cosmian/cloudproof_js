import { GetResponse } from "../responses/GetResponse"
import { KmsRequest } from "../index"
import { Serializable } from "../kmip"

export class Get implements KmsRequest<GetResponse> {
  __response: GetResponse | undefined
  tag = "Get"

  uniqueIdentifier: string

  constructor(uniqueIdentifier: string) {
    this.uniqueIdentifier = uniqueIdentifier
  }
}
