import { KmsObject } from '../structs/objects'

export class GetResponse {
    uniqueIdentifier: string
    object: KmsObject

    constructor(uniqueIdentifier: string, object: KmsObject) {
        this.uniqueIdentifier = uniqueIdentifier
        this.object = object
    }
}