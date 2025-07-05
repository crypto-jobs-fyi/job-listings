import { mount } from 'svelte'
import './app.css';
import AIJobs from './AIJobs.svelte';

const aiJobs = mount(AIJobs, {
  target: document.getElementById('app'),
})

export default aiJobs;
