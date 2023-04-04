import init, {
  webassembly_fpe_decrypt_alphabet,
  webassembly_fpe_decrypt_big_integer,
  webassembly_fpe_decrypt_float,
  webassembly_fpe_encrypt_alphabet,
  webassembly_fpe_encrypt_big_integer,
  webassembly_fpe_encrypt_float,
} from "../pkg/fpe/cloudproof_fpe"

let initialized: Promise<void> | undefined

let wasmInit: (() => any) | undefined
export const setFpeInit = (arg: () => any): void => {
  wasmInit = arg
}

// Use an interface to define the `encrypt` and `decrypt` options
interface FpeOptions {
  alphabet?: string
  additionalCharacters?: string
  radix?: number
  digits?: number
}

/**
 * This Format Preserving Encryption (FPE) function provides FPE-techniques for use in a zero-trust environment. These techniques are based on FPE-FF1 which is described in [NIST:800-38G](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-38g.pdf).
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function Fpe() {
  if (initialized === undefined) {
    if (wasmInit === undefined) {
      throw new Error("Please provide a WASM init function")
    }

    const loadModule = wasmInit()
    initialized = init(loadModule).then(() => undefined)
  }

  await initialized

  // This encryption function takes plaintext as number, bigint or string:
  //
  // * when encrypting an integer (bigint typescript datatype) and big integer (represented as string), the radix and digits are needed to be specified. The `max_value` is calculated as the number of `digits` raised to the power of `radix`.
  // * when encrypting a float, no option is required
  // * when encrypting a string, an alphabet id can be given to specify the alphabet required:
  //   - "numeric": 0123456789
  //   - "hexa_decimal": 0123456789abcdef
  //   - "alpha_lower": abcdefghijklmnopqrstuvwxyz
  //   - "alpha_upper": ABCDEFGHIJKLMNOPQRSTUVWXYZ
  //   - "alpha": abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
  //   - "alpha_numeric": 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
  //   - "utf": creates an Alphabet with the first 63489 (~2^16) Unicode characters
  //   - "chinese": creates an Alphabet with the Chinese characters
  //   - "latin1sup": creates an Alphabet with the latin-1 and latin1-supplement characters (supports French)
  //   - "latin1sup_alphanum": creates an Alphabet with the latin-1 and latin1-supplement characters but without the non alphanumeric characters (supports French)
  const encrypt = async (
    key: Uint8Array,
    tweak: Uint8Array,
    plaintext: string | number | bigint,
    options: FpeOptions = {},
  ): Promise<string | number | bigint> => {
    if (typeof plaintext === "string") {
      // There are 2 cases where we have string a FPE-plaintext
      // - string as big integer where specifying the radix and digits is required
      // - other strings where specifying an alphabet may be required
      if (
        typeof options.radix !== "undefined" &&
        typeof options.digits !== "undefined"
      ) {
        return webassembly_fpe_encrypt_big_integer(
          plaintext,
          options.radix,
          options.digits,
          key,
          tweak,
        )
      } else {
        return webassembly_fpe_encrypt_alphabet(
          plaintext,
          options.alphabet ?? "alpha_numeric",
          key,
          tweak,
          options.additionalCharacters ?? "",
        )
      }
    } else if (typeof plaintext === "number") {
      return webassembly_fpe_encrypt_float(plaintext, key, tweak)
    } else if (typeof plaintext === "bigint") {
      const ciphertext = webassembly_fpe_encrypt_big_integer(
        plaintext.toString(),
        options.radix ?? 10,
        options.digits ?? 6,
        key,
        tweak,
      )
      return BigInt(ciphertext)
    } else {
      throw new Error(`Type of ${typeof plaintext} not supported.`)
    }
  }

  const decrypt = async (
    key: Uint8Array,
    tweak: Uint8Array,
    ciphertext: string | number | bigint,
    options: FpeOptions = {},
  ): Promise<string | number | bigint> => {
    if (typeof ciphertext === "string") {
      if (
        typeof options.radix !== "undefined" &&
        typeof options.digits !== "undefined"
      ) {
        return webassembly_fpe_decrypt_big_integer(
          ciphertext,
          options.radix,
          options.digits,
          key,
          tweak,
        )
      } else {
        return webassembly_fpe_decrypt_alphabet(
          ciphertext,
          options.alphabet ?? "alpha_numeric",
          key,
          tweak,
          options.additionalCharacters ?? "",
        )
      }
    } else if (typeof ciphertext === "number") {
      return webassembly_fpe_decrypt_float(ciphertext, key, tweak)
    } else if (typeof ciphertext === "bigint") {
      const cleartext = webassembly_fpe_decrypt_big_integer(
        ciphertext.toString(),
        options.radix ?? 10,
        options.digits ?? 6,
        key,
        tweak,
      )
      return BigInt(cleartext)
    } else {
      throw new Error(`Type of ${typeof ciphertext} not supported.`)
    }
  }

  return {
    encrypt,
    decrypt,
  }
}
