import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: 'jobs',
  category: 'ai',
  title: 'AI Jobs - Artificial Intelligence & ML Careers',
  description:
    'Find artificial intelligence, machine learning, and data science job opportunities. Explore careers at AI-focused companies.',
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
