/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_ENABLE_ACCESS_LOGGING: string;
  readonly VITE_APP_ENABLE_MAIL: string;
  readonly VITE_APP_MAIL_ID: string;
  readonly VITE_APP_MAIL_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
