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
  moduleDirectories: [
    "src",
    "node_modules"
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePathIgnorePatterns: [
    "<rootDir>/tests/kms",
    "<rootDir>/dist",
  ],
  testTimeout: 50000,
  detectOpenHandles: true
};
