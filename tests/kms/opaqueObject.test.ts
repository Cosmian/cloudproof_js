import { OpaqueObject } from "../../src/kms/objects/OpaqueObject"
import { OpaqueDataType } from "../../src/kms/types/OpaqueDataType"

const oo = new OpaqueObject(OpaqueDataType.Unknown, 256)

test('create opaque object', () => {
  expect(oo).toEqual({ "_opaque_data_type": 2147483649, "_opaque_data_value": 256 })
})
