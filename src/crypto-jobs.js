import { mount } from 'svelte'
import CryptoJobs from './CryptoJobs.svelte';
import './app.css';

const cryptoJobs = mount(CryptoJobs, {
  target: document.getElementById('app')
});

export default cryptoJobs;
