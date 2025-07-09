import { mount } from 'svelte'
import './app.css';
import CryptoCompanies from './CryptoCompanies.svelte';

const cryptoCompanies = mount(CryptoCompanies, {
  target: document.getElementById('app')
});

export default cryptoCompanies;
