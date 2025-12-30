import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'jobs',
  category: 'crypto',
  title: 'Crypto Jobs - Find Web3 & Blockchain Opportunities',
  description:
    'Browse all cryptocurrency and blockchain job opportunities. Find your next Web3 role at leading crypto companies.',
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
