import { mount } from 'svelte'
import './app.css'
import Favorites from './Favorites.svelte'

const favorites = mount(Favorites, {
  target: document.getElementById('app')
});

export default favorites;
