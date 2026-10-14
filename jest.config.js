module.exports = {
  watchman: false,
  transform: { '^.+\\.[cm]?[jt]sx?$': 'babel-jest' },
  preset: '@react-native/jest-preset',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native[^/]*|@react-native[^/]*|@react-navigation|@tanstack|lucide-react-native)/)',
  ],
};
