import { Serializable, serialize, deserialize } from "./kmip"
import { Get } from "./requests/Get"
import { Attributes, Link, LinkType, VendorAttribute } from "./structs/object_attributes"
import { Object, PrivateKey, PublicKey, SymmetricKey } from "./structs/objects"
import { Import } from "./requests/Import"
import { Revoke } from "./requests/Revoke"
import { Create } from "./requests/Create"
import { CryptographicUsageMask, RevocationReasonEnumeration } from "./structs/types"
import { Destroy } from "./requests/Destroy"
import { CryptographicAlgorithm, KeyBlock, KeyFormatType, KeyValue, TransparentSymmetricKey } from "./structs/object_data_structures"
import { Policy } from "../crypto/abe/interfaces/policy"
import { CreateKeyPair } from "./requests/CreateKeyPair"
import { AccessPolicy } from "crypto/abe/interfaces/access_policy"
import { ReKeyKeyPair } from "./requests/ReKeyKeyPair"

export interface KmsResponse {

}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export interface KmsRequest<T extends KmsResponse> {
  __response: T | undefined
}

export class KmsClient {
  private readonly url: URL
  private readonly headers: HeadersInit

  /**
   * Instantiate a KMS Client
   *
   * @param {URL} url of the KMS server
   * @param {string} apiKey optional, to authenticate to the KMS server
   */
  constructor(url: URL, apiKey: string | null = null) {
    this.url = url
    this.headers = {
      "Content-Type": "application/json; charset=utf-8",
    }
    if (apiKey !== null) {
      this.headers.Authorization = `Bearer ${apiKey}`
    }
  }

  /**
   * Execute a KMIP request and get a response
   * It is easier and safer to use the specialized methods of this class, for each crypto system
   *
   * @param {TRequest} request a valid KMIP operation
   * @returns {TResponse} an instance of the KMIP response
   */
  private async post<TResponse extends KmsResponse>(
    request: KmsRequest<TResponse> & Serializable,
  ): Promise<TResponse> {
    const response = await fetch(this.url, {
      method: "POST",
      body: serialize(request),
      headers: this.headers,
    })

    if (response.status >= 400) {
      throw new Error(`KMIP request failed: ${await response.text()}`)
    }

    const content = await response.text()
    return deserialize<TResponse>(content);
  }

