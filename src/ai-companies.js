import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'companies',
  category: 'ai',
  title: 'AI Companies - Find Top Organizations',
  description:
    'Explore leading ai companies hiring. Browse by company size, location, and specialization.',
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
