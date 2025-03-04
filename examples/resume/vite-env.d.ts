/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COZE_BOT_ID: string;
  readonly VITE_COZE_API_KEY: string;
  // 可以添加更多环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 