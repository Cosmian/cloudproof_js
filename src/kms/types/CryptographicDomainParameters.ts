import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"
import { RecommendedCurve } from "./RecommendedCurve"

/**
 * The Cryptographic Domain Parameters attribute (4.14) is a structure that contains fields that MAY need to be
 * specified in the Create Key Pair Request Payload.
 *
 * Specific fields MAY only pertain to certain types of Managed Cryptographic Objects. T
 *
 * he domain parameter q_length corresponds to the bit length of parameter Q (refer to [RFC7778],[SEC2]and [SP800-56A]).
 *
 * q_length applies to algorithms such as DSA and DH.
 *
 * The bit length of parameter P (refer toto [RFC7778],[SEC2]and [SP800-56A]) is specified separately by setting the
 * Cryptographic Length attribute.
 *
 * Recommended Curve is applicable to elliptic curve algorithms such as ECDSA, ECDH, and ECMQV
 */
export class CryptographicDomainParameters {
  @metadata({
    name: "QLength",
    type: TtlvType.Integer,
  })
  public q_length?: number

  @metadata({
    name: "RecommendedCurve",
    type: TtlvType.Enumeration,
    classOrEnum: RecommendedCurve,
  })
  public recommended_curve?: RecommendedCurve

  public static empty(): CryptographicDomainParameters {
    return new CryptographicDomainParameters()
  }

  public toString(): string {
    return JSON.stringify(this, null, 4)
  }
}
