import { KmipChoiceAttributeReference } from "../json/KmipChoiceAttributeReference"
import { Tag } from "./Tag"
import { VendorAttributeReference } from "./VendorAttributeReference"

export class AttributeReference extends KmipChoiceAttributeReference<
  string,
  VendorAttributeReference,
  Tag
> {
  public equals(o: any): boolean {
    return super.equals(o)
  }

  public toString(): string {
    return super.toString()
  }
}
