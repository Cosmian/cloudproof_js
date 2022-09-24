import { hexDecode } from 'utils/utils'
import { DemoKeys } from '../../common/demo_hybrid_crypto'

export class GpswDemoKeys extends DemoKeys {
  constructor () {
    super(GpswDemoKeys.policy, GpswDemoKeys.publicKey, GpswDemoKeys.masterPrivateKey, GpswDemoKeys.topSecretMkgFinUser, GpswDemoKeys.mediumSecretMkgUser, GpswDemoKeys.plaintext, GpswDemoKeys.uid, GpswDemoKeys.encryptedData)
  }

  // {"last_attribute_value":9,"max_attribute_value":109,"store":{"Security Level":[["Protected","Low Secret","Medium Secret","High Secret","Top Secret"],true],"Department":[["R&D","HR","MKG","FIN"],false]},"attribute_to_int":{"Security Level::Top Secret":[5],"Security Level::Low Secret":[2],"Security Level::High Secret":[4],"Security Level::Protected":[1],"Department::R&D":[6],"Department::MKG":[8],"Department::FIN":[9],"Department::HR":[7],"Security Level::Medium Secret":[3]}}
  static policyHex = '7b226c6173745f6174747269627574655f76616c7565223a392c226d61785f6174747269627574655f6372656174696f6e73223a32302c2261786573223a7b224465706172746d656e74223a5b5b22522644222c224852222c224d4b47222c2246494e225d2c66616c73655d2c225365637572697479204c6576656c223a5b5b2250726f746563746564222c224c6f7720536563726574222c224d656469756d20536563726574222c224869676820536563726574222c22546f7020536563726574225d2c747275655d7d2c226174747269627574655f746f5f696e74223a7b225365637572697479204c6576656c3a3a50726f746563746564223a5b315d2c225365637572697479204c6576656c3a3a546f7020536563726574223a5b355d2c225365637572697479204c6576656c3a3a4d656469756d20536563726574223a5b335d2c224465706172746d656e743a3a4d4b47223a5b385d2c224465706172746d656e743a3a46494e223a5b395d2c224465706172746d656e743a3a4852223a5b375d2c224465706172746d656e743a3a522644223a5b365d2c225365637572697479204c6576656c3a3a4c6f7720536563726574223a5b325d2c225365637572697479204c6576656c3a3a4869676820536563726574223a5b345d7d7d'
  static policy = hexDecode(this.policyHex)

  static publicKeyHex = '000000148355d28bc6e5105f2b3d9aaa86e9b8cc0314b85dcfc79966ae1a0c25ca36118e62771edd556c94410a4341a746fe9a0f841017f7c59c3964e5cf6b83f0f8fa7f6b1fd8bcc201c9ebc444af688efb260346cebd4c089b5a68a193b16691443218af5785eb074fa9ceec137705929b65dfd4bc2978b5e0c56e8a02b3572993221cc32061e8c3b5fe32a66de9fecc835b8c828cae80d08d1660de6bd6ac5a27a8806c8f8f097a5f11e27177e78c7eb96f7398962aaafea0d81bd4345e6fd50d2e1e8a47e86aead719881cc51fb99a956fdf7588edbf77c890b4bb9a8c44c813ed79cba14e929810601fb2a9303ba7023ffc8011c989624cc76516074b1d3cf47f5056fcb33cf47020d1c4b3519bfded729a6caeb7f68e378448d5ad71de12a260e79275160d4b16e6247aa028100f8de49c1e58b0b9c26dd0544233af7b098f00403b71e505bfeccd451e162745088949a2af2d0a0de74de6352f0c686b0e72895af7809dc098ec17f3851bc57150990a261cb1c4222e76bac9597bb4e74af4ac97a272895c90fa2c1b33ff4cf707f2c5ba6d6f99784a6b456dfdd59cea27675e396cab27b7770151e4ed4d2d212e29f4da90f4841c37dfa92140c62a5a85882eb6aeffecca816383a79344072d4dd724f0b4e4384caf5c95d861c4c0990bc56d9b88a767478f108a6da5628b7c63a8ca41e826ad0f10d8ee8a1e87684ce51f3488b304bd23e07e02118cbd8aecae388196935e9a6fd86c51c1f67f76fab9f790b2d2536169b533251b89086e7f82e43c6b4d0a3aa755f8cbce70c721356536a66a92b496d403bc312e6b347c1dc0b35ce9ebc0885c3dcef6e9cdfeed176f4bc29a14f773aed0ab1f6c234ee25f153705cca4fa50d0c61176b1c461e7495d73e69d54993229d15160ea4be99ef5b21e685d0405a4f38577ca12f5d4f5fa4c7c161e8bdef154c96a13a6280ba356f65736acb8b4c3feb84c04a3ba6f575a5d336fb33a2f51510d603a79357ee8793d48ba878b0b7755a003f2584bba9c8fbb463e5585ff48624781ff441592df13e707c1bf94290ee448f6b4e88b959089cae0ffd9acfdc119adebbe68a38e934640c6bf6061b9b0f028577b4bd62d18ac4915a4175b83876ca34328ca7e8747b225eb4d79a05e48f06a56464ef75a4449b0d951bbee9ce93006952c2409c3bb475787447675d410ae8dfa415a634762bf222acf9981c03ef9246e0243021c4916ec53fcfa684a55f7a04bdc2289891f500b8415d9faf3cd8c56fc289f566931a176f5c0edb10a2e80b479c962bdf81c89f232f81bec276869bb9f506867f0a78514c8bb82f2a68c95671b0f317b8a40cef799a054d83c0edc8abfc051c9fc996ce55c26fd8f80e1865b720a5ff2d5c45f4dfef88955daa28d736e80ca877a90e7a8281a141215aca7e6a7014cb08ffe35e37a2753c4a3d16071a035f2adc35b260c4bd4310cf2732711f04306cc8898fa9051385700d5beeefc83a462a41a6342a6f5d65ba257bfc7e072744d5ea736609cae51e9416600104e471354ce394f0afe402d6610dc399dd98365fedf7eec6f153260d127a62f40c890123a2930d465408051fd4371c224943048f5f5808d3537aa15060814bb497482f9de618fca4f43a94226dff96347a570c9c0a702c7bfc392c63d01977745b7a8d9752b5d94990992fdd9061d3a32df6fc4a8884c6f3d7e22b653662d305d707572ff3fa255b892bd88da6f8a6e978276ff293a0f55860a811e06'
  static publicKey = hexDecode(this.publicKeyHex)

