module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: [],
}
