module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/miniprogram'],
  testMatch: ['**/*.test.ts', '**/*.property.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'miniprogram/**/*.ts',
    '!miniprogram/**/*.test.ts',
    '!miniprogram/**/*.property.test.ts',
    '!miniprogram/**/*.d.ts',
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
