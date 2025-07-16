import { mount } from 'svelte'
import './app.css';
import CryptoNewJobs from './CryptoNewJobs.svelte';


const cryptoNewJobs = mount(CryptoNewJobs, {
  target: document.getElementById('app'),
})

export default cryptoNewJobs
