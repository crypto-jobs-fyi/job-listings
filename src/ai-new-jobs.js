import { mount } from 'svelte'
import './app.css';
import AINewJobs from './AINewJobs.svelte';

const aiNewJobs = mount(AINewJobs, {
  target: document.getElementById('app'),
})

export default aiNewJobs;
