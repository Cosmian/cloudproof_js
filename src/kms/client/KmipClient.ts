import { Policy } from "crypto/abe/interfaces/policy"
import { KeyBlock } from "kms/data_structures/KeyBlock"
import { KeyValue } from "kms/data_structures/KeyValue"
import { PlainTextKeyValue } from "kms/data_structures/PlainTextKeyValue"
import { TransparentSymmetricKey } from "kms/data_structures/TransparentSymmetricKey"
import { getObjectType, KmipObject } from "kms/objects/KmipObject"
import { SymmetricKey } from "kms/objects/SymmetricKey"
import { CreateKeyPair } from "kms/operations/CreateKeyPair"
import { CreateKeyPairResponse } from "kms/operations/CreateKeyPairResponse"
import { Destroy } from "kms/operations/Destroy"
import { DestroyResponse } from "kms/operations/DestroyResponse"
import { Get } from "kms/operations/Get"
import { GetResponse } from "kms/operations/GetResponse"
import { Import } from "kms/operations/Import"
import { ImportResponse } from "kms/operations/ImportResponse"
import { Revoke } from "kms/operations/Revoke"
import { RevokeResponse } from "kms/operations/RevokeResponse"
import { RevocationReason } from "kms/types/RevocationReason"
import { fromTTLV } from "../deserialize/deserializer"
import { Create } from "../operations/Create"
import { CreateResponse } from "../operations/CreateResponse"
import { toTTLV } from "../serialize/serializer"
import { Attributes } from "../types/Attributes"
import { CryptographicAlgorithm } from "../types/CryptographicAlgorithm"
import { KeyFormatType } from "../types/KeyFormatType"
import { Link } from "../types/Link"
import { ObjectType } from "../types/ObjectType"

export class KmipClient {

    private readonly url: URL

    private readonly headers: HeadersInit


    /**
     * Instantiate a KMS Client
     * 
     * @param {URL} url of the KMS server
     * @param {string} apiKey optional, to authenticate to the KMS server
     */
    constructor(url: URL, apiKey?: string) {
        this.url = url
        this.headers = {
            "Content-Type": "application/json; charset=utf-8",
        }
        if (typeof apiKey !== "undefined") {
            this.headers = Object.assign(this.headers, { "Authorization": `Bearer ${apiKey}` })
        }
    }

    /**
     * Execute a KMIP request and get a response
     * It is easier and safer to use the specialized methods of this class, for each crypto system 
     * 
     * @param {object} payload a valid KMIP operation
     * @param {Function} responseClass the class of the expected KMIP response
     * @returns {object} an instance of the KMIP response
     */
    public async post<P extends Object, R extends Object>(payload: P, responseClass: new (...args: any[]) => R): Promise<R> {
        const ttlv = toTTLV(payload)
        console.log("TTLV REQUEST", JSON.stringify(ttlv, null, 4))
        const options: RequestInit = {
            method: "POST",
            body: JSON.stringify(ttlv),
            headers: this.headers
        }
        const response = await fetch(this.url, options)
        if (response.status >= 400) {
            throw new Error(`KMIP request failed: ${await response.text()}`)
        }
        const content = await response.json()
        console.log("TTLV RESPONSE", JSON.stringify(content, null, 4))
        return fromTTLV(responseClass, content)
    }

    /**
     * Tests whether the KMS server is responding 
     * 
     * @returns {boolean} true if up
     */
    public async up(): Promise<boolean> {
        const options: RequestInit = {
            method: "GET",
            headers: this.headers
        }
        try {
            await fetch(this.url, options)
            return true
        } catch (error) {
            return false
        }
    }

    /**
     * Retrieve a KMIP Object from the KMS
     * 
     * @param {string} uniqueIdentifier the unique identifier of the object
     * @returns {object} an instance of the KMIP Object
     */
    public async getObject<T>(uniqueIdentifier: string): Promise<T> {
        const get = new Get(uniqueIdentifier)
        const response = await this.post(get, GetResponse)
        return response.object as T
    }


    /**
     * Import a KMIP Object inside the KMS
     * 
     * @param {string} uniqueIdentifier the Object unique identifier in the KMS
     * @param {Attributes} attributes the indexed attribues of the Object
     * @param {KmipObject} object the KMIP Object instance
     * @param {boolean} replaceExisting replace an instance under the same identifier if true
     * @returns {string} the unique identifier
     */
    public async importObject<T>(
        uniqueIdentifier: string,
        attributes: Attributes,
        object: KmipObject,
        replaceExisting?: boolean,
    ): Promise<T> {
        if (attributes.objectType !== getObjectType(object)) {
            throw new Error(`Import: invalid object type ${attributes.objectType} for object of type ${getObjectType(object)}`)
        }
        const imp = new Import(uniqueIdentifier, attributes.objectType, attributes, object)
        const response = await this.post(imp, ImportResponse)
        return response.uniqueIdentifier as T
    }


