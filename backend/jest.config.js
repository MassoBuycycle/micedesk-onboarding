/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  // moduleNameMapper: {
  //   '^(\.{1,2}/.*)\.js$': '$1',
  // },
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!supertest|other-esm-module)'
  ],
};

export default config; 