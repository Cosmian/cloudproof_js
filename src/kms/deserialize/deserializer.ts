import { hexDecode } from "utils/utils"
import { PropertyMetadata, METADATA_KEY } from "../decorators/interface"
import { TTLV } from "../serialize/Ttlv"
import { TtlvType } from "../serialize/TtlvType"

/**
 * A general factory to construct a type
 * 
 * @param {object} ConstructibleType a type that has a constructor (a new function)
 * @param {any[]} args to be passed during construction
 * @returns {object} an instance of the type
 */
function factory<T>(
  ConstructibleType: new (...args: any[]) => T,
  ...args: any[]
): T {
  return new ConstructibleType(...args)
}


/**
 * Build a KMIP object from its constructible type and 
 * TTLV representation
 * 
 * @param {object} ConstructibleType  the type
 * @param {TTLV} ttlv he TTLV to parse from
 * @returns {object} the object instance
 */
export function fromTTLV<T extends Object>(
  ConstructibleType: new (...args: any[]) => T,
  ttlv: TTLV
): T {
  // parse the TTLV from JSON
  const instance: T = factory<T>(ConstructibleType)

  // Parse using the default serialization for a structure
  return structureParser(instance, ttlv, "ROOT")
}


/**
 * Fills the passed KMIP Structure instance with the parsed properties of the TTLV
 * using a custom parser if the Structure implements Deserializable, the default parser otherwise
 * 
 * @param {object} instance a KMIP Structure instance
 * @param {TTLV } ttlv Structure to extract properties from
 * @param {string} propertyName the name of the property of the parent structure (if any)
 * @returns {object} the updated instance
 */
function structureParser<T extends Object>(instance: T, ttlv: TTLV, propertyName: string): T {

  // check names
  const instanceName = instance.constructor.name
  const tagName = ttlv.tag
  if (instanceName !== tagName) {
    throw new Error(
      `Deserializer: the instance name: ${instanceName}` +
      ` does not match the TTLV tag name: ${tagName}` +
      ` in ${propertyName}`
    )
  }

  // try to sse if the type implement Deserializable.fromTTLV
  // in which case, use that
  const fromTTLV = Reflect.get(instance, "fromTTLV")
  if (typeof fromTTLV !== "undefined") {
    return Reflect.apply(fromTTLV, instance, [ttlv, propertyName])
  }

  // use the default parser
  return defaultStructureParser(instance, ttlv, propertyName)
}

/**
 * Fills the passed KMIP Structure instance with the parsed properties of the TTLV
 * Using the default parser
 * 
 * @param {object} instance a KMIP Structure instance
 * @param {TTLV } ttlv Structure to extract properties from
 * @param {string} propertyName the name of the property of the parent structure (if any)
 * @returns {object} the updated instance
 */
export function defaultStructureParser<T extends Object>(instance: T, ttlv: TTLV, propertyName: string): T {

  const tagName = ttlv.tag

  // check TTLV type
  if (typeof ttlv.type === "undefined" || ttlv.type == null) {
    throw new Error(
      `Deserializer: no valid type in the TTLV ` +
      ` for structure: ${tagName}` +
      ` in ${propertyName}`
    )
  }
  const ttlvType = ttlv.type
  if (ttlvType !== TtlvType.Structure) {
    throw new Error(
      `Deserializer: invalid type: ${ttlvType}` +
      ` for structure ${tagName}` +
      ` in ${propertyName}`
    )
  }

  // check TTLV value
  if (typeof ttlv.value === "undefined" || ttlv.value == null) {
    throw new Error(
      `Deserializer: no valid value in the TTLV ` +
      ` for structure: ${tagName}` +
      ` in ${propertyName}`
    )
  }
  if (ttlv.value.constructor.name !== "Array") {
    throw new Error(
      `Deserializer: the value should be an array in the TTLV ` +
      ` for structure: ${tagName}` +
      ` in ${propertyName}`
    )
  }
  const ttlvValue = ttlv.value as TTLV[]

  // recover the metadata
  const metadata = Reflect.getMetadata(METADATA_KEY, instance)
  if (typeof metadata === "undefined") {
    throw new Error(
      `Deserializer: metadata is not defined ` +
      ` for structure: ${tagName}` +
      ` in ${propertyName}`
    )
  }

  // process the structure properties
  for (const propertyName of Object.getOwnPropertyNames(metadata)) {
    const childMetadata: PropertyMetadata = metadata[propertyName]
    const ttlvTag = childMetadata.name

    const child = ttlvValue.find((v) => v.tag === ttlvTag)
    if (typeof child === "undefined") {
      // skip the properties which are not found
      // TODO check if mandatory
      continue
    }
    // found a matching TTLV child
    const value = valueParser(child, childMetadata, propertyName)
    Reflect.set(instance, propertyName, value)
  }
  return instance
}

