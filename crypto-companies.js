import './src/main.js';
import CryptoCompanies from './src/CryptoCompanies.svelte';

const app = new CryptoCompanies({
  target: document.getElementById('app')
});

export default app;
