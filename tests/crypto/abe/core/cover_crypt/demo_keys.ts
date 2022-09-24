import { hexDecode } from 'utils/utils'
import { DemoKeys } from '../../common/demo_hybrid_crypto'

export class CoverCryptDemoKeys extends DemoKeys {
  constructor () {
    super(CoverCryptDemoKeys.policy, CoverCryptDemoKeys.publicKey, CoverCryptDemoKeys.masterPrivateKey, CoverCryptDemoKeys.topSecretMkgFinUser, CoverCryptDemoKeys.mediumSecretMkgUser, CoverCryptDemoKeys.plaintext, CoverCryptDemoKeys.uid, CoverCryptDemoKeys.encryptedData)
  }

  // {"last_attribute_value":10,"max_attribute_value":100,"store":{"Security Level":[["Protected","Low Secret","Medium Secret","High Secret","Top Secret"],true],"Department":[["R&D","HR","MKG","FIN"],false]},"attribute_to_int":{"Security Level::Low Secret":[2],"Department::MKG":[8],"Security Level::Medium Secret":[3],"Security Level::Top Secret":[5],"Security Level::Protected":[1],"Department::FIN":[10,9],"Department::HR":[7],"Department::R&D":[6],"Security Level::High Secret":[4]}}
  static policy = hexDecode('7b226c6173745f6174747269627574655f76616c7565223a31302c226d61785f6174747269627574655f6372656174696f6e73223a3130302c2261786573223a7b224465706172746d656e74223a5b5b22522644222c224852222c224d4b47222c2246494e225d2c66616c73655d2c225365637572697479204c6576656c223a5b5b2250726f746563746564222c224c6f7720536563726574222c224d656469756d20536563726574222c224869676820536563726574222c22546f7020536563726574225d2c747275655d7d2c226174747269627574655f746f5f696e74223a7b225365637572697479204c6576656c3a3a4c6f7720536563726574223a5b325d2c225365637572697479204c6576656c3a3a4869676820536563726574223a5b345d2c224465706172746d656e743a3a522644223a5b365d2c224465706172746d656e743a3a4852223a5b375d2c225365637572697479204c6576656c3a3a50726f746563746564223a5b315d2c225365637572697479204c6576656c3a3a546f7020536563726574223a5b355d2c224465706172746d656e743a3a4d4b47223a5b385d2c225365637572697479204c6576656c3a3a4d656469756d20536563726574223a5b335d2c224465706172746d656e743a3a46494e223a5b31302c395d7d7d')

  static publicKey = hexDecode('e837b9a5ce1fbacfe0a38aea62fdd70b95266bfbdd62d312eeede6e1323be6779a819762ab6c304437912d42b9e1d030c8156ff6e53cb2c355295d44e26a3617190202080ea93c4fc77cbee2027ec434714ca8f520f36fe91896fb425c9326627e36342c02020752fd4daf35864673073f8b385a3492f81b4f228f7edea2bf1cb9118d178d791e0204092e912eb7a92ca4c13a17783ed1befbbae782733f647228c660ffb3849b214b0802020612a9bbfe11e706e199ac7804de3c825da05d834f1a0a0585ccac029828abe872020507b86c4174e683185b5edb36d04bad61352d7c26b6f3fbb63f5c800684e0c1426902040644f2769afe75503f34ea46d6b6c05357802bf08ad802b327bcca08b89381ca0202010984e0bf736858777b102bc431bb177954de22c5e857269a87747dfeb97fd2684f020106ee8a71f9bcece4e193bb8ec43dbe68ff20ea1e9c58cbef08153f30035a829b15020508c4e75fb85323738e8f57647a3582f0010c50dcbead6f8b7a22ed5e6e0ae9e17d020506fa110c5991308dc77f542e162be6241583f45f3e4ba0b1bf6cfde513e78ba72d0201076c8588035418a80ba30835ffc2d16c9f704f300d99161faf8f64fc56d726ae550205092c935a0f5c809dad18def8e50763b3960b9473327757df4d61e974d6646f3e60020306c655202be304832bc965cdfbebea9a17116e5df63e10eecfca59324a637e8009020209f611691c286513ae1827f225b3cb68c4d76cefb519b759da24de98e36111320d02050a047cc0313bc3da783da8031eb240dc80582fca39bac77d7a16371510ad1a214d02010a26f9029fe91773c7a73d131d287f386675b68def99defbe3fd2cb994cc97cd0902030a04d2dedfda5f0c785514f4ea2632cfe17392b1ed825774c0bb8684537514266b020309accade45d627b7ab22494e3ab0b65d98a03cf2bdd8c3a52057a617ef077dcb4b02030754068ad7734b139f1bf95722d2342bb355b8bf0153315e28a804847f9bb9b640020408fc34034df5e76bdabf99c572e5f43f69990fe9cd9afbe21a498494c6e9cc093d02020a8062bcb260196ad118bedcf18c40525c1b7b8d0ceea283951c03987b5f9ab36002040a006957ace05d1887004c4f5cc6b0f0fbc374b69a87d27d1006a222fca17d7074020308b0fbe03ee18804fb470aec0c44f570db48a9cb90fec86622f696dd688e0b71560201084650606be916378cdf0bc43b1387fe8d79b5ec18eaba7694a9f29a46501f0421020407245209aa72de03d0c61028333d29eeea462f0b2ff4368f14ce65f94fc0185e17')

