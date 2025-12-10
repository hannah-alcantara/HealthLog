import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock crypto.randomUUID
global.crypto = {
  ...global.crypto,
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
}