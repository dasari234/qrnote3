import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  // 1. Pull in the official Next.js Core Web Vitals rule sets
  ...nextVitals,

  // 2. Append Prettier to turn off all conflicting style rules
  prettierConfig,

  // 3. Define directories and files for ESLint to completely ignore
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'prisma/migrations/**',
  ]),

  // 4. Custom rule adjustments
  {
    rules: {
      'no-unused-vars': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
]);

export default eslintConfig;
