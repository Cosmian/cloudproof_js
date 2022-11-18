import { Attributes } from "../structs/object_attributes"
import { Serializable } from "../kmip"
import { KmsRequest } from ".."
import { GenericKeyPairResponse } from "../responses/GenericKeyPairResponse"

export class CreateKeyPair implements KmsRequest<GenericKeyPairResponse> {
  __response: GenericKeyPairResponse | undefined

  tag = "CreateKeyPair"

  commonAttributes: Attributes | null = null
  privateKeyAttributes: Attributes | null = null
  publicKeyAttributes: Attributes | null = null
  commonProtectionStorageMasks: number | null = null
  privateProtectionStorageMasks: number | null = null
  publicProtectionStorageMasks: number | null = null

  constructor(
    commonAttributes: Attributes | null = null,
    privateKeyAttributes: Attributes | null = null,
    publicKeyAttributes: Attributes | null = null,
    commonProtectionStorageMasks: number | null = null,
    privateProtectionStorageMasks: number | null = null,
    publicProtectionStorageMasks: number | null = null,
  ) {
    this.commonAttributes = commonAttributes
    this.privateKeyAttributes = privateKeyAttributes
    this.publicKeyAttributes = publicKeyAttributes
    this.commonProtectionStorageMasks = commonProtectionStorageMasks
    this.privateProtectionStorageMasks = privateProtectionStorageMasks
    this.publicProtectionStorageMasks = publicProtectionStorageMasks
  }
}
