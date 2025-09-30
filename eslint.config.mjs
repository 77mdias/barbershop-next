import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Ignore generated Prisma files
      "src/generated/**",
      "prisma/migrations/**",
      // Ignore other generated/build files
      "*.config.js",
      "*.config.mjs",
    ],
  },
  {
    rules: {
      // Relax some strict rules for development
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      // Allow console.log in development but warn about it
      "no-console": "warn",
      // React specific rules
      "react/no-unescaped-entities": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Next.js specific rules
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
