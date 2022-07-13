import { CoverCryptPolicy } from "../../crypto/abe/hybrid_crypto/cover_crypt/cover_crypt_policy"
import { MAX_ATTRIBUTE_VALUE, Policy } from "../../crypto/abe/policy"

test('policy_inst', async () => {
    const policy = new CoverCryptPolicy()
    expect(policy.maxAttributeValue).toEqual(MAX_ATTRIBUTE_VALUE)

    policy.addAxis("departments", ["R&D", "HR", "FIN"])
    policy.addAxis("secret", ["low", "medium", "high"], true)

    expect(policy.attributeToInt).toEqual({
        'departments::R&D': [0],
        'departments::HR': [1],
        'departments::FIN': [2],
        'secret::low': [3],
        'secret::medium': [4],
        'secret::high': [5]
    })
    expect(policy.store["departments"][1]).toEqual(false)
    expect(policy.store["secret"][1]).toEqual(true)
})

test('policy_ser_de', async () => {
    const policy = new CoverCryptPolicy()
    expect(policy.maxAttributeValue).toEqual(MAX_ATTRIBUTE_VALUE)

    policy.addAxis("departments", ["R&D", "HR", "FIN"])
    policy.addAxis("secret", ["low", "medium", "high"], true)

    const bytes = policy.toJsonEncoded()
    const _policy = CoverCryptPolicy.fromJsonEncoded(bytes)

    expect(_policy.attributeToInt).toEqual(policy.attributeToInt)
    expect(_policy.lastAttributeValue).toEqual(policy.lastAttributeValue)
    expect(_policy.maxAttributeValue).toEqual(policy.maxAttributeValue)
    expect(_policy.store).toEqual(policy.store)
})


test('policy_rotate', async () => {
    const policy = new CoverCryptPolicy()
    expect(policy.maxAttributeValue).toEqual(MAX_ATTRIBUTE_VALUE)

    policy.addAxis("departments", ["R&D", "HR", "FIN"])
    policy.addAxis("secret", ["low", "medium", "high"], true)

    // cover_crypt
})
