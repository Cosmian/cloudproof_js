module.exports = {
  verbose: true,
  transform: {
    '^.+\\.[j|t]sx?$': 'ts-jest',
  },
  // see https://jestjs.io/docs/ecmascript-modules
  // see https://jestjs.io/docs/configuration#extensionstotreatasesm-arraystring
  // this seems very buggy 
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};