export class DecryptResponse {
  uniqueIdentifier: string
  data: Uint8Array
  correlationValue: Uint8Array | null = null

  constructor(
    uniqueIdentifier: string,
    data: Uint8Array,
    correlationValue: Uint8Array | null = null,
  ) {
    this.uniqueIdentifier = uniqueIdentifier
    this.data = data
    this.correlationValue = correlationValue
  }
}
