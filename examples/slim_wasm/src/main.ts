import './style.css'
import { CoverCrypt } from 'cloudproof_js/slim'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div>
      <button id="button">Encrypt and decrypt</button>
    </div>
    <div id="encrypted"></div>
    <div id="decrypted"></div>
  </div>
`

const buttonElement = document.getElementById("button")
if (! buttonElement) throw new Error("No `button` element")

const encryptedElement = document.getElementById("encrypted")
if (! encryptedElement) throw new Error("No `button` element")

const decryptedElement = document.getElementById("decrypted")
if (! decryptedElement) throw new Error("No `button` element")

buttonElement.addEventListener('click', async () => {
  const { encrypt,decrypt, generateMasterKeys, generateUserSecretKey, Policy, PolicyAxis } = await CoverCrypt("http://localhost:3000/cover_crypt/cloudproof_cover_crypt_bg.wasm");

  const policy = new Policy(
    [
      new PolicyAxis(
        "Security",
        [
          { name: "Low", isHybridized: false },
          { name: "High", isHybridized: false },
        ],
        false,
      ),
    ],
    100,
  )

  const masterKeys = generateMasterKeys(policy)
  const userKey = generateUserSecretKey(masterKeys.secretKey, "Security::High", policy)

  let encrypted = encrypt(policy, masterKeys.publicKey, "Security::High", (new TextEncoder).encode("Hello World!"));
  encryptedElement.innerText = (new TextDecoder).decode(encrypted)

  let decrypted = decrypt(userKey, encrypted)
  decryptedElement.innerText = (new TextDecoder).decode(decrypted.plaintext)
})
