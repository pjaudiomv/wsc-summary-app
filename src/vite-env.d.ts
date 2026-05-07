/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORRECTION_WORKER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
