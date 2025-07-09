import { mount } from 'svelte'
import './app.css';
import AICompanies from './AICompanies.svelte';

const aiCompanies = mount(AICompanies, {
  target: document.getElementById('app')
});

export default aiCompanies;
