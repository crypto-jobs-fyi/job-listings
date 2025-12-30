<script>
  import TopMenu from './TopMenu.svelte';

  export let title = '';
  export let description = '';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<div class="page-container">
  <TopMenu />
  <main class="page-content">
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .page-content {
    flex: 1;
    padding: 20px;
  }

  @media (max-width: 768px) {
    .page-content {
      padding: 10px;
    }
  }
</style>
