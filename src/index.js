import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'home',
  category: 'all',
  title: 'Job Finder - AI & Crypto Jobs | Find Your Next Opportunity',
  description:
    'Discover AI, ML, data science, blockchain, DeFi, and crypto job opportunities. Search thousands of positions from top companies.',
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
