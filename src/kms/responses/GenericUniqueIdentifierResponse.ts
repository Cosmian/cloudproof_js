import { KmsResponse } from ".."

export class GenericUniqueIdentifierResponse implements KmsResponse {
    uniqueIdentifier: string
  
    constructor(uniqueIdentifier: string) {
      this.uniqueIdentifier = uniqueIdentifier
    }
}
  