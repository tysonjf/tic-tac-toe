module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "eslint:recommended", // Use the recommended rules from ESLint
    "plugin:@typescript-eslint/recommended", // Use the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  env: {
    node: true, // Enables Node.js global variables and Node.js scoping
    es2021: true, // Enables ES2021 globals and automatically sets the ecmaVersion parser option to 12
  },
  rules: {
    // Disable the base rule as it can report incorrect errors
    "no-unused-vars": "off",
    // Enable the TypeScript-specific rule
    "@typescript-eslint/no-unused-vars": ["error"], // Place to specify your own ESLint rules.
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
};