  static masterPrivateKeyHex = '0000001420cd093f4b908d2b66c9f90c717904568e21f92f0db69dd29ef3d4f3c833724b8ad0aec3a082ab9d082bf2022f40bc4a1becdebcccf70d6fbaac42ecca8c0766d2ac02d2a0afb367b613892959e418aee4781add4c49adf3902a0999d299fc6f5622b46930f8bf1a8940533ab1c8d4b99567e2acfe0c31882ac9f8da6423de0f28c18560840610f13b673534b78e02ad2d27a1c47a5a134726e1c2e3a7ef143a0d8c8c9a270ebc1945e281e6859d41d882b929265c2c3877268b11826fdc5437bf74a20c04de418e952e49a002c292a0c93533c9ac6a4919933d1d5b9631156b3aafbdddc3d7a1405cd56a960f5a238e0104bec289e94d8429d7061238a7d53562ed74aca3c18c7f5e265026f5e36175c6ac508306b3d249d517d1cdd0bb901e8e8b1287d5d67619451ab922152cd109cba0f21c6d132da2f6bf876deef8d266d1d15c08b1cb847e63df5c0dde3d4ff44fb7a2ead0e999a202e3f01c73c2163991b2cd98d569340ca16528e450df8a9063bcc2061cf3f41361cdd155747eb447b268c76aaaccbc09bbf591e80224a0474527f458be70190acf92a5c1cb994371766f2d5007c69a5e387ab53b490c4473ce29993956fe33d50d621d348acb783126532b7b30d7b5ffb1b0036316610f98bf5c08babecb97cc4d11a161ffaac801d9b07ffa79c50dc7f7b22c5969b9135278bb7279fa2230ca1201ea03363f1b2dcb5288618b55f04f73519921815ba9ccca84bab7743c2b9ae7e4cf6a955bc273ef1dda17c2d69e1111bdf792cd9e70f6edbed0d0682df76e3efe8e151dc87503caed67913304acaecac77523573559818bdd82c7b987ebe5b85222d1281c553149c552d84fa1fbf8c048a72e29220b17127fc4ab615308252b6e0f4637f7df248e2eaf1ee0a275a9f316cd2d21b63bb8ffe390e67236516e5f1a3b49654dc463'
  static masterPrivateKey = hexDecode(this.masterPrivateKeyHex)

  // User decryption key with access policy: "Security Level::Top Secret && (Department::MKG || Department::FIN)",
  static topSecretMkgFinUserAccessPolicy = 'Security Level::Top Secret && (Department::MKG || Department::FIN)'
  static topSecretMkgFinUserHex = '00000007abb135f0aee2e2f913ac222617f5cd2999dc9dc28b69b42cc3821f7c9192ed72fbca1e822a20fb5b95b151edc49b13141975cbe4dc3a3e9c520f01817d108622778ca00b6cdf2f44aca6ff775c5f4b2f2319e2df574b3d195ee88f29278d9768a24a0a8cd9edd3f589f4246431ccc2d20f9050b6dfb04f85ba9ea6a529e8686108b94981d2b6fe28eed115df203040a111b27a4bb54eadb3c928540d1cebbd2a1f47dc6eacba4adcc2091670f6978d1ba0629c562a2c0e6ab1dbde2c3da0541bb28217cbaab98736385f429af6d530aaaea5b5661015f5b742c66c739be19b3a1a9cfeba6bd38b783bed7df5e66f69ab0b2dbff7cc55f50ede428e49d920907e88c5ae386b17b9044145e4844d4e3737079af10419ad1ca3220a483d9fa2fc558f4d2b4c3a4bfe8fc295b16b1f0e32a346edeff7458eca0d810888e3cf7a635e079b458d521f164a3fd7014e6c46724112c8a042e98e60f83bc4f2d23f7c996a8b44be757af542d869347fe020a19e0d84c57a66af5ff5fa37386cb824a567c88d19aaffcb2e8a389943dbe513deb5d511ec4d880d651599bafbd5dc4a2f3c2e9b0d77718514dff232a5b1101d6f02d20f3f9eaf4808013ed9bb29efed94b89868dd4bef72c9e51746e260017ed4213978fca29e839d75a1e1b2950555a19126a48ed50719bfa3350fcf486489ec7fee1fc1041ea1d9c739157a151e096b29fbe42d44bfc70d990814fecabdb42bbf9b0278991eab06a6082d2073935194f8270be6c25f3c3e05921a40daefa9b594254fb24d9a56a9301c3aecff8df5bc8b7db0765b53691f4b85c1a9899e12ca9bfb4c7174b4107903feee15aaa81af6b90042e43a8c3ad94a862f35947c0778bba114ba1e30155f1c90f227cc009714d99012f20295655492274a64165d20d1abd25199f506b6c07151ea074d187b8b368a00000007000000020000000400000009000000080000000300000002000000050000000101000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed73000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed7301000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000'
  static topSecretMkgFinUser = hexDecode(this.topSecretMkgFinUserHex)

