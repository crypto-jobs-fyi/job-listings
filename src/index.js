import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'home',
  category: 'all',
  title: 'Job Finder - Crypto & AI Jobs | Find Your Next Opportunity',
  description:
    'Discover crypto & ai job opportunities. Search thousands of positions from top companies.',
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
