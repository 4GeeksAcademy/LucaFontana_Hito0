module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        module: "commonjs",
        moduleResolution: "node",
        esModuleInterop: true,
        strict: true,
        baseUrl: ".",
        paths: {
          "@shared/auth": ["packages/shared/auth/index.ts"],
          "@shared/*": ["packages/shared/*"],
          "next/navigation": ["tests/next-navigation.ts"],
        },
      },
    }],
  },
  moduleNameMapper: {
    "^@shared/auth$": "<rootDir>/packages/shared/auth/index.ts",
    "^@shared/(.*)$": "<rootDir>/packages/shared/$1",
    "^next/navigation$": "<rootDir>/tests/next-navigation.ts",
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
    "^react/jsx-runtime$": "<rootDir>/node_modules/react/jsx-runtime",
  },
  collectCoverageFrom: [
    "packages/shared/auth/**/*.{ts,tsx}",
  ],
};