  // User decryption key with access policy: "Security Level::Medium Secret && Department::MKG"
  static mediumSecretMkgUserAccessPolicy = 'Security Level::Medium Secret && Department::MKG'
  static mediumSecretMkgUserHex = '00000004b9b39d60dd4943665718de470b89df4803ef245c8ea2f72f124409d2c06a7bf0ba92a1502f791147803528647679ed8b18bba1c3d2147560cc7874a30ae9fff5c7fdde174c7ef3ea32ae3b54b8293367fb0b64f725003ab36f70fb913e8553be853ec4e63c637c415125dc986860743b3eea2226e464aa894b186ebdeecc76c0d5e66d4f08f0990395c0c91f1cd8450c0f34ea220b55b39917943544ad8c070e1beb8ac67076e151e3a992407034b65b7ca524a00477cb4b6443b7fa9c50aa068719a6a4d7afa088276935366a90b8f8021e81e77388244ea4b9454424a430cb1e1858f3e69c61b45579343184a9aabb0b2677c3b93e9b01f37f16c3dc55506104f2aa26b84825b59195075b180298096e51e569985d548078836f030fae7a7d824f0431f4d7861b6748659c438f7220ad27649b83333ae8df1561bd3ea92abe13325f4c276476e305e84f79dc5c78d80d95e87122dab5d2e854b44c32414596131940088398425feae59e6b23935c06c3e0bcedf30577f546c986ba79074f46000000040000000200000008000000020000000300000001000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed73010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000'
  static mediumSecretMkgUser = hexDecode(this.mediumSecretMkgUserHex)

  static encryptedData = hexDecode('000001c00000019000000002000000020000000800000002b10579e04358ff86e631c87dbee14dd6dc34bfa790350fbb3159b49ca26a6768fc9b2662b86a30b029519acfa275283d88effc786ea3ab3ce124f49b1a74146e123b628d0a154765dd0a18fbc4fc1a5ca003cffea865fff402e6afa44621d147d15a00522489d2741a21c33ce167e762d385010e86a427e649c299a145d7a33bbc5ffe2b2a6b3947377d6fb4354b7a4e14cc1a8a3e45e89f4a375a1fb88f5381a48d761e206420ecbe7ba929cc2f580cf8d08a2ba75e55e09299a561cdb15664125dae1930e9fab84ad91b31a5dbf2ddfa9c0599755034b36bd1a627d73137e368f0bd5efd5c69bd8c6acdb73c9c1c7a0a6cbf7aa3693d9816dfaf2c5aff51e57280fb3931b5243c2df09e4a5d7d04be1e8807a0c5528ed70b67dc93dde8d91316e0a0b358738a4bc3c447f4f31f46936d79ceb0a37a5c4ce4b219a330cb5ade4f82c8751ef2b4fcf91d6e7413e1cedf0ec8ea43b3ce41ef80f4a3c8decf135823582375798a34a7641985c286cb9b07568b914fb01a6826823cd21b09ac36d05eca7ad207f34c5132d16d9a0000001cfe24fcbb696e0ae7d6fd1491247e141c882bccf2a594ffe88551bb8547aeebc403f60685b996c4984de3f5ca3c4853b8d85a64a2f7f3f456e5b381522a8d8c6fdf850c6fcaf05009749f54dd08a1a1d6a0716a74210066cc8a00a8a505c821f99542')
  // The UID param is an integrity parameter both used in ABE header staticruction and AES-GCM-ciphertext generation
  static uidHex = '3132333435363738'
  static uid = hexDecode(this.uidHex)

  // Plaintext example is: Martin DUPONT: CONSEILLER GRANDE CLIENTELE
  static plaintextHex = '4D617274696E204455504F4E543A20434F4E5345494C4C4552204752414E444520434C49454E54454C45'
  static plaintext = hexDecode(this.plaintextHex)
}
