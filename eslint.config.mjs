import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = [
  ...nextCoreWebVitals,
  prettierRecommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/display-name": "warn",
      "max-len": ["warn", { code: 120 }],
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "no-unused-vars": "warn",
      "max-len": ["warn", { code: 120 }],
    },
  },
];

export default eslintConfig;
