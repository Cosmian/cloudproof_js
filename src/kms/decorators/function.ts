import { PropertyMetadata, METADATA_KEY } from "./interface";
import "reflect-metadata";

/**
 *
 * @param updates
 */
export function PropertyMetadata(updates: PropertyMetadata) {
  return (target: any, propertyKey: string | symbol) => {
    // Pull the existing metadata or create an empty object
    const allMetadata = Reflect.getMetadata(METADATA_KEY, target) || {};
    // Ensure allMetadata has propertyKey
    allMetadata[propertyKey] = allMetadata[propertyKey] || {};
    // Update the metadata with anything from updates
    for (const key of Reflect.ownKeys(updates)) {
      allMetadata[propertyKey][key] = updates[key as keyof typeof updates];
    }
    // Update the metadata
    Reflect.defineMetadata(METADATA_KEY, allMetadata, target);
  };
}
