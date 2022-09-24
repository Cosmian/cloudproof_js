import { CertificateRequest } from "kms/objects/CertificateRequest"
import { CertificateRequestType } from "kms/types/CertificateRequestType"

const cr = new CertificateRequest(CertificateRequestType.CRMF, [8, 16, 64, 256])

test('create certificate request object', () => {
  expect(cr).toEqual({ "_certificate_request_type": 1, "_certificate_request_value": [8, 16, 64, 256] })
})
