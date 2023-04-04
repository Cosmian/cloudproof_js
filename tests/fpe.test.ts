import { randomBytes } from "crypto"
import { Fpe, logger } from ".."

import { expect, test } from "vitest"

const FPE = await Fpe()

test("credit card numbers encryption", async () => {
  const creditCardNumbers: string[] = [
    "1234-1234-1234-1234",
    "0000-0000-0000-0000",
    "1234-5678-9012-3456",
  ]

  const key = new Uint8Array(randomBytes(32))
  const tweak = new Uint8Array(randomBytes(1024))

  for (const creditCard of creditCardNumbers) {
    const ciphertext = await FPE.encrypt(key, tweak, creditCard, {
      alphabet: "numeric",
    })
    const cleartext = await FPE.decrypt(key, tweak, ciphertext, {
      alphabet: "numeric",
    })
    logger.log(() => `credit card number: \t\t${creditCard}`)
    logger.log(() => `encrypted credit card number: \t${ciphertext}`)
    expect(cleartext).toEqual(creditCard)
  }
})

test("numbers and big numbers encryption", async () => {
  const numbers: Array<string | number | bigint> = [
    123456, // an integer
    -123456, // an negative integer
    123456.123456, // a float
    999999999.9999999, // a big float
    BigInt(Number.MAX_SAFE_INTEGER),
    "123456789012345678901234567890",
    "123456789012345678901234567890123456789012345678901234567890",
    // BigInt(Number.MAX_VALUE), // to encrypt this big integer, increase `digits` value
  ]

  for (const myNumber of numbers) {
    const key = new Uint8Array(randomBytes(32))
    const tweak = new Uint8Array(randomBytes(1024))
    const myNumberEncrypted = await FPE.encrypt(key, tweak, myNumber, {
      radix: 10,
      digits: 60,
    })
    const myNumberDecrypted = await FPE.decrypt(key, tweak, myNumberEncrypted, {
      radix: 10,
      digits: 60,
    })
    logger.log(() => `number (type: ${typeof myNumber}): \t${myNumber}`)
    logger.log(() => `encrypted number: \t${myNumberEncrypted}`)
    expect(myNumberDecrypted).toEqual(myNumber)
  }
})

test("chinese text encryption", async () => {
  const chineseText: string[] = [
    "天地玄黄 宇宙洪荒",
    "日月盈昃 辰宿列张",
    "寒来暑往 秋收冬藏",
  ]

  for (const text of chineseText) {
    const key = new Uint8Array(randomBytes(32))
    const tweak = new Uint8Array(randomBytes(1024))
    const encryptedText = await FPE.encrypt(key, tweak, text, {
      alphabet: "chinese",
    })
    const decryptedText = await FPE.decrypt(key, tweak, encryptedText, {
      alphabet: "chinese",
    })
    logger.log(() => `text: \t\t\t${text}`)
    logger.log(() => `encrypted text: \t${encryptedText}`)
    expect(decryptedText).toEqual(text)
  }
})

test("utf text encryption", async () => {
  const utfText: string[] = [
    "Bérangère Aigüe",
    "ПРС-ТУФХЦЧШЩЪЫЬ ЭЮЯаб-вгдежз ийклмнопрст уфхцчш",
    "吢櫬䀾羑襃￥",
  ]

  for (const text of utfText) {
    const key = new Uint8Array(randomBytes(32))
    const tweak = new Uint8Array(randomBytes(1024))
    const encryptedText = await FPE.encrypt(key, tweak, text, {
      alphabet: "utf",
    })
    const decryptedText = await FPE.decrypt(key, tweak, encryptedText, {
      alphabet: "utf",
    })
    logger.log(() => `text: \t\t\t${text}`)
    logger.log(() => `encrypted text: \t${encryptedText}`)
    expect(decryptedText).toEqual(text)
  }
})

test("custom alphabet text encryption", async () => {
  const customText: string[] = [
    "Bérangère Aigüe 1234-&@",
    "@@@@",
    "&&&&&&&&&&&&&&&&&&",
  ]

  for (const text of customText) {
    const key = new Uint8Array(randomBytes(32))
    const tweak = new Uint8Array(randomBytes(1024))
    const encryptedText = await FPE.encrypt(key, tweak, text, {
      alphabet: "alpha_numeric",
      additionalCharacters: "/@&*",
    })
    const decryptedText = await FPE.decrypt(key, tweak, encryptedText, {
      alphabet: "alpha_numeric",
      additionalCharacters: "/@&*",
    })
    logger.log(() => `text: \t\t\t${text}`)
    logger.log(() => `encrypted text: \t${encryptedText}`)
    expect(decryptedText).toEqual(text)
  }
})
