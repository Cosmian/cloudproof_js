import { TTLV } from "./Ttlv"
import "reflect-metadata"
import { METADATA_KEY } from "../decorators/interface"
import { TtlvType } from "./TtlvType"
import { build_object_from_json } from "../deserialize/deserializer"
import { Interval } from "./Interval"
import { DateTimeExtended } from "./DateTimeExtended"
import { LongInt } from "./LongInt"
import { CryptographicAlgorithm } from "../types/CryptographicAlgorithm"
import { KeyFormatType } from "../types/KeyFormatType"
import { Create } from "../operations/Create"
import { Attributes } from "../types/Attributes"
import { Link } from "../types/Link"
import { LinkedObjectIdentifier } from "../types/LinkedObjectIdentifier"
import { LinkType } from "../types/LinkType"
import { ObjectType } from "../types/ObjectType"

/**
 * Convert the JSON representation of a TTLV back into a TTLV object
 * @param value the Json representation
 * @returns a TTLV
 */
export function to_ttlv(value: Object): TTLV {

  // The JSON representation of a TTLV 
  // is always a dictionary or an array

  if (typeof value !== "object") {
    throw "Unknown type"
  }

  if (value.constructor.name === "Array") {
    return processArray(value as any[])
  }

  return processDictionary(value)
}


function processDictionary(value: Object): TTLV {

  const metadata = Reflect.getMetadata(METADATA_KEY, value)

  //process all object properties as new TTLVs
  let children: TTLV[] = parseChildren(metadata, value)

  // Determine whether this value is a structure
  if (
    value.constructor.name != "Object" &&
    value.constructor.name != "Uint8Array" &&
    value.constructor.name != "Date" &&
    value.constructor.name != "LongInt" &&
    value.constructor.name != "Interval" &&
    value.constructor.name != "DateTimeExtended"
  ) {
    return new TTLV(value.constructor.name, TtlvType.Structure, children)
  }

  // Determine whether this value is NOT an array
  if (Reflect.getMetadata("name", value) != children[0].tag) {
    return new TTLV(
      Reflect.getMetadata("name", value),
      Reflect.getMetadata("type", value),
      children
    )
  }

  // This value is an element of array - the tag and the type are identical on all children 
  // are actually the one of the main value
  return new TTLV(children[0].tag, children[0].type, children[0].value)
}


function processArray(value: any[]): TTLV {
  const metadata = Reflect.getMetadata(METADATA_KEY, value[0])

  let children: TTLV[] = parseChildren(metadata, value[0])

  if (
    value[0].constructor.name != "Object" &&
    value[0].constructor.name != "Uint8Array" &&
    value[0].constructor.name != "Date" &&
    value[0].constructor.name != "LongInt" &&
    value[0].constructor.name != "Interval" &&
    value[0].constructor.name != "DateTimeExtended"
  ) {
    return new TTLV(value[0].constructor.name, TtlvType.Structure, children)
  }

  if (Reflect.getMetadata("name", value) != children[0].tag) {
    return new TTLV(
      Reflect.getMetadata("name", value),
      Reflect.getMetadata("type", value),
      children
    )
  }

  return new TTLV(children[0].tag, children[0].type, children[0].value)
}


function parseChildren(metadata: any, value: Object): TTLV[] {
  let children: TTLV[] = []
  for (let pn of Object.getOwnPropertyNames(value)) {
    const propertyName = pn as keyof typeof value

    let childValue = Reflect.get(value, propertyName)
    if (typeof childValue === "undefined") {
      // skip processing  an undefine value
      continue
    }
    let { childName, childType } = childNameAndType(metadata, propertyName, value)

    if (childType === "Structure") {
      // it is a structure, recursively process the child
      const innerTtlvArray = to_ttlv(Reflect.get(value, propertyName))
      console.log(innerTtlvArray)
      children.push(innerTtlvArray)
      continue
    }

    if (childType === "Enumeration") {
      if (metadata) {
        childValue = metadata[propertyName].isEnum[childValue]
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

function childNameAndType<T extends Object>(metadata: any, propertyName: keyof T, value: T): { childName: string, childType: TtlvType } {
  if (metadata) {
    return { childName: metadata[propertyName].name, childType: metadata[propertyName].type }
  }
  if (typeof value[propertyName] === "object") {
    const child: Object = value[propertyName]
    const constructor = child.constructor
    if (
      constructor != Uint8Array &&
      constructor != Date &&
      constructor != LongInt &&
      constructor != Interval &&
      constructor != DateTimeExtended) {
      return {
        childName: Reflect.getMetadata("name", child),
        childType: Reflect.getMetadata("type", child)
      }
    }
  }
  if (typeof propertyName === "number") {
    throw Error("Arrays should not be processed here")
  }
  return { childName: Reflect.getMetadata("name", value, propertyName), childType: Reflect.getMetadata("type", value, propertyName) }
}