/**
 * Fills the passed KMIP Choice instance with the parsed properties of the TTLV
 * 
 * @param {object} instance a KMIP Choice instance
 * @param {TTLV } ttlv Choice to extract properties from
 * @param {string} propertyName the name of the property of the parent structure (if any)
 * @returns {object} the updated instance
 */
function choiceParser<T extends Object>(instance: T, ttlv: TTLV, propertyName: string): T {

  // the type to find in the properties of the instance
  const ttlvType = ttlv.type
  // check TTLV type
  if (typeof ttlv.type === "undefined" || ttlv.type == null) {
    throw new Error(
      `Deserializer: no valid type in the TTLV ` +
      ` for choice` +
      ` in ${propertyName}`
    )
  }

  // find the appropriate type in the properties
  const propsMetadata = Reflect.getMetadata(METADATA_KEY, instance)
  for (const childPropertyName in propsMetadata) {
    const metadata: PropertyMetadata = propsMetadata[childPropertyName]
    if (metadata.type === ttlvType) {
      // found it
      const value = valueParser(ttlv, metadata, childPropertyName)
      Reflect.set(instance, childPropertyName, value)
      return instance
    }
  }
  throw new Error(
    `Deserializer: choice of type ${ttlvType} not found` +
    `for object ${instance.constructor.name}` +
    ` in ${propertyName}`
  )
}

/**
 * Create an Array of Structures from the given TTLV
 * 
 * @param {TTLV} ttlv the Structures Array to extract the structures from
 * @param {PropertyMetadata} metadata the metadata of the Structures Array
 * @param {string} propertyName the name of the property of the parent structure (if any)
 * @returns {object} the updated instance
 */
function arrayParser<T extends Object>(
  ttlv: TTLV,
  metadata: PropertyMetadata,
  propertyName: string,
): T[] {

  // check TTLV type
  const ttlvType = ttlv.type
  // check TTLV type
  if (typeof ttlv.type === "undefined" || ttlv.type == null) {
    throw new Error(
      `Deserializer: no valid type in the TTLV ` +
      ` for array ${metadata.name}` +
      ` in ${propertyName}`
    )
  }
  if (ttlvType !== TtlvType.Structure) {
    throw new Error(
      `Deserializer: invalid type: ${ttlvType}` +
      ` for array ${metadata.name}` +
      ` in ${propertyName}`
    )
  }

  // check value is array
  if (ttlv.value.constructor.name !== "Array") {
    throw new Error(
      `Deserializer: invalid value for structure ${ttlv.tag}: it should be an array` +
      ` in ${propertyName}`
    )
  }

  const array: T[] = []
  const ttlvValue = ttlv.value as TTLV[]
  for (const v of ttlvValue) {
    if (v.tag !== ttlv.tag) {
      throw new Error(
        `Deserializer: invalid child with name ${v.tag} for array of ${ttlv.tag}` +
        ` in ${propertyName}`
      )
    }
    // Set the metadata of children to be structures
    const childMetadata = Object.assign({}, metadata, { type: TtlvType.Structure })
    array.push(valueParser(v, childMetadata, propertyName))
  }
  return array
}

