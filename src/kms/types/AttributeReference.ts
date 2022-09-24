import { KmipChoiceAttributeReference } from '../json/KmipChoiceAttributeReference'
import { Tag } from './Tag'
import { VendorAttributeReference } from './VendorAttributeReference'

export class AttributeReference extends KmipChoiceAttributeReference<string, VendorAttributeReference, Tag> {
  constructor (value1?: string, value2?: VendorAttributeReference, value3?: Tag) {
    super(value1, value2, value3)
  }

  public equals (o: any): boolean {
    return super.equals(o)
  }

  public toString (): string {
    return super.toString()
  }
}
