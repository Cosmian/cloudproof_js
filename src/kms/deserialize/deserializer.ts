import { PropertyMetadata, METADATA_KEY } from "../decorators/interface";
import { TTLV } from "../serialize/Ttlv";
import { TtlvType } from "../serialize/TtlvType";
import { JsonObject } from "./JSON";

/**
 *
 * @param object
 */
export function build_object_from_json(object: JsonObject): Object {
  const value: any = object.value;
  const name: string = object.tag;
  const type: string | undefined = object.type;

  const newObject = {};
  const innerObject = {};

  if (object.type === "Structure") {
    // TTLV: Structure
    for (let i = 0; i < value.length; i++) {
      // build the child recursively
      const child = build_object_from_json(value[i]);
      const childName = value[i].tag;
      Reflect.set(
        innerObject,
        childName,
        child[childName as keyof typeof child]
          ? child[childName as keyof typeof child]
          : child
      );
      Reflect.defineMetadata("name", value[i].tag, innerObject, value[i].tag);
      Reflect.defineMetadata("type", value[i].type, innerObject, value[i].tag);
    }
    Reflect.defineMetadata("name", name, innerObject);
    Reflect.defineMetadata("type", type, innerObject);
    Object.assign(newObject, {
      [object.tag]: innerObject,
    });
    Reflect.defineMetadata("name", name, newObject);
    Reflect.defineMetadata("type", type, newObject);

    return newObject;
  }
  if (object.type === "ByteString") {
    // TTLV: Byte String
    const valueToUIntArray = new Uint8Array(Buffer.from(value, "hex"));
    return valueToUIntArray;
  }
  // TTLV: Other TTLV type
  return value;
}

export class FromTTLV {
  public static array<T extends Object>(
    propertyName: string,
    ttlv: TTLV,
    elementMetadata: PropertyMetadata
  ): T[] {
    // check TTLV type
    const ttlvType = ttlv.type;
    if (ttlvType && ttlvType !== TtlvType.Structure) {
      throw new Error(
        "Invalid type: " + ttlvType + " for structure " + ttlv.tag
      );
    }

    // check value is array
    if (ttlv.value.constructor.name !== "Array") {
      throw new Error(
        "Invalid value for structure " + ttlv.tag + ": it should be an array"
      );
    }

    const array: T[] = [];
    const ttlvValue = ttlv.value as TTLV[];
    for (const v of ttlvValue) {
      if (v.tag !== ttlv.tag) {
        throw new Error(
          "Invalid child with name" + v.tag + " in array of " + ttlv.tag
        );
      }
      array.push(this.parseValue(v, elementMetadata, propertyName));
    }
    return array;
  }

  private static parseValue(
    ttlv: TTLV,
    metadata: PropertyMetadata,
    propertyName: string
  ): any {
    // special case of Choices: the value is actually a structure
    // with the correct property set
    if (metadata.type === TtlvType.Choice) {
      const ttlvDe = metadata.from_ttlv;
      if (ttlvDe != null) {
        return ttlvDe(propertyName, ttlv);
      }
      throw new Error(
        "The child " +
          propertyName +
          " is a TTLV Choice but there is no deserializer in the Metadata"
      );
    }

    if (ttlv.type === TtlvType.BigInteger) {
      throw new Error(ttlv.type + " deserialization not yet implemented");
    } else if (ttlv.type === TtlvType.Boolean) {
      throw new Error(ttlv.type + " deserialization not yet implemented");
    } else if (ttlv.type === TtlvType.ByteString) {
      throw new Error(ttlv.type + " deserialization not yet implemented");
    } else if (ttlv.type === TtlvType.DateTime) {
      throw new Error(ttlv.type + " deserialization not yet implemented");
    } else if (ttlv.type === TtlvType.DateTimeExtended) {
      throw new Error(ttlv.type + " deserialization not yet implemented");
    } else if (ttlv.type === TtlvType.Enumeration) {
      if (metadata.isEnum != null) {
        return metadata.isEnum[ttlv.value as keyof typeof metadata.isEnum];
      }
      throw new Error(
        "The child " +
          propertyName +
          " is a TTLV Enumeration but there is no enum Metadata"
      );
    } else if (ttlv.type === TtlvType.Integer) {
      try {
        return parseInt(ttlv.value as string, 10);
      } catch (error) {
        throw new Error(
          "The child " +
            propertyName +
            " is a TTLV Integer but its value: " +
            ttlv.value +
            " cannot be parsed as an Integer"
        );
      }
    } else if (ttlv.type === TtlvType.Interval) {
      throw new Error(ttlv.type + " deserialization not yet implemented");
    } else if (ttlv.type === TtlvType.LongInteger) {
      throw new Error(ttlv.type + " deserialization not yet implemented");
    } else if (ttlv.type === TtlvType.Structure) {
      const ttlvDe = metadata.from_ttlv;
      if (ttlvDe != null) {
        return ttlvDe(propertyName, ttlv);
      }
      throw new Error(
        "The child " +
          propertyName +
          " is a TTLV Structure but there is no deserializer in the Metadata"
      );
    } else if (ttlv.type === TtlvType.TextString) {
      return ttlv.value;
    }
    throw new Error("Unknown TTLV Type: " + ttlv.type);
  }