    /**
     * Revoke a KMIP Object in the KMS
     * 
     * @param {string} uniqueIdentifier the unique identifier of the object
     * @param {string} reason the explanation of the revocation
     */
    public async revokeObject(uniqueIdentifier: string, reason: string): Promise<void> {
        const get = new Revoke(uniqueIdentifier, new RevocationReason(reason))
        await this.post(get, RevokeResponse)
    }


    /**
     * Destroy a KMIP Object in the KMS
     * 
     * @param {string} uniqueIdentifier the unique identifier of the object
     */
    public async destroyObject(uniqueIdentifier: string): Promise<void> {
        const get = new Destroy(uniqueIdentifier)
        await this.post(get, DestroyResponse)
    }


    /**
     * Create a symmetric key
     * 
     * @param {SymmetricKeyAlgorithm} algorithm defaults to AES
     * @param {number} bits number of bits of the key, defaults to 256
     * @param {Link[]} links potential links to other keys
     * @returns {string} the unique identifier of the created key
     */
    public async createSymmetricKey(algorithm?: SymmetricKeyAlgorithm, bits?: number, links?: Link[]): Promise<string> {
        let algo = CryptographicAlgorithm.AES
        if (algorithm === SymmetricKeyAlgorithm.ChaCha20) {
            algo = CryptographicAlgorithm.ChaCha20
        }
        const create = new Create(
            ObjectType.SymmetricKey,
            new Attributes(
                ObjectType.SymmetricKey,
                links,
                undefined,
                undefined,
                algo,
                bits,
                undefined,
                undefined,
                undefined,
                KeyFormatType.TransparentSymmetricKey
            )
        )
        const response = await this.post(create, CreateResponse)
        return response.uniqueIdentifier
    }

    /**
     * Import a symmetric key into the KMS
     * 
     * @param {string} uniqueIdentifier  the unique identifier of the key
     * @param {Uint8Array} keyBytes the bytes of the key
     * @param {boolean} replaceExisting set to true to replace an existing key with the same identifier
     * @param  {CryptographicAlgorithm} algorithm the intended algorithm, defaults to AES
     * @param {Link[]} links links to other KMIP Objects
     * @returns {string} the unique identifier of the key
     */
    public async importSymmetricKey(uniqueIdentifier: string, keyBytes: Uint8Array, replaceExisting?: boolean, algorithm?: SymmetricKeyAlgorithm, links?: Link[]): Promise<string> {
        let algo = CryptographicAlgorithm.AES
        if (algorithm === SymmetricKeyAlgorithm.ChaCha20) {
            algo = CryptographicAlgorithm.ChaCha20
        }
        const attributes = new Attributes(
            ObjectType.SymmetricKey,
            links,
            undefined,
            undefined,
            algo,
            keyBytes.length * 8,
            undefined,
            undefined,
            undefined,
            KeyFormatType.TransparentSymmetricKey
        )
        const symmetricKey = new SymmetricKey(
            new KeyBlock(
                KeyFormatType.TransparentSymmetricKey,
                new KeyValue(
                    undefined,
                    new PlainTextKeyValue(
                        KeyFormatType.TransparentSymmetricKey,
                        new TransparentSymmetricKey(keyBytes),
                        attributes
                    )
                )
            )
        )
        return await this.importObject(uniqueIdentifier, attributes, symmetricKey, replaceExisting)
    }


    /**
     *  Retrieve a symmetric key
     * 
     *  Use {SymmetricKey.keyBytes()} to recover the bytes
     * 
     * @param {string} uniqueIdentifier the Object unique identifier in the KMS
     * @returns {SymmetricKey} the KMIP symmetric Key
     */
    public async getSymmetricKey(uniqueIdentifier: string): Promise<SymmetricKey> {
        return await this.getObject(uniqueIdentifier)
    }

    /**
     * Mark a KMIP Symmetric Key as Revoked
     * 
     * @param {string} uniqueIdentifier the unique identifier of the object
     * @param {string} reason the explanation of the revocation
     */
    public async revokeSymmetricKey(uniqueIdentifier: string, reason: string): Promise<void> {
        return await this.revokeObject(uniqueIdentifier, reason)
    }


    /**
     *  Mark a symmetric key as destroyed
     * 
     * @param {string} uniqueIdentifier the Object unique identifier in the KMS
     * @returns {string} the unique identifier of the symmetric Key
     */
    public async destroySymmetricKey(uniqueIdentifier: string): Promise<void> {
        return await this.destroyObject(uniqueIdentifier)
    }

    public async createAbeMasterKeyPair(policy: Policy): Promise<string[]> {
        const commonAttributes = new Attributes(ObjectType.PrivateKey)
        commonAttributes.cryptographicAlgorithm = CryptographicAlgorithm.CoverCrypt
        commonAttributes.keyFormatType = KeyFormatType.CoverCryptSecretKey
        commonAttributes.vendorAttributes = [policy.toVendorAttribute()]

        const response = await this.post(new CreateKeyPair(commonAttributes), CreateKeyPairResponse)
        return [response.privateKeyUniqueIdentifier, response.publicKeyUniqueIdentifier]
    }
}

export enum SymmetricKeyAlgorithm {
    AES,
    ChaCha20
}

