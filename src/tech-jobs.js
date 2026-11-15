import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'jobs',
  category: 'tech',
  title: 'Tech Jobs - Find Great Opportunities',
  description: 'Browse all tech job opportunities. Find your next role at leading companies.',
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
