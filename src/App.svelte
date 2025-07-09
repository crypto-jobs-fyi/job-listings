<script>
  // @ts-nocheck
</script>

<main>
  <div class="main-banner">
    <div class="main-banner-text">
      <span class="main-banner-title">Welcome to Web3 & AI Jobs!</span>
      <span class="main-banner-desc">Find your next opportunity in the world of blockchain, DeFi, digital assets, and AI.</span>
    </div>
  </div>
  <div class="main-links">
    <a class="main-link-btn crypto" href="/crypto-jobs.html">Crypto Jobs</a>
    <a class="main-link-btn crypto" href="/crypto-companies.html">Crypto Companies</a>
    <a class="main-link-btn ai" href="/ai-jobs.html">AI Jobs</a>
    <a class="main-link-btn ai" href="/ai-companies.html">AI Companies</a>
  </div>
</main>

<style>
  main {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(67,198,172,0.10);
    text-align: center;
  }
  .main-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  .main-banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center; /* changed from flex-start to center */
  }
  .main-banner-title {
    font-size: 2rem;
    font-weight: 700;
    color: #222;
    letter-spacing: 0.01em;
  }
  .main-banner-desc {
    font-size: 1.1rem;
    color: #333;
    opacity: 0.85;
  }
  .main-links {
    display: flex;
    flex-direction: row;
    gap: 1.5rem;
    align-items: center;
    margin-top: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .main-link-btn {
    display: inline-block;
    padding: 1rem 2.5rem;
    border-radius: 10px;
    font-size: 1.25rem;
    font-weight: 600;
    text-decoration: none;
    color: #fff;
    background: #646cff;
    box-shadow: 0 2px 8px rgba(67,198,172,0.10);
    transition: background 0.2s, transform 0.2s;
    min-width: 220px;
    text-align: center;
  }
  .main-link-btn.crypto {
    background: #646cff;
  }
  .main-link-btn.crypto:hover {
    background: #535bf2;
    transform: translateY(-2px) scale(1.03);
  }
  .main-link-btn.ai {
    background: #ff4081;
  }
  .main-link-btn.ai:hover {
    background: #f50057;
    transform: translateY(-2px) scale(1.03);
  }
</style>