  static masterPrivateKey = hexDecode('68a97ed8ac2cd7b572f43ceb97fe9d01c75600a2b1d0fa8f574db6ef3cbfa00621dddcbd9299c12ce53e3ccd00e80a408999bb6e53aea36742b61061070a3a060fe76ed83d1a5398c3f4f3fb474d7f83d853deff60f46b68fe99d7e4e414790919020506da0fbf5e96f7e1fb6675d2c6d05c07287dd439a4c93f667a68869aa462097d0802020643aef4ae9121d33511ad2b597b0eae9926f436c94a48551ba1b412a980706601020307725eb797a73e40c3af789963cfe784e46eb3f172d2ae1526cf4db9542c753b02020109e65f45a55620cbc4a42fec5aaa7d6d8cde3f9072f77c0860300db5df26427e04020507ce85df79f919f383bd1f6268ca953fea062e9c21e5827738785bd0fad5798c0a0204065d7a5ee9b8a179bb915f45d5412474b107851cdbbd508c39e3b1db5cd70139030204094b8a7c585c14d41a8518bf90cdf7ecca1c12f7a306b49af97ddd70a20ec0090d0204078701361597006b97aa3977bd768bb8dff27ae22fc0c7dd20c400bfaf5bb0eb00020209979fc8486e0ee0d6f96df29c14a818a8b5721b576d64f6367b176406e94b7d0102030aeae2d4e3fefaa54fdb0c3bd77d0c19f6431b6df1ab16be3ae8999bdc3cbd0c000204088b3cef880301fe7ba9851d1b95cc9c9b5d26cdf24cccec676f7ae98d639463000203063ffdc62a355ca00fcb25f8a023ab1f72d7f1c827e33d56a4b17156ee0bd7030a0201080b3aaf0cc2b80f0df3cc157d761015f056a11e188863b26368e59c775e6f0c0e020508d9486101e1bf8e2169f0a41f2384997661951fca8b87dde97992b574295aa10d02040a88519c586b90bd3f8ff0e21a09f5ce5c05fda7935ca06e24d35e187897c1aa030201065b181a87e859746bf95589d6c23938e6de36da31860175f5fb5d7f4592062b0e020107a66773951f154d2bb3931d103d23d72bfb5156f39b843dac69424136feac4b0602050af44bf678b405e67b29f927c00c3ea7a726e1654a2823b67f435848b3af29870b02020aa5bad49427b19cb5d358b7e6dce57ea80354fffcca16750b1c01a89a9ae92a0102010a4c86be7838dd909d6da7f4f1a9f50dad7a667123a9bf6c5ca8684f9792a415090205096e58ba68fc5e86cde9bfe7486315060c18bd2c5ba5380c2b94da5c01eae80b0f0203086934499e81cd181b86d6ed0cc952e14aa0416297c9d549451b68ba2b6aa6ee060202089ef438aa831a2cc6a8788b37d3e043e07b64e0861482caf0f34cd203086ab306020207345a8f322472305858944be6ba8712a0b3fb7fc07d20d926335040a728067a00020309b8b33822e5c2344c2964c192d39d770daec76f8c1e93328701820d43d818fc05')

