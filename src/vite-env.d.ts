/// <reference types="svelte" />
/// <reference types="vite/client" />

// Global window type extensions
declare global {
  interface Window {
    __PAGE_CONFIG__?: {
      type: string;
      category: 'crypto' | 'ai' | 'fin' | 'all';
      title: string;
      description: string;
    };
  }
}

export {};
