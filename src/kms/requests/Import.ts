import { KmsRequest } from "../kms"
import { GenericUniqueIdentifierResponse } from "../responses/GenericUniqueIdentifierResponse"
import { Attributes } from "../structs/object_attributes"
import { KmsObject, ObjectType } from "../structs/objects"
import { KeyWrapType } from "../structs/types"

export class Import implements KmsRequest<GenericUniqueIdentifierResponse> {
  __response: GenericUniqueIdentifierResponse | undefined

  tag = "Import"

  uniqueIdentifier: string
  objectType: ObjectType
  object: KmsObject
  attributes: Attributes
  replaceExisting: boolean = false
  keyWrapType: KeyWrapType | null = null

  constructor(
    uniqueIdentifier: string,
    objectType: ObjectType,
    object: KmsObject,
    attributes: Attributes,
    replaceExisting: boolean = false,
    keyWrapType: KeyWrapType | null = null,
  ) {
    if (
      attributes?.objectType != null &&
      attributes.objectType !== object.type
    ) {
      throw new Error(
        `Import: invalid object type ${attributes.objectType} for object of type ${object.type}`,
      )
    }

    this.uniqueIdentifier = uniqueIdentifier
    this.objectType = objectType
    this.replaceExisting = replaceExisting
    this.keyWrapType = keyWrapType
    this.attributes = attributes
    this.object = object
  }
}
