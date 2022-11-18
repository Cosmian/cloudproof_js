export class GenericKeyPairResponse {
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
