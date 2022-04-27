import { TTLV } from "./Ttlv"
import "reflect-metadata"
import { METADATA_KEY, ISinglePropertyMetadata } from "../decorators/interface"
import { TtlvType } from "./TtlvType"


/**
 * Convert the JSON representation of a TTLV back into a TTLV object
 * @param value the Json representation
 * @returns a TTLV
 */
export function to_ttlv(value: Object): TTLV {
  return to_ttlv_inner(value, {
    name: value.constructor.name,
    type: TtlvType.Structure
  })
}
function to_ttlv_inner(value: Object, metadata: ISinglePropertyMetadata): TTLV {


  console.log("Value metadata", metadata)

  // the meta data of the object describes its properties/children
  // const metadata = Reflect.getMetadata(METADATA_KEY, value)


  // The JSON representation of a TTLV 
  // is always a dictionary or an array

  if (typeof value !== "object") {
    throw "Unknown type"
  }

  if (value.constructor.name === "Array") {
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

  return processDictionary(value, metadata)
}


function processDictionary(value: Object, value_metadata: ISinglePropertyMetadata): TTLV {

  //process all object properties as new TTLVs
  let children: TTLV[] = parseChildren(value)

  let name: string = Reflect.get(value_metadata, "name")
  let type: TtlvType = Reflect.get(value_metadata, "type")

  return new TTLV(name, type, children)


  // // Determine whether this value is a structure
  // if (
  //   value.constructor.name != "Object" &&
  //   value.constructor.name != "Uint8Array" &&
  //   value.constructor.name != "Date" &&
  //   value.constructor.name != "LongInt" &&
  //   value.constructor.name != "Interval" &&
  //   value.constructor.name != "DateTimeExtended"
  // ) {
  //   return new TTLV(value.constructor.name, TtlvType.Structure, children)
  // }

  // // Determine whether this value is NOT an array
  // if (Reflect.getMetadata("name", value) != children[0].tag) {
  //   return new TTLV(
  //     Reflect.getMetadata("name", value),
  //     Reflect.getMetadata("type", value),
  //     children
  //   )
  // }

  // // This value is an element of array - the tag and the type are identical on all children 
  // // are actually the one of the main value
  // return new TTLV(children[0].tag, children[0].type, children[0].value)
}


function parseChildren(value: Object): TTLV[] {

  const childrenMetadata: { [propertyName: string]: ISinglePropertyMetadata } = Reflect.getMetadata(METADATA_KEY, value)

  let children: TTLV[] = []
  for (let pn of Object.getOwnPropertyNames(value)) {
    const propertyName = pn as keyof typeof value

    let childValue = Reflect.get(value, propertyName)
    if (typeof childValue === "undefined") {
      // skip processing  an undefine value
      continue
    }
    let childMetadata: ISinglePropertyMetadata = childrenMetadata[propertyName]
    if (!childMetadata) {
      console.error("Child Metadata is not defined for " + propertyName + " in ", childrenMetadata)
      throw new Error("Child Metadata is not defined for " + propertyName)

    }
    let childName = childMetadata.name
    let childType = childMetadata.type

    if (childType === "Structure") {
      // it is a structure, recursively process the child
      const child = to_ttlv_inner(
        childValue,
        childMetadata
      )
      children.push(child)
      continue
    }

    if (childType === "Enumeration") {
      if (childrenMetadata) {
        childValue = (childrenMetadata[propertyName] as any).isEnum[childValue]
      } else {
        childValue = value[propertyName]
      }
    }

    if (childType === "ByteString") {
      childValue = Buffer.from(childValue).toString("hex")
    }

    if (childType === "DateTimeExtended") {
      childValue = childValue.extendedDate
    }

    if (childType === "Interval") {
      childValue = childValue.timeInMilliSeconds
    }

    if (childType === "DateTime") {
      childValue = childValue.DateTime
    }

    if (childType === "LongInteger") {
      childValue = childValue.bytes
    }

    children.push(new TTLV(childName, childType, childValue))
  }
  return children
}

// function childNameAndType<T extends Object>(metadata: ISinglePropertyMetadata, propertyName: keyof ISinglePropertyMetadata, value: T): { childName: string, childType: TtlvType } {
//   if (metadata) {
//     return { childName: metadata[propertyName].name, childType: metadata[propertyName].type }
//   }
//   console.error("THERE SHOULD BE METADATA", value)
//   throw new Error("THERE SHOULD BE METADATA")


  // if (typeof value[propertyName] === "object") {
  //   const child: Object = value[propertyName]
  //   const constructor = child.constructor
  //   if (
  //     constructor != Uint8Array &&
  //     constructor != Date &&
  //     constructor != LongInt &&
  //     constructor != Interval &&
  //     constructor != DateTimeExtended) {
  //     return {
  //       childName: Reflect.getMetadata("name", child),
  //       childType: Reflect.getMetadata("type", child)
  //     }
  //   }
  // }
  // if (typeof propertyName === "number") {
  //   throw Error("Arrays should not be processed here")
  // }
  // return { childName: Reflect.getMetadata("name", value, propertyName), childType: Reflect.getMetadata("type", value, propertyName) }
// }



