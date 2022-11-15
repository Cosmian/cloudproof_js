import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { LinkedObjectIdentifier } from "./LinkedObjectIdentifier"
import { LinkType } from "./LinkType"

/**
 * The Link attribute is a structure used to create a link from one Managed
 * Cryptographic Object to another, closely related target Managed Cryptographic
 * Object. The link has a type, and the allowed types differ, depending on the
 * Object Type of the Managed Cryptographic Object, as listed below. The Linked
 * Object Identifier identifies the target Managed Cryptographic Object by its
 * Unique Identifier. The link contains information about the association
 * between the Managed Objects (e.g., the private key corresponding to a public
 * key; the parent certificate for a certificate in a chain; or for a derived
 * symmetric key, the base key from which it was derived).
 *
 * The Link attribute SHOULD be present for private keys and public keys for
 * which a certificate chain is stored by the server, and for certificates in a
 * certificate chain.
 *
 * Note that it is possible for a Managed Object to have multiple instances of
 * the Link attribute (e.g., a Private Key has links to the associated
 * certificate, as well as the associated public key; a Certificate object has
 * links to both the public key and to the certificate of the certification
 * authority (CA) that signed the certificate).
 *
 * It is also possible that a Managed Object does not have links to associated
 * cryptographic objects. This MAY occur in cases where the associated key
 * material is not available to the server or client (e.g., the registration of
 * a CA Signer certificate with a server, where the corresponding private key is
 * held in a different manner).
 */
export class Link implements KmipStruct {
  tag = "Link"

  @metadata({
    name: "LinkType",
    type: TtlvType.Enumeration,
    classOrEnum: LinkType,
  })
  private _linkType: LinkType

  public get linkType(): LinkType {
    return this._linkType
  }

  public set linkType(linkType: LinkType) {
    this._linkType = linkType
  }

  @metadata({
    name: "LinkedObjectIdentifier",
    type: TtlvType.Choice,
    classOrEnum: LinkedObjectIdentifier,
  })
  private _linkedObjectIdentifier: LinkedObjectIdentifier

  public get linkedObjectIdentifier(): LinkedObjectIdentifier {
    return this._linkedObjectIdentifier
  }

  public set linkedObjectIdentifier(
    linkedObjectIdentifier: LinkedObjectIdentifier,
  ) {
    this._linkedObjectIdentifier = linkedObjectIdentifier
  }

  constructor(
    linkType: LinkType,
    linkedObjectIdentifier: LinkedObjectIdentifier,
  ) {
    this._linkType = linkType
    this._linkedObjectIdentifier = linkedObjectIdentifier
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof Link)) {
      return false
    }
    const link = o
    return (
      this.linkType === link.linkType &&
      this._linkedObjectIdentifier === link._linkedObjectIdentifier
    )
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
