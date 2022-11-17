import { Attributes } from "../structs/object_attributes"
import { Serializable } from "../kmip"
import { KmsRequest } from ".."
import { GenericKeyPairResponse } from "../responses/GenericKeyPairResponse"

export class ReKeyKeyPair implements KmsRequest<GenericKeyPairResponse> {
    __response: GenericKeyPairResponse | undefined

    tag = "ReKeyKeyPair"
  
    privateKeyUniqueIdentifier: string
    offset: number | null = null
    commonAttributes: Attributes | null = null
    privateKeyAttributes: Attributes | null = null
    publicKeyAttributes: Attributes | null = null
    commonProtectionStorageMasks: number | null = null
    privateProtectionStorageMasks: number | null = null
    publicProtectionStorageMasks: number | null = null
  
    constructor(
        privateKeyUniqueIdentifier: string,
        offset: number | null = null,
        commonAttributes: Attributes | null = null,
        privateKeyAttributes: Attributes | null = null,
        publicKeyAttributes: Attributes | null = null,
        commonProtectionStorageMasks: number | null = null,
        privateProtectionStorageMasks: number | null = null,
        publicProtectionStorageMasks: number | null = null,
    ) {
        this.privateKeyUniqueIdentifier = privateKeyUniqueIdentifier
        this.offset = offset
        this.commonAttributes = commonAttributes
        this.privateKeyAttributes = privateKeyAttributes
        this.publicKeyAttributes = publicKeyAttributes
        this.commonProtectionStorageMasks = commonProtectionStorageMasks
        this.privateProtectionStorageMasks = privateProtectionStorageMasks
        this.publicProtectionStorageMasks = publicProtectionStorageMasks
    }
  }
  