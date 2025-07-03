import { mount } from 'svelte'
import './app.css';
import NewJobs from './NewJobs.svelte';


const newJobs = mount(NewJobs, {
  target: document.getElementById('app'),
})

export default newJobs