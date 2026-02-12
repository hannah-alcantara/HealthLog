import '@testing-library/jest-dom'

// Mock localStorage with actual storage
const createLocalStorageMock = () => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

global.localStorage = createLocalStorageMock()

// Mock crypto.randomUUID
global.crypto = {
  ...global.crypto,
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
}