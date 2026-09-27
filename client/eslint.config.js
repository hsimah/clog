import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import tsquid from "@tsquid/eslint-plugin";

export default [
  { ignores: ["dist/**", "**/__generated__/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tsquid.configs.recommended,
];
