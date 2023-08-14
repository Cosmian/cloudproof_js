import { KmsRequest } from "../kms"
import { LocateResponse } from "../responses/LocateResponse"
import { Attributes } from "../structs/object_attributes"

export class Locate implements KmsRequest<LocateResponse> {
  __response: LocateResponse | undefined
  tag = "Locate"

  attributes: Attributes

  constructor(attributes: Attributes) {
    this.attributes = attributes
  }
}
