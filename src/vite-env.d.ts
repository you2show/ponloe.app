/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_R2_PUBLIC_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
