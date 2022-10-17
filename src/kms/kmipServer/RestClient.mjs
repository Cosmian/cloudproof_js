import fetch from "node-fetch"

const url = "http://localhost:9998/kmip/2_1"

const importPayload = {
  tag: "Import",
  value: [
    {
      tag: "UniqueIdentifier",
      type: "TextString",
      value: "unique_identifier",
    },
    {
      tag: "ObjectType",
      type: "Enumeration",
      value: "SymmetricKey",
    },
    {
      tag: "ReplaceExisting",
      type: "Boolean",
      value: true,
    },
    {
      tag: "KeyWrapType",
      type: "Enumeration",
      value: "AsRegistered",
    },
    {
      tag: "Attributes",
      value: [
        {
          tag: "Link",
          value: [],
        },
        {
          tag: "ObjectType",
          type: "Enumeration",
          value: "OpaqueObject",
        },
      ],
    },
    {
      tag: "Object",
      value: [
        {
          tag: "KeyBlock",
          value: [
            {
              tag: "KeyFormatType",
              type: "Enumeration",
              value: "TransparentSymmetricKey",
            },
            {
              tag: "KeyValue",
              value: [
                {
                  tag: "KeyMaterial",
                  value: [
                    {
                      tag: "Key",
                      type: "ByteString",
                      value: "6279746573",
                    },
                  ],
                },
              ],
            },
            {
              tag: "CryptographicAlgorithm",
              type: "Enumeration",
              value: "AES",
            },
            {
              tag: "CryptographicLength",
              type: "Integer",
              value: 256,
            },
          ],
        },
      ],
    },
  ],
}
// Server response : Upserting object of type: SymmetricKey, with uid: unique_identifier

const createPayload = {
  tag: "Create",
  type: "Structure",
  value: [
    {
      tag: "ObjectType",
      type: "Enumeration",
      value: "SymmetricKey",
    },
    {
      tag: "Attributes",
      type: "Structure",
      value: [
        {
          tag: "CryptographicAlgorithm",
          type: "Enumeration",
          value: "AES",
        },
        {
          tag: "KeyFormatType",
          type: "Enumeration",
          value: "TransparentSymmetricKey",
        },
        {
          tag: "Link",
          type: "Structure",
          value: [],
        },
        {
          tag: "ObjectType",
          type: "Enumeration",
          value: "SymmetricKey",
        },
      ],
    },
  ],
}
// Server response : Created KMS Object of type SymmetricKey with id eb9c5a0d-afa3-4d06-8673-3dc51431268f

const getPayload = {
  tag: "Get",
  type: "Structure",
  value: [
    {
      tag: "UniqueIdentifier",
      type: "TextString",
      value: "eb9c5a0d-afa3-4d06-8673-3dc51431268f",
    },
  ],
}
// Server response : Retrieved Object: SymmetricKey with id eb9c5a0d-afa3-4d06-8673-3dc51431268f

const encryptPayload = {
  tag: "Encrypt",
  type: "Structure",
  value: [
    {
      tag: "UniqueIdentifier",
      type: "TextString",
      value: "eb9c5a0d-afa3-4d06-8673-3dc51431268f",
    },
    {
      tag: "IvCounterNonce",
      type: "ByteString",
      value: "747765616b56616c7565",
    },
  ],
}
// Server response : POST /kmip. Request: "Encrypt"

const decryptPayload = {
  tag: "Decrypt",
  type: "Structure",
  value: [
    {
      tag: "UniqueIdentifier",
      type: "TextString",
      value: "eb9c5a0d-afa3-4d06-8673-3dc51431268f",
    },
    {
      tag: "IvCounterNonce",
      type: "ByteString",
      value: "747765616b56616c7565",
    },
  ],
}
// Server response : POST /kmip. Request: "Decrypt"

const locatePayload = {
  tag: "Locate",
  type: "Structure",
  value: [
    {
      tag: "Attributes",
      type: "Structure",
      value: [
        {
          tag: "CryptographicAlgorithm",
          type: "Enumeration",
          value: "AES",
        },
        {
          tag: "KeyFormatType",
          type: "Enumeration",
          value: "TransparentSymmetricKey",
        },
        {
          tag: "Link",
          type: "Structure",
          value: [],
        },
        {
          tag: "ObjectType",
          type: "Enumeration",
          value: "SymmetricKey",
        },
      ],
    },
  ],
}
// Server response :
// Listed 1 rows
// Retrieved Object: SymmetricKey with id 9884be1f-fd6c-4944-ab20-5bce3f00e140

const options = {
  method: "POST",
  body: JSON.stringify(locatePayload),
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
}

;(async () => {
  const response = await fetch(url, options)
  const content = await response
  console.log(content)
})()
