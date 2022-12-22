export class EncryptResponse {
  uniqueIdentifier: string
  data: Uint8Array
  ivCounterNonce: Uint8Array | null = null
  correlationValue: Uint8Array | null = null
  authenticatedEncryptionTag: Uint8Array | null = null

  constructor(
    uniqueIdentifier: string,
    data: Uint8Array,
    ivCounterNonce: Uint8Array | null = null,
    correlationValue: Uint8Array | null = null,
    authenticatedEncryptionTag: Uint8Array | null = null,
  ) {
    this.uniqueIdentifier = uniqueIdentifier
    this.data = data
    this.ivCounterNonce = ivCounterNonce
    this.correlationValue = correlationValue
    this.authenticatedEncryptionTag = authenticatedEncryptionTag
  }
}
