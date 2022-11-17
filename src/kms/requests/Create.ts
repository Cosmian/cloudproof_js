import { ObjectType } from "../structs/objects"
import { Attributes } from "../structs/object_attributes"
import { Serializable } from "../kmip"
import { KmsRequest } from ".."
import { GenericUniqueIdentifierResponse } from "../responses/GenericUniqueIdentifierResponse"

export class Create implements KmsRequest<GenericUniqueIdentifierResponse> {
    __response: GenericUniqueIdentifierResponse | undefined

    tag = "Create"
  
    objectType: ObjectType
    attributes: Attributes
    protectionStorageMasks: number | null = null
  
    constructor(
        objectType: ObjectType,
        attributes: Attributes,
        protectionStorageMasks: number | null = null,
    ) {
        if (attributes.objectType !== objectType) {
            throw new Error(`Import: invalid object type ${attributes.objectType} for object of type ${objectType}`)
        }

        this.objectType = objectType
        this.attributes = attributes
        this.protectionStorageMasks = protectionStorageMasks
    }
  }
  