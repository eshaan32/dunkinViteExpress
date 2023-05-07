export default {
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsConfig: 'packages/tsconfig.json'// Directly target the tsconfig shared across projects
    }
  }
}