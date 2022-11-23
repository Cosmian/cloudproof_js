import { CryptographicParameters } from "../structs/object_attributes"
import { KmsRequest } from ".."
import { DecryptResponse } from "../responses/DecryptResponse"

export class Decrypt implements KmsRequest<DecryptResponse> {
  __response: DecryptResponse | undefined

  tag = "Decrypt"

  uniqueIdentifier: string
  data: Uint8Array
  cryptographicParameters: CryptographicParameters | null = null 
  ivCounterNonce: Uint8Array | null = null 
  initIndicator: boolean | null = null 
  finalIndicator: boolean | null = null 
  authenticatedEncryptionAdditionalData: Uint8Array | null = null 

  constructor(
    uniqueIdentifier: string,
    data: Uint8Array,
    cryptographicParameters: CryptographicParameters | null = null ,
    ivCounterNonce: Uint8Array | null = null ,
    initIndicator: boolean | null = null ,
    finalIndicator: boolean | null = null ,
    authenticatedEncryptionAdditionalData: Uint8Array | null = null ,
  ) {
    this.uniqueIdentifier = uniqueIdentifier
    this.data = data
    this.cryptographicParameters = cryptographicParameters
    this.ivCounterNonce = ivCounterNonce
    this.initIndicator = initIndicator
    this.finalIndicator = finalIndicator
    this.authenticatedEncryptionAdditionalData = authenticatedEncryptionAdditionalData
  }
}
