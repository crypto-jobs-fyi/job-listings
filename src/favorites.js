import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'favorites',
  category: 'all',
  title: 'Favorites - Your Saved Job Listings',
  description: 'View all your saved favorite job listings in one place. Organize your job search effectively.',
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
