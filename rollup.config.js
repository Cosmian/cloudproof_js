import typescript from "@rollup/plugin-typescript"
import { wasm } from "@rollup/plugin-wasm"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

const production = !process.env.ROLLUP_WATCH

const outdir = (fmt, env) => {
  if (env === "node") {
    return `dist/node`
  } else {
    return `dist/${fmt}${env === "slim" ? "-slim" : ""}`
  }
}

const rolls = (fmt, env) => ({
  input: env !== "slim" ? "src/index.ts" : "src/slim.ts",
  output: {
    dir: outdir(fmt, env),
    format: fmt,
    entryFileNames: `[name].${fmt === "cjs" ? "cjs" : "js"}`,
    name: "cloudproof_js",
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    // We want to inline our wasm bundle as base64. Not needing browser users
    // to fetch an additional asset is a boon as there's less room for errors
    env !== "slim" &&
      wasm(
        env === "node"
          ? { maxFileSize: 0, targetEnv: "node" }
          : { targetEnv: "auto-inline" },
      ),
    typescript({
      outDir: outdir(fmt, env),
      rootDir: "src",
      sourceMap: !production,
    }),
    {
      name: "copy-pkg",

      // wasm-bindgen outputs a import.meta.url when using the web target.
      // rollup will either preserve the the statement when outputting an esm,
      // which will cause webpack < 5 to choke or it will output a
      // "require('url')", for other output types, causing more choking. Since
      // we want a downstream developer to either not worry about providing wasm
      // at all, or forcing them to deal with bundling, we resolve the import to
      // an empty string. This will error at runtime.
      resolveImportMeta: () => `""`,
    },
  ],
})

export default [
  rolls("umd", "fat"),
  rolls("es", "fat"),
  rolls("cjs", "fat"),
  rolls("cjs", "node"),
  rolls("es", "slim"),
  rolls("cjs", "slim"),
]
