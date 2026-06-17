import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // 异步加载数据是合法常见模式(setState 在 useEffect 的回调/async fn 里)
      // 旧版 eslint-plugin-react-hooks 4.x 没有这个规则,5.x 新加
      // 关闭它避免大量误报,实际 bug 通过 ESLint 其它规则捕获
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])