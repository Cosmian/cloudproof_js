import { KmsRequest } from "../kms"
import { GenericUniqueIdentifierResponse } from "../responses/GenericUniqueIdentifierResponse"
import { Attributes } from "../structs/object_attributes"
import { ObjectType } from "../structs/objects"

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
    if (
      attributes?.objectType != null &&
      attributes.objectType !== objectType
    ) {
      throw new Error(
        `Import: invalid object type ${attributes.objectType} for object of type ${objectType}`,
      )
    }
    // if (tags.length > 0) {
    //   const enc = new TextEncoder()
    //   const vendor = new VendorAttributes(
    //     VendorAttributes.VENDOR_ID_COSMIAN,
    //     VendorAttributes.TAG,
    //     enc.encode(JSON.stringify(tags)),
    //   )
    //   attributes.vendorAttributes.push(vendor)
    // }

    this.objectType = objectType
    this.attributes = attributes
    this.protectionStorageMasks = protectionStorageMasks
  }
}