  static topSecretMkgFinUserAccessPolicy = 'Security Level::Top Secret && (Department::MKG || Department::FIN)'
  static topSecretMkgFinUser = hexDecode('b13579b255aac470d8702c9302e33dc30a835529127eec733c136493d7c09c053903bbc495d253d311879d2f8de592279cef70c9a45f55e9f3081d9f93157e090a02030aeae2d4e3fefaa54fdb0c3bd77d0c19f6431b6df1ab16be3ae8999bdc3cbd0c000204088b3cef880301fe7ba9851d1b95cc9c9b5d26cdf24cccec676f7ae98d6394630002050af44bf678b405e67b29f927c00c3ea7a726e1654a2823b67f435848b3af29870b020508d9486101e1bf8e2169f0a41f2384997661951fca8b87dde97992b574295aa10d02020aa5bad49427b19cb5d358b7e6dce57ea80354fffcca16750b1c01a89a9ae92a0102010a4c86be7838dd909d6da7f4f1a9f50dad7a667123a9bf6c5ca8684f9792a415090203086934499e81cd181b86d6ed0cc952e14aa0416297c9d549451b68ba2b6aa6ee060202089ef438aa831a2cc6a8788b37d3e043e07b64e0861482caf0f34cd203086ab30602040a88519c586b90bd3f8ff0e21a09f5ce5c05fda7935ca06e24d35e187897c1aa030201080b3aaf0cc2b80f0df3cc157d761015f056a11e188863b26368e59c775e6f0c0e')

  // User decryption key with access policy: "Security Level::Medium Secret && Department::MKG"
  static mediumSecretMkgUserAccessPolicy = 'Security Level::Medium Secret && Department::MKG'
  static mediumSecretMkgUser = hexDecode('5eebe01d2ba103e503a9faa2717d882f5c32c1c565f6cc2b3226b1bb4deff10a77ee34a78664ba43fd8da0b77365b6edb1bc806fc5d7931db77b4a4f64ba6502030202089ef438aa831a2cc6a8788b37d3e043e07b64e0861482caf0f34cd203086ab3060201080b3aaf0cc2b80f0df3cc157d761015f056a11e188863b26368e59c775e6f0c0e0203086934499e81cd181b86d6ed0cc952e14aa0416297c9d549451b68ba2b6aa6ee06')

  // The UID param is an integrity parameter both used in ABE header readonlyruction and AES-GCM-ciphertext generation
  static uid = hexDecode('00000001')

  // Plaintext example is: My secret message
  static plaintext = hexDecode('4d7920736563726574206d657373616765')

  // Hybrid encrypted data: ABE attributes are ['Security Level::Low Secret', 'Department::HR', 'Department::FIN']
  static encryptedData = hexDecode('000000a90000008144d5292d89d9488e8fc3b9aadbba6924baff67a590d88a375a358cb83f1f306298d72105f68632f82e06151be7f8c4e831fc7e0e1a11adda55deaae48a6ccb1402330b627fcd983782154db6de20730beaabb230d12a69aa522e972153dc73f751a42cddbfa3c4c085b6e676ce8746bc3f37e27ce1a27aeaa925ae9c6c303b409a2a1fe066eac99999aac39e67aa89fbe9870ffe0c3e2f379a33959cb6a0107ebe3785dff11ab26600f1708c0370db45ad26809b169a2cfb0076b5df9836ce0bfbb53ed5092b83c577f80441d410acc3a54a')
}
