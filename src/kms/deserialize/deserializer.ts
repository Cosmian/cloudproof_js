import { JsonObject } from "./JSON"

export function build_object_from_json(object: JsonObject): Object {
  const value: any = object.value
  const name: string = object.tag
  const type: string | undefined = object.type

  let newObject = {}
  let innerObject = {}

  if (object.type === "Structure") {
    // TTLV: Structure
    for (let i = 0; i < value.length; i++) {
      // build the child recursively
      const child = build_object_from_json(value[i])
      const childName = value[i].tag
      Reflect.set(
        innerObject,
        childName,
        child[childName as keyof typeof child] ? child[childName as keyof typeof child] : child
      )
      Reflect.defineMetadata("name", value[i].tag, innerObject, value[i].tag)
      Reflect.defineMetadata("type", value[i].type, innerObject, value[i].tag)
    }
    Reflect.defineMetadata("name", name, innerObject)
    Reflect.defineMetadata("type", type, innerObject)
    Object.assign(newObject, {
      [object.tag]: innerObject,
    })
    Reflect.defineMetadata("name", name, newObject)
    Reflect.defineMetadata("type", type, newObject)

    return newObject

  }
  if (object.type === "ByteString") {
    // TTLV: Byte String
    const valueToUIntArray = new Uint8Array(Buffer.from(value, "hex"))
    return valueToUIntArray
  }
  // TTLV: Other TTLV type
  return value

}
