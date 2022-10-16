import { AccessPolicy } from "crypto/abe/interfaces/access_policy"
import { Policy } from "crypto/abe/interfaces/policy"
import { KeyBlock } from "kms/data_structures/KeyBlock"
import { KeyValue } from "kms/data_structures/KeyValue"
import { PlainTextKeyValue } from "kms/data_structures/PlainTextKeyValue"
import { TransparentSymmetricKey } from "kms/data_structures/TransparentSymmetricKey"
import { getObjectType, KmipObject } from "kms/objects/KmipObject"
import { PrivateKey } from "kms/objects/PrivateKey"
import { PublicKey } from "kms/objects/PublicKey"
import { SymmetricKey } from "kms/objects/SymmetricKey"
import { CreateKeyPair } from "kms/operations/CreateKeyPair"
import { CreateKeyPairResponse } from "kms/operations/CreateKeyPairResponse"
import { Destroy } from "kms/operations/Destroy"
import { DestroyResponse } from "kms/operations/DestroyResponse"
import { Get } from "kms/operations/Get"
import { GetResponse } from "kms/operations/GetResponse"
import { Import } from "kms/operations/Import"
import { ImportResponse } from "kms/operations/ImportResponse"
import { ReKeyKeyPair } from "kms/operations/ReKeyKeyPair"
import { ReKeyKeyPairResponse } from "kms/operations/ReKeyKeyPairResponse"
import { Revoke } from "kms/operations/Revoke"
import { RevokeResponse } from "kms/operations/RevokeResponse"
import { TTLV } from "kms/serialize/Ttlv"
import { CryptographicUsageMask } from "kms/types/CryptographicUsageMask"
import { LinkedObjectIdentifier } from "kms/types/LinkedObjectIdentifier"
import { LinkType } from "kms/types/LinkType"
import { RevocationReason } from "kms/types/RevocationReason"
import { VendorAttribute } from "kms/types/VendorAttribute"
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
        const ttlvRequest = toTTLV(payload)
        const options: RequestInit = {
            method: "POST",
            body: JSON.stringify(ttlvRequest),
            headers: this.headers
        }
        const response = await fetch((this.url as any), options)
        if (response.status >= 400) {
            throw new Error(`KMIP request failed: ${await response.text()}`)
        }
        const content = await response.text()
        const ttlvResponse = TTLV.fromJSON(content)
        return fromTTLV(responseClass, ttlvResponse)
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
            await fetch((this.url as any), options)
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
        return (response.object as unknown) as T
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
        return (response.uniqueIdentifier as unknown) as T
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
            CryptographicUsageMask.Encrypt | CryptographicUsageMask.Decrypt,
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
     *  Use SymmetricKey.bytes() to recover the bytes
     * 
     * @param {string} uniqueIdentifier the Object unique identifier in the KMS
     * @returns {SymmetricKey} the KMIP symmetric Key
     */
    public async retrieveSymmetricKey(uniqueIdentifier: string): Promise<SymmetricKey> {
        return await this.getObject(uniqueIdentifier)
    }

    /**
     * Mark a KMIP Symmetric Key as Revoked
     * 
     * @param {string} uniqueIdentifier the unique identifier of the key
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

    /**
     *  Retrieve an ABE Private Master key
     * 
     *  Use PrivateKey.bytes() to recover the bytes
     *  Use Policy.fromKey() to recover the Policy
     * 
     * @param {string} uniqueIdentifier the key unique identifier in the KMS
     * @returns {PrivateKey} the KMIP symmetric Key
     */
    public async retrieveAbePrivateMasterKey(uniqueIdentifier: string): Promise<PrivateKey> {
        const key: PrivateKey = await this.getObject(uniqueIdentifier)
        if (key.keyBlock.key_format_type !== KeyFormatType.CoverCryptSecretKey) {
            throw new Error(`Not an ABE Private Master Key for identifier: ${uniqueIdentifier}`)
        }
        return key
    }

    /**
     *  Retrieve an ABE Public Master key
     * 
     *  Use PublicKey.bytes() to recover the bytes
     *  Use Policy.fromKey() to recover the Policy
     * 
     * @param {string} uniqueIdentifier the key unique identifier in the KMS
     * @returns {PublicKey} the KMIP symmetric Key
     */
    public async retrieveAbePublicMasterKey(uniqueIdentifier: string): Promise<PublicKey> {
        const key: PublicKey = await this.getObject(uniqueIdentifier)
        if (key.keyBlock.key_format_type !== KeyFormatType.CoverCryptPublicKey) {
            throw new Error(`Not an ABE Public Master Key for identifier: ${uniqueIdentifier}`)
        }
        return key
    }


    /**
     * Import a Private Master Key key into the KMS
     * 
     * @param {string} uniqueIdentifier  the unique identifier of the key
     * @param {PrivateKey} key the Private Master Key
     * @param {boolean} replaceExisting set to true to replace an existing key with the same identifier
     * @returns {string} the unique identifier of the key
     */
    public async importAbePrivateMasterKey(uniqueIdentifier: string, key: PrivateKey, replaceExisting?: boolean): Promise<string> {
        const attributes = key.keyBlock.key_value.plaintext?.attributes
        if (typeof attributes === "undefined") {
            throw new Error("The Private Master Key must contain the attributes")
        }
        return await this.importObject(uniqueIdentifier, attributes, key, replaceExisting)
    }

    /**
     * Import a Public Master Key key into the KMS
     * 
     * @param {string} uniqueIdentifier  the unique identifier of the key
     * @param {PublicKey} key the Public Master Key
     * @param {boolean} replaceExisting set to true to replace an existing key with the same identifier
     * @returns {string} the unique identifier of the key
     */
    public async importAbePublicMasterKey(uniqueIdentifier: string, key: PublicKey, replaceExisting?: boolean): Promise<string> {
        const attributes = key.keyBlock.key_value.plaintext?.attributes
        if (typeof attributes === "undefined") {
            throw new Error("The Public Master Key must contain the attributes")
        }
        return await this.importObject(uniqueIdentifier, attributes, key, replaceExisting)
    }

    /**
     * Mark a ABE Private Master Key as Revoked
     * 
     * @param {string} uniqueIdentifier the unique identifier of the key
     * @param {string} reason the explanation of the revocation
     */
    public async revokeAbePrivateMasterKey(uniqueIdentifier: string, reason: string): Promise<void> {
        return await this.revokeObject(uniqueIdentifier, reason)
    }

    /**
     * Mark a ABE Public Master Key as Revoked
     * 
     * @param {string} uniqueIdentifier the unique identifier of the key
     * @param {string} reason the explanation of the revocation
     */
    public async revokeAbePublicMasterKey(uniqueIdentifier: string, reason: string): Promise<void> {
        return await this.revokeObject(uniqueIdentifier, reason)
    }


    /**
     * Create an ABE User Decryption Key with a given access policy
     * 
     * @param {string | AccessPolicy} accessPolicy the access policy expressed as a boolean expression e.g. 
     * (Department::MKG || Department::FIN) && Security Level::Confidential
     * @param {string} privateMasterKeyIdentifier the private master key identifier which will derive this key
     * @returns {string} the unique identifier of the user decryption key
     */
    public async createAbeUserDecryptionKey(accessPolicy: AccessPolicy | string, privateMasterKeyIdentifier: string): Promise<string> {
        if (typeof accessPolicy === "string") {
            accessPolicy = new AccessPolicy(accessPolicy)
        }
        const create = new Create(
            ObjectType.PrivateKey,
            new Attributes(
                ObjectType.PrivateKey,
                [new Link(LinkType.ParentLink, new LinkedObjectIdentifier(privateMasterKeyIdentifier))],
                [accessPolicy.toVendorAttribute()],
                undefined,
                CryptographicAlgorithm.CoverCrypt,
                undefined,
                undefined,
                undefined,
                CryptographicUsageMask.Decrypt,
                KeyFormatType.CoverCryptSecretKey
            )
        )
        const response = await this.post(create, CreateResponse)
        return response.uniqueIdentifier
    }

    /**
     *  Retrieve an ABE User Decryption key
     * 
     *  Use PrivateKey.bytes() to recover the bytes
     *  Use AccessPolicy.fromKey() to recover the Policy
     * 
     * @param {string} uniqueIdentifier the key unique identifier in the KMS
     * @returns {PrivateKey} the KMIP symmetric Key
     */
    public async retrieveAbeUserDecryptionKey(uniqueIdentifier: string): Promise<PrivateKey> {
        const key: PrivateKey = await this.getObject(uniqueIdentifier)
        if (key.keyBlock.key_format_type !== KeyFormatType.CoverCryptSecretKey) {
            throw new Error(`Not an ABE User Decryption Key for identifier: ${uniqueIdentifier}`)
        }
        return key
    }


    /**
     * Import a ABE User Decryption Key key into the KMS
     * 
     * @param {string} uniqueIdentifier  the unique identifier of the key
     * @param {PrivateKey} key the ABE User Decryption Key
     * @param {boolean} replaceExisting set to true to replace an existing key with the same identifier
     * @returns {string} the unique identifier of the key
     */
    public async importAbeUserDecryptionKey(uniqueIdentifier: string, key: PrivateKey, replaceExisting?: boolean): Promise<string> {
        const attributes = key.keyBlock.key_value.plaintext?.attributes
        if (typeof attributes === "undefined") {
            throw new Error("The ABE User Decryption Key must contain the attributes")
        }
        return await this.importObject(uniqueIdentifier, attributes, key, replaceExisting)
    }

    /**
     * Mark a ABE User Decryption Key as Revoked
     * 
     * @param {string} uniqueIdentifier the unique identifier of the key
     * @param {string} reason the explanation of the revocation
     */
    public async revokeAbeUserDecryptionKey(uniqueIdentifier: string, reason: string): Promise<void> {
        return await this.revokeObject(uniqueIdentifier, reason)
    }


    /**
     * Rotate the given policy attributes. This will rekey in the KMS:
     *   - the Master Keys
     *   - all User Decryption Keys that contain one of these attributes in their policy and are not rotated.
     * 
     * Non Rekeyed User Decryption Keys cannot decrypt ata encrypted with the rekeyed Master Public Key and the given
     * attributes. 
     * Rekeyed User Decryption Keys however will be able to decrypt data encrypted by the previous Master Public Key and
     * the rekeyed one.
     * Note: there is a limit on the number of revocations that can be performed which is set in the {@link Policy} when
     * Master Keys are created
     * 
     * @param {string} privateMasterKeyUniqueIdentifier the unique identifier of the Private Master Key
     * @param {string[]} attributes to rotate e.g. ["Department::MKG", "Department::FIN"]
     * @returns {string[]} returns the IDs of the Private Master Key and Public Master Key
     */
    public async rotateAbeAttributes(privateMasterKeyUniqueIdentifier: string, attributes: string[]): Promise<string[]> {
        const rekeyKeyPair = new ReKeyKeyPair(
            privateMasterKeyUniqueIdentifier,
            undefined,
            undefined,
            new Attributes(
                ObjectType.PrivateKey,
                [new Link(LinkType.ParentLink, new LinkedObjectIdentifier(privateMasterKeyUniqueIdentifier))],
                [
                    new VendorAttribute(
                        VendorAttribute.VENDOR_ID_COSMIAN,
                        VendorAttribute.VENDOR_ATTR_COVER_CRYPT_ATTR,
                        new TextEncoder().encode(JSON.stringify(attributes))
                    )
                ],
                undefined,
                CryptographicAlgorithm.CoverCrypt,
                undefined,
                undefined,
                undefined,
                undefined,
                KeyFormatType.CoverCryptSecretKey
            )
        )
        const response = await this.post(rekeyKeyPair, ReKeyKeyPairResponse)
        return [response.privateKeyUniqueIdentifier, response.publicKeyUniqueIdentifier]
    }




}

export enum SymmetricKeyAlgorithm {
    AES,
    ChaCha20
}

