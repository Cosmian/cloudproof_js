import { KmsResponse } from ".."

export class GenericKeyPairResponse implements KmsResponse {
    privateKeyUniqueIdentifier: string
    publicKeyUniqueIdentifier: string

    constructor(
      privateKeyUniqueIdentifier: string,
      publicKeyUniqueIdentifier: string,
    ) {
      this.privateKeyUniqueIdentifier = privateKeyUniqueIdentifier
      this.publicKeyUniqueIdentifier = publicKeyUniqueIdentifier
    }
}
  