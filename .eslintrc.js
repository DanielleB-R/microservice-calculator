module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    "@typescript-eslint/adjacent-overload-signatures": ["error"],
    "@typescript-eslint/array-type": ["error", { default: "array" }],
    "@typescript-eslint/await-thenable": ["error"],
    "@typescript-eslint/ban-ts-comment": ["error"],
    "@typescript-eslint/consistent-type-assertions": ["error"],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        selector: "default",
        format: ["camelCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: "property",
        format: null,
        filter: {
          regex: "[-]",
          match: true,
        },
      },
    ],
    "@typescript-eslint/no-array-constructor": ["error"],
    "@typescript-eslint/no-empty-function": ["error"],
    "@typescript-eslint/no-empty-interface": ["error"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-for-in-array": ["error"],
    "@typescript-eslint/no-inferrable-types": ["error"],
    "@typescript-eslint/no-misused-new": ["error"],
    "@typescript-eslint/no-namespace": ["error"],
    "@typescript-eslint/no-non-null-assertion": ["warn"],
    "@typescript-eslint/no-this-alias": ["error"],
    "@typescript-eslint/no-unnecessary-type-assertion": ["error"],
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": ["error"],
    "@typescript-eslint/prefer-includes": ["error"],
    "@typescript-eslint/prefer-namespace-keyword": ["error"],
    "@typescript-eslint/prefer-regexp-exec": ["error"],
    "@typescript-eslint/prefer-string-starts-ends-with": ["error"],
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/unbound-method": ["error"],
    "comma-dangle": "off",
    "no-array-constructor": ["off"],
    "no-console": "off",
    "no-empty-function": ["off"],
    "no-unused-vars": ["off"],
    "no-use-before-define": ["off"],
    "no-var": ["error"],
    "prefer-const": ["error"],
    "prefer-rest-params": ["error"],
    "prefer-spread": ["error"],
    "quote-props": ["error", "as-needed"],
    "use-isnan": "error",
    "valid-typeof": "off",
  },
};