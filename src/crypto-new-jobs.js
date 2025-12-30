import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'new-jobs',
  category: 'crypto',
  title: 'New Crypto Jobs - Latest Web3 Opportunities',
  description:
    'Discover the newest cryptocurrency and blockchain job listings. Updated daily with fresh Web3 opportunities.',
};

// Store in window for App.svelte to access
window.__PAGE_CONFIG__ = pageConfig;

const app = mount(App, {
  target: document.getElementById('app'),
  props: {
    pageConfig,
  },
});

export default app;
