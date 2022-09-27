import { KmipStruct } from "../json/KmipStruct";

export class KmipObject implements KmipStruct {
  // public static getObjectClass(objectType: ObjectType): KmipObject{
  //     if (objectType.equals(ObjectType.Certificate)) {
  //         return Certificate;
  //     }
  //     if (objectType.equals(ObjectType.Certificate_Request)) {
  //         return CertificateRequest;
  //     }
  //     if (objectType.equals(ObjectType.Opaque_Object)) {
  //         return OpaqueObject;
  //     }
  //     if (objectType.equals(ObjectType.PGP_Key)) {
  //         return PGPKey;
  //     }
  //     if (objectType.equals(ObjectType.Private_Key)) {
  //         return PrivateKey;
  //     }
  //     if (objectType.equals(ObjectType.Public_Key)) {
  //         return PublicKey;
  //     }
  //     if (objectType.equals(ObjectType.Secret_Data)) {
  //         return SecretData;
  //     }
  //     if (objectType.equals(ObjectType.Split_Key)) {
  //         return SplitKey;
  //     }
  //     if (objectType.equals(ObjectType.Symmetric_Key)) {
  //         return SymmetricKey;
  //     }
  //     throw new Error("Unsupported Object Type " + objectType + " for a KMIP Object");
  // }
}
