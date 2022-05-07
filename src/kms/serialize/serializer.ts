import { TTLV } from "./Ttlv"
import "reflect-metadata"
import { METADATA_KEY, PropertyMetadata } from "../decorators/interface"
import { TtlvType } from "./TtlvType"


/**
 * Convert the JSON representation of a TTLV back into a TTLV object
 * @param value the Json representation
 * @returns a TTLV
 */
export function to_ttlv(value: Object): TTLV {
  // there is no metadata available for the top level object
  // so we use the class name as name.
  // The top level object is always a structure
  return to_ttlv_inner(value, {
    name: value.constructor.name,
    type: TtlvType.Structure
  })
}
function to_ttlv_inner(value: Object, metadata: PropertyMetadata): TTLV {

  // The JSON representation of a TTLV 
  // is always a dictionary or an array

  if (typeof value !== "object") {
    throw "Unknown type '" + (typeof value) + "' for value: " + JSON.stringify(value, null, 2)
  }

  if (value.constructor.name === "Array") {
    return processArray(value, metadata)
  }

  return processDictionary(value, metadata)
}

function processArray(value: Object, metadata: PropertyMetadata): TTLV {
  let array = value as Object[]
  let children: TTLV[] = []
  for (let child of array) {
    // same metadata for all children of the array which are all of the same type
    children.push(to_ttlv_inner(child, metadata))
  }
  return new TTLV(
    // there should always be meta data descriptions for arrays
    Reflect.get(metadata, "name") as string,
    TtlvType.Structure,
    children)
}


function processDictionary(value: Object, metadata: PropertyMetadata): TTLV {

  //process all object properties as new TTLVs
  let children: TTLV[] = parseChildren(value)

  let name: string = Reflect.get(metadata, "name")
  let type: TtlvType = Reflect.get(metadata, "type")

  // handle the special case of Choices: there is only
  // one child which name is identical to that of the parent
  // We need to flatten that to the type of the child
  // Exemple: LinkedObjectIdentifier
  if (type === TtlvType.Choice) {
    console.log("FOUND A CHOICE ", children)
    return children[0]
  }

  return new TTLV(name, type, children)
}


function parseChildren(value: Object): TTLV[] {

  const childrenMetadata: { [propertyName: string]: PropertyMetadata } = Reflect.getMetadata(METADATA_KEY, value)

  let children: TTLV[] = []
  for (let pn of Object.getOwnPropertyNames(value)) {
    const propertyName = pn as keyof typeof value

    let childValue = Reflect.get(value, propertyName)
    if (typeof childValue === "undefined") {
      // skip processing  an undefine value
      continue
    }
    let childMetadata: PropertyMetadata = childrenMetadata[propertyName]
    if (!childMetadata) {
      console.error("Child Metadata is not defined for " + propertyName + " in ", childrenMetadata)
      throw new Error("Child Metadata is not defined for " + propertyName)

    }
    let childName = childMetadata.name
    let childType = childMetadata.type

    if (childType === TtlvType.Structure || childType === TtlvType.Choice) {
      // it is a structure, recursively process the child
      const child = to_ttlv_inner(
        childValue,
        childMetadata
      )
      children.push(child)
      continue
    }

    if (childType === TtlvType.Enumeration) {
      if (childrenMetadata) {
        childValue = (childrenMetadata[propertyName] as any).isEnum[childValue]
      } else {
        childValue = value[propertyName]
      }
    }

    if (childType === TtlvType.ByteString) {
      childValue = Buffer.from(childValue).toString("hex")
    }

    if (childType === TtlvType.DateTimeExtended) {
      childValue = childValue.extendedDate
    }

    if (childType === TtlvType.Interval) {
      childValue = childValue.timeInMilliSeconds
    }

    if (childType === TtlvType.DateTime) {
      childValue = childValue.DateTime
    }

    if (childType === TtlvType.LongInteger) {
      childValue = childValue.bytes
    }

    children.push(new TTLV(childName, childType, childValue))
  }
  return children
}