/**
 * Parses the Value of a KMIP TTLV, returning the instantiated KMIP object
 * 
 * @param {TTLV} ttlv the TTLV to extract the value from
 * @param {PropertyMetadata} metadata the metadata of the TTLV
 * @param {string} propertyName the name of the property of the parent structure (if any)
 * @returns {object} the KMIP object instance
 */
function valueParser(
  ttlv: TTLV,
  metadata: PropertyMetadata,
  propertyName: string
): any {

  // if there is a custom parser implemented, use that
  if (typeof metadata.fromTtlv !== "undefined") {
    return metadata.fromTtlv(
      propertyName,
      ttlv
    )
  }

  if (typeof metadata.type === "undefined" || metadata.type === null) {
    throw new Error(
      `Deserializer: no valid type in the TTLV ` +
      ` for element: ${ttlv.tag}` +
      ` in ${propertyName}`
    )
  }
  const ttlvType: TtlvType = metadata.type

  if (ttlvType === TtlvType.Structure) {
    const constructible = metadata.classOrEnum
    if (typeof constructible === "undefined" || constructible === null) {
      throw new Error(
        `Deserializer: the class must be specified in the metadata for a structure ` +
        ` for element: ${ttlv.tag}` +
        ` in ${propertyName}`
      )
    }
    const instance: Object = factory(constructible)
    return structureParser(instance, ttlv, propertyName)
  }

  if (ttlvType === TtlvType.StructuresArray) {
    return arrayParser(ttlv, metadata, propertyName)
  }

  // special case of Choices: the value is actually a structure
  // with the correct property set
  if (ttlvType === TtlvType.Choice) {
    const constructible = metadata.classOrEnum
    if (typeof constructible === "undefined" || constructible === null) {
      throw new Error(
        `Deserializer: the class must be specified in the metadata for a choice ` +
        ` for element: ${ttlv.tag}` +
        ` in ${propertyName}`
      )
    }
    const instance: Object = factory(constructible)
    return choiceParser(instance, ttlv, propertyName)
  }

  if (ttlvType === TtlvType.Enumeration) {
    const anEnum = metadata.classOrEnum
    if (typeof anEnum === "undefined" || anEnum === null) {
      throw new Error(
        `Deserializer: the enum must be specified in the metadata for a structure ` +
        ` for element: ${ttlv.tag}` +
        ` in ${propertyName}`
      )
    }
    return anEnum[ttlv.value as keyof typeof anEnum]
  }

  if (ttlvType === TtlvType.Integer) {
    try {
      return parseInt(ttlv.value as string, 10)
    } catch (error) {
      throw new Error(`Deserializer: the child ${propertyName} is a TTLV Integer but its value cannot be parsed as an Integer`)
    }
  }

  if (ttlvType === TtlvType.TextString) {
    return ttlv.value
  }

  if (ttlvType === TtlvType.ByteString) {
    console.log("HEX", propertyName, ttlv.value)
    return hexDecode(ttlv.value as string)
  }

  if (ttlvType === TtlvType.BigInteger) {
    throw new Error(`Deserializer: automatic deserialization of ${ttlvType} not supported yet`)
  }
  if (ttlvType === TtlvType.Boolean) {
    throw new Error(`Deserializer: automatic deserialization of ${ttlvType} not supported yet`)
  }
  if (ttlvType === TtlvType.DateTime) {
    throw new Error(`Deserializer: automatic deserialization of ${ttlvType} not supported yet`)
  }
  if (ttlvType === TtlvType.DateTimeExtended) {
    throw new Error(`Deserializer: automatic deserialization of ${ttlvType} not supported yet`)
  }
  if (ttlvType === TtlvType.Interval) {
    throw new Error(`Deserializer: automatic deserialization of ${ttlvType} not supported yet`)
  }
  if (ttlvType === TtlvType.LongInteger) {
    throw new Error(`Deserializer: automatic deserialization of ${ttlvType} not supported yet`)
  }
  // This line should never be reached but is a guard against adding a type
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Deserializer: unknown TTLV Type: ${ttlvType}`)
}

