import { Certificate } from "kms/objects/Certificate";
import { CertificateType } from "kms/types/CertificateType";

const certificate = new Certificate(CertificateType.PGP, [8, 16, 64, 256]);

test("create certificate object", () => {
  expect(certificate).toEqual({
    _certificateType: 2,
    _certificateValue: [8, 16, 64, 256],
  });
});
