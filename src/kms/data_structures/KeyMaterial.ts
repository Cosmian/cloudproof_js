import { KmipChoiceKey } from "kms/json/KmipChoiceKey";
import { TransparentDHPrivateKey } from "./TransparentDHPrivateKey";
import { TransparentDHPublicKey } from "./TransparentDHPublicKey";
import { TransparentECPrivateKey } from "./TransparentECPrivateKey";
import { TransparentECPublicKey } from "./TransparentECPublicKey";
import { TransparentSymmetricKey } from "./TransparentSymmetricKey";

// TODO Implement missing TransparentDSAPrivateKey, TransparentDSAPublicKey,
export class KeyMaterial extends KmipChoiceKey<
  Uint8Array,
  TransparentSymmetricKey,
  TransparentDHPrivateKey,
  TransparentDHPublicKey,
  TransparentECPrivateKey,
  TransparentECPublicKey
> {


  public equals(o: any): boolean {
    return super.equals(o);
  }

  public toString(): string {
    return super.toString();
  }
}
