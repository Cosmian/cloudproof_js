module.exports = {
  preset: 'ts-jest',
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePaths: [
    "<rootDir>/wasm_lib/abe/cover_crypt"
  ],
};