  /**
   * Tests whether the KMS server is responding
   *
   * @returns {boolean} true if up
   */
  public async up(): Promise<boolean> {
    try {
      await fetch(this.url, {
        method: "GET",
        headers: this.headers,
      })
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
  public async getObject(uniqueIdentifier: string): Promise<Object> {
    const response = await this.post(new Get(uniqueIdentifier))
    return response.object
  }

  /**
   * Import a KMIP Object inside the KMS
   *
   * @param {string} uniqueIdentifier the Object unique identifier in the KMS
   * @param {Attributes} attributes the indexed attributes of the Object
   * @param {Object} object the KMIP Object instance
   * @param {boolean} replaceExisting replace the existing object
   * @returns {string} the unique identifier
   */
  public async importObject(
    uniqueIdentifier: string,
    attributes: Attributes,
    object: Object,
    replaceExisting: boolean = false,
  ): Promise<string> {
    const response = await this.post(new Import(
      uniqueIdentifier,
      attributes.objectType,
      object,
      attributes,
      replaceExisting,
    ))

    return response.uniqueIdentifier
  }

  /**
   * Revoke a KMIP Object in the KMS
   *
   * @param {string} uniqueIdentifier the unique identifier of the object
   * @param {string} reason the explanation of the revocation
   */
  public async revokeObject(
    uniqueIdentifier: string,
    reason: string | RevocationReasonEnumeration,
  ): Promise<void> {
    await this.post(new Revoke(uniqueIdentifier, reason))
  }

  /**
   * Destroy a KMIP Object in the KMS
   *
   * @param {string} uniqueIdentifier the unique identifier of the object
   */
  public async destroyObject(uniqueIdentifier: string): Promise<void> {
    await this.post(new Destroy(uniqueIdentifier))
  }

  /**
   * Create a symmetric key
   *
   * @param {SymmetricKeyAlgorithm} algorithm defaults to AES
   * @param {number} bits number of bits of the key, defaults to 256
   * @param {Link[]} links potential links to other keys
   * @returns {string} the unique identifier of the created key
   */
  public async createSymmetricKey(
    algorithm: SymmetricKeyAlgorithm = SymmetricKeyAlgorithm.AES,
    bits: number | null = null,
    links: Link[] = [],
  ): Promise<string> {
    const algo = algorithm === SymmetricKeyAlgorithm.ChaCha20 ? CryptographicAlgorithm.ChaCha20 : CryptographicAlgorithm.AES

    const attributes = new Attributes('SymmetricKey')
    attributes.link = links
    attributes.cryptographicAlgorithm = algo
    attributes.cryptographicLength = bits
    attributes.keyFormatType = KeyFormatType.TransparentSymmetricKey

    const response = await this.post(new Create(attributes.objectType, attributes))
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
  public async importSymmetricKey(
    uniqueIdentifier: string,
    keyBytes: Uint8Array,
    replaceExisting: boolean = false,
    algorithm: SymmetricKeyAlgorithm = SymmetricKeyAlgorithm.AES,
    links: Link[] = [],
  ): Promise<string> {
    const algo = algorithm === SymmetricKeyAlgorithm.ChaCha20 ? CryptographicAlgorithm.ChaCha20 : CryptographicAlgorithm.AES

    const attributes = new Attributes('SymmetricKey')
    attributes.link = links
    attributes.cryptographicAlgorithm = algo
    attributes.cryptographicLength = keyBytes.length * 8
    attributes.keyFormatType = KeyFormatType.TransparentSymmetricKey
    attributes.cryptographicUsageMask = CryptographicUsageMask.Encrypt | CryptographicUsageMask.Decrypt

    const symmetricKey = new SymmetricKey(
      new KeyBlock(
        KeyFormatType.TransparentSymmetricKey,
        new KeyValue(
          new TransparentSymmetricKey(keyBytes),
          attributes,
        ),
        algo,
        keyBytes.length * 8,
      ),
    )
    return await this.importObject(
      uniqueIdentifier,
      attributes,
      { type: 'SymmetricKey', value: symmetricKey },
      replaceExisting,
    )
  }

  /**
   *  Retrieve a symmetric key
   *
   *  Use SymmetricKey.bytes() to recover the bytes
   *
   * @param {string} uniqueIdentifier the Object unique identifier in the KMS
   * @returns {SymmetricKey} the KMIP symmetric Key
   */
  public async retrieveSymmetricKey(
    uniqueIdentifier: string,
  ): Promise<SymmetricKey> {
    const object = await this.getObject(uniqueIdentifier);
    if (object.type !== 'SymmetricKey') {
      throw new Error(`The KMS server returned a ${object.type} instead of a SymmetricKey for the identifier ${uniqueIdentifier}`)
    }

    return object.value
  }

  /**
   * Mark a KMIP Symmetric Key as Revoked
   *
   * @param {string} uniqueIdentifier the unique identifier of the key
   * @param {string} reason the explanation of the revocation
   */
  public async revokeSymmetricKey(
    uniqueIdentifier: string,
    reason: string,
  ): Promise<void> {
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
    const attributes = new Attributes('PrivateKey')
    attributes.cryptographicAlgorithm = CryptographicAlgorithm.CoverCrypt
    attributes.keyFormatType = KeyFormatType.CoverCryptSecretKey
    attributes.vendorAttributes = [policy.toVendorAttribute()]

    const response = await this.post(new CreateKeyPair(attributes))
    return [
      response.privateKeyUniqueIdentifier,
      response.publicKeyUniqueIdentifier,
    ]
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
  public async retrieveAbePrivateMasterKey(
    uniqueIdentifier: string,
  ): Promise<PrivateKey> {
    const object = await this.getObject(uniqueIdentifier)

    if (object.type !== "PrivateKey") {
      throw new Error(`The KMS server returned a ${object.type} instead of a PrivateKey for the identifier ${uniqueIdentifier}`)
    }

    if (object.value.keyBlock.keyFormatType !== KeyFormatType.CoverCryptSecretKey) {
      throw new Error(`The KMS server returned a private key of format ${object.value.keyBlock.keyFormatType} for the identifier ${uniqueIdentifier} instead of a CoverCryptSecretKey`)
    }

    return object.value
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
  public async retrieveAbePublicMasterKey(
    uniqueIdentifier: string,
  ): Promise<PublicKey> {
    const object = await this.getObject(uniqueIdentifier)

    if (object.type !== "PublicKey") {
      throw new Error(`The KMS server returned a ${object.type} instead of a PublicKey for the identifier ${uniqueIdentifier}`)
    }

    if (object.value.keyBlock.keyFormatType !== KeyFormatType.CoverCryptPublicKey) {
      throw new Error(`The KMS server returned a private key of format ${object.value.keyBlock.keyFormatType} for the identifier ${uniqueIdentifier} instead of a CoverCryptPublicKey`)
    }

    return object.value
  }

  /**
   * Import a Private Master Key key into the KMS
   *
   * @param {string} uniqueIdentifier  the unique identifier of the key
   * @param {PrivateKey} key the Private Master Key
   * @param {boolean} replaceExisting set to true to replace an existing key with the same identifier
   * @returns {string} the unique identifier of the key
   */
  public async importAbePrivateMasterKey(
    uniqueIdentifier: string,
    key: PrivateKey,
    replaceExisting: boolean = false,
  ): Promise<string> {
    if (key.keyBlock === null) throw new Error(`The Private Master Key keyBlock shouldn't be null`);
    if (!(key.keyBlock.keyValue instanceof KeyValue)) throw new Error(`The Private Master Key keyBlock.keyValue should be a KeyValue`);
    if (key.keyBlock.keyValue.attributes === null) throw new Error(`The Private Master Key keyBlock.keyValue.attributes shouldn't be null`);

    return await this.importObject(
      uniqueIdentifier,
      key.keyBlock.keyValue.attributes,
      { type: 'PrivateKey', value: key },
      replaceExisting,
    )
  }

  /**
   * Import a Public Master Key key into the KMS
   *
   * @param {string} uniqueIdentifier  the unique identifier of the key
   * @param {PublicKey} key the Public Master Key
   * @param {boolean} replaceExisting set to true to replace an existing key with the same identifier
   * @returns {string} the unique identifier of the key
   */
  public async importAbePublicMasterKey(
    uniqueIdentifier: string,
    key: PublicKey,
    replaceExisting?: boolean,
  ): Promise<string> {
    if (key.keyBlock === null) throw new Error(`The Public Master Key keyBlock shouldn't be null`);
    if (!(key.keyBlock.keyValue instanceof KeyValue)) throw new Error(`The Public Master Key keyBlock.keyValue should be a KeyValue`);
    if (key.keyBlock.keyValue.attributes === null) throw new Error(`The Public Master Key keyBlock.keyValue.attributes shouldn't be null`);

    return await this.importObject(
      uniqueIdentifier,
      key.keyBlock.keyValue.attributes,
      { type: 'PrivateKey', value: key },
      replaceExisting,
    )
  }

  /**
   * Mark a ABE Private Master Key as Revoked
   *
   * @param {string} uniqueIdentifier the unique identifier of the key
   * @param {string} reason the explanation of the revocation
   */
  public async revokeAbePrivateMasterKey(
    uniqueIdentifier: string,
    reason: string,
  ): Promise<void> {
    return await this.revokeObject(uniqueIdentifier, reason)
  }

  /**
   * Mark a ABE Public Master Key as Revoked
   *
   * @param {string} uniqueIdentifier the unique identifier of the key
   * @param {string} reason the explanation of the revocation
   */
  public async revokeAbePublicMasterKey(
    uniqueIdentifier: string,
    reason: string,
  ): Promise<void> {
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
  public async createAbeUserDecryptionKey(
    accessPolicy: AccessPolicy | string,
    privateMasterKeyIdentifier: string,
  ): Promise<string> {
    if (typeof accessPolicy === "string") {
      accessPolicy = new AccessPolicy(accessPolicy)
    }

    const attributes = new Attributes('PrivateKey');
    attributes.link = [
      new Link(LinkType.ParentLink, privateMasterKeyIdentifier),
    ];
    attributes.vendorAttributes = [accessPolicy.toVendorAttribute()]
    attributes.cryptographicAlgorithm = CryptographicAlgorithm.CoverCrypt
    attributes.cryptographicUsageMask = CryptographicUsageMask.Decrypt
    attributes.keyFormatType = KeyFormatType.CoverCryptSecretKey

    const response = await this.post(new Create(attributes.objectType, attributes))
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
  public async retrieveAbeUserDecryptionKey(
    uniqueIdentifier: string,
  ): Promise<PrivateKey> {
    return await this.retrieveAbePrivateMasterKey(uniqueIdentifier)
  }

  /**
   * Import a ABE User Decryption Key key into the KMS
   *
   * @param {string} uniqueIdentifier  the unique identifier of the key
   * @param {PrivateKey} key the ABE User Decryption Key
   * @param {boolean} replaceExisting set to true to replace an existing key with the same identifier
   * @returns {string} the unique identifier of the key
   */
  public async importAbeUserDecryptionKey(
    uniqueIdentifier: string,
    key: PrivateKey,
    replaceExisting?: boolean,
  ): Promise<string> {
    return await this.importAbePrivateMasterKey(uniqueIdentifier, key, replaceExisting)
  }

  /**
   * Mark a ABE User Decryption Key as Revoked
   *
   * @param {string} uniqueIdentifier the unique identifier of the key
   * @param {string} reason the explanation of the revocation
   */
  public async revokeAbeUserDecryptionKey(
    uniqueIdentifier: string,
    reason: string,
  ): Promise<void> {
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
  public async rotateAbeAttributes(
    privateMasterKeyUniqueIdentifier: string,
    attributes: string[],
  ): Promise<string[]> {
    const privateKeyAttributes = new Attributes('PrivateKey')
    privateKeyAttributes.link = [
      new Link(LinkType.ParentLink, privateMasterKeyUniqueIdentifier),
    ]
    privateKeyAttributes.vendorAttributes = [
      new VendorAttribute(
        VendorAttribute.VENDOR_ID_COSMIAN,
        VendorAttribute.VENDOR_ATTR_COVER_CRYPT_ATTR,
        new TextEncoder().encode(JSON.stringify(attributes)),
      ),
    ]
    privateKeyAttributes.cryptographicAlgorithm = CryptographicAlgorithm.CoverCrypt
    privateKeyAttributes.keyFormatType = KeyFormatType.CoverCryptSecretKey

    const request = new ReKeyKeyPair(privateMasterKeyUniqueIdentifier)
    request.privateKeyAttributes = privateKeyAttributes
    
    const response = await this.post(request)
    return [
      response.privateKeyUniqueIdentifier,
      response.publicKeyUniqueIdentifier,
    ]
  }
}

export enum SymmetricKeyAlgorithm {
  AES,
  ChaCha20,
}