module.exports = {
  preset: 'ts-jest',
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleDirectories: [
    'src',
    'node_modules'
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/cosmian_cover_crypt'
  ],
  testTimeout: 100000,
  detectOpenHandles: true
}
