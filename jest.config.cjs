module.exports = {
  verbose: true,
  testRegex: "(.*|(\\.|/)(test|spec))\\.(jsx?|js?|tsx?|ts?)$",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'cjs', 'jsx', 'json', 'node'],
  // modulePaths: [
  //   "<rootDir>/node_modules/", "<rootDir>/wasm_lib/"
  // ],
  transformIgnorePatterns: ['node_modules', 'wasm_lib'],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/", "<rootDir>/wasm_lib/"],
}