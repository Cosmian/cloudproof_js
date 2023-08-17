import { KmsRequest } from "../kms"
import { GenericUniqueIdentifierResponse } from "../responses/GenericUniqueIdentifierResponse"
import { Attributes, VendorAttributes } from "../structs/object_attributes"
import { ObjectType } from "../structs/objects"

export class Create implements KmsRequest<GenericUniqueIdentifierResponse> {
  __response: GenericUniqueIdentifierResponse | undefined

  tag = "Create"

  objectType: ObjectType
  attributes: Attributes
  protectionStorageMasks: number | null = null
  tags: string[] = []

  constructor(
    objectType: ObjectType,
    attributes: Attributes,
    protectionStorageMasks: number | null = null,
    tags: string[] = [],
  ) {
    if (
      attributes?.objectType != null &&
      attributes.objectType !== objectType
    ) {
      throw new Error(
        `Import: invalid object type ${attributes.objectType} for object of type ${objectType}`,
      )
    }
    if (this.tags.length > 0) {
      const enc = new TextEncoder()
      const vendor = new VendorAttributes(
        VendorAttributes.VENDOR_ID_COSMIAN,
        VendorAttributes.TAGS,
        enc.encode(JSON.stringify(tags)),
      )
      attributes.vendorAttributes.push(vendor)
    }

    this.objectType = objectType
    this.attributes = attributes
    this.protectionStorageMasks = protectionStorageMasks
  }
}