  public static structure<T extends Object>(
    type: new (...args: any[]) => T,
    ...args: any[]
  ): (propertyName: string, ttlv: TTLV) => T {
    return (propertyName: string, ttlv: TTLV): T => {
      const instance = new type(args);

      // check names
      const expectedName = instance.constructor.name;
      const actualName = ttlv.tag;
      if (expectedName !== actualName) {
        throw new Error(
          "The expected structure name: " +
            expectedName +
            "in " +
            propertyName +
            ", does not match the actual name: " +
            actualName
        );
      }

      // check TTLV type
      const ttlvType = ttlv.type;
      if (ttlvType && ttlvType !== TtlvType.Structure) {
        throw new Error(
          "Invalid type: " +
            ttlvType +
            " for structure " +
            actualName +
            " in " +
            propertyName
        );
      }

      // check value is array
      if (ttlv.value.constructor.name !== "Array") {
        throw new Error(
          "Invalid value for structure " +
            actualName +
            "in " +
            propertyName +
            ": it should be an array"
        );
      }
      const ttlvValue = ttlv.value as TTLV[];

      // process the structure properties
      const propsMetadata = Reflect.getMetadata(METADATA_KEY, instance);
      for (const childPropertyName in propsMetadata) {
        const metadata: PropertyMetadata = propsMetadata[childPropertyName];
        const propTag = metadata.name;

        const child = ttlvValue.find((v) => v.tag === propTag);
        if (typeof child === "undefined") {
          continue;
        }
        // found a matching TTLV child
        const value = this.parseValue(child, metadata, childPropertyName);
        Reflect.set(instance, childPropertyName, value);
      }
      return instance;
    };
  }

  public static choice<T extends Object>(
    type: new (...args: any[]) => T,
    ...args: any[]
  ): (propertyName: string, ttlv: TTLV) => T {
    return (propertyName: string, ttlv: TTLV): T => {
      const instance = new type(args);

      // the type to find in the properties of the instance
      const ttlvType = ttlv.type;

      // fin the appropriate type in the properties
      const propsMetadata = Reflect.getMetadata(METADATA_KEY, instance);
      for (const childPropertyName in propsMetadata) {
        const metadata: PropertyMetadata = propsMetadata[childPropertyName];
        if (metadata.type === ttlvType) {
          // found it
          const value = this.parseValue(ttlv, metadata, childPropertyName);
          Reflect.set(instance, childPropertyName, value);
          return instance;
        }
      }
      throw new Error(
        "Choice of type" +
          ttlvType +
          " not found for object " +
          instance.constructor.name +
          " in " +
          propertyName
      );
    };
  }
}

// export function struct_from_ttlv<T extends Object>(type: { new(): T }, ttlv: object): T {
//   const instance = new type()
//   const expectedName = instance.constructor.name
//   const actualName = Reflect.get(ttlv, "tag")

//   console.log(expectedName, actualName)
//   const propsMetadata = Reflect.getMetadata(METADATA_KEY, instance)

//   for (const propertyName in propsMetadata) {
//     const propType = typeof instance[propertyName as keyof typeof instance]
//     console.log(type, propertyName, propType)

//   }

//   return instance
// }
