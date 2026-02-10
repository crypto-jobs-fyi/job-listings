<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '../stores/auth';
  import { sendVerificationCode, verifyCode, isValidEmail } from '../services/authService';

  let step: 'email' | 'code' = 'email';
  let email = '';
  let code = '';
  let rememberMe = false;
  let loading = false;
  let error = '';
  let resendCooldown = 0;
  let cooldownInterval: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    // Check if user is already authenticated
    if ($auth.isAuthenticated) {
      redirectToAccount();
    }

    // Get return URL from query params
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('return');
    if (returnUrl) {
      sessionStorage.setItem('auth_return_url', returnUrl);
    }

    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  });

  function isValidRedirectUrl(url: string | null): boolean {
    if (!url) return false;
    
    // Allow relative URLs starting with /
    if (url.startsWith('/')) {
      // Prevent protocol-relative URLs like //evil.com
      if (url.startsWith('//')) return false;
      return true;
    }
    
    // Allow same-origin absolute URLs
    try {
      const urlObj = new URL(url, window.location.href);
      return urlObj.origin === window.location.origin;
    } catch {
      // Invalid URL format
      return false;
    }
  }

  function redirectToAccount() {
    const returnUrl = sessionStorage.getItem('auth_return_url');
    sessionStorage.removeItem('auth_return_url');
    
    const targetUrl = isValidRedirectUrl(returnUrl) ? returnUrl : '/account.html';
    window.location.href = targetUrl;
  }

  function startCooldown() {
    resendCooldown = 60;
    cooldownInterval = setInterval(() => {
      resendCooldown--;
      if (resendCooldown <= 0 && cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }
    }, 1000);
  }

  async function handleSendCode() {
    error = '';

    if (!email.trim()) {
      error = 'Please enter your email address';
      return;
    }

    if (!isValidEmail(email)) {
      error = 'Please enter a valid email address';
      return;
    }

    loading = true;
    const result = await sendVerificationCode(email.trim().toLowerCase());
    loading = false;

    if (result.success) {
      step = 'code';
      startCooldown();
    } else {
      error = result.error || 'Failed to send code';
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return;

    error = '';
    loading = true;
    const result = await sendVerificationCode(email.trim().toLowerCase());
    loading = false;

    if (result.success) {
      startCooldown();
    } else {
      error = result.error || 'Failed to send code';
    }
  }

  async function handleVerifyCode() {
    error = '';

    if (!code.trim()) {
      error = 'Please enter the verification code';
      return;
    }

    if (code.length !== 4) {
      error = 'Code must be 4 digits';
      return;
    }

    loading = true;
    const result = await verifyCode(email.trim().toLowerCase(), code.trim());
    loading = false;

    if (result.success && result.email) {
      auth.login(result.email, rememberMe);
      redirectToAccount();
    } else {
      error = result.error || 'Invalid or expired code';
      code = ''; // Clear code on error
    }
  }

  function handleCodeInput(e: Event) {
    const input = e.target as HTMLInputElement;
    // Only allow digits
    input.value = input.value.replace(/\D/g, '').slice(0, 4);
    code = input.value;
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (step === 'email') {
        handleSendCode();
      } else if (step === 'code') {
        handleVerifyCode();
      }
    }
  }
</script>

<main>
  <div class="login-card">
    <h1>Log In</h1>

    {#if step === 'email'}
      <p class="description">Enter your email to receive a verification code</p>

      <div class="form-group">
        <label for="email">Email Address</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          on:keypress={handleKeyPress}
          placeholder="your@email.com"
          disabled={loading}
          autocomplete="email"
          class:error
        />
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button class="btn btn-primary" on:click={handleSendCode} disabled={loading || !email.trim()}>
        {loading ? 'Sending...' : 'Send Code'}
      </button>
    {:else}
      <p class="description">Enter the 4-digit code sent to <strong>{email}</strong></p>

      <div class="form-group">
        <label for="code">Verification Code</label>
        <input
          id="code"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="4"
          bind:value={code}
          on:input={handleCodeInput}
          on:keypress={handleKeyPress}
          placeholder="1234"
          disabled={loading}
          autocomplete="one-time-code"
          class="code-input"
          class:error
        />
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" bind:checked={rememberMe} />
          <span>Keep me logged in for 30 days</span>
        </label>
        <span class="checkbox-hint">(Default is 7 days)</span>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button
        class="btn btn-primary"
        on:click={handleVerifyCode}
        disabled={loading || code.length !== 4}
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>

      <div class="resend-section">
        {#if resendCooldown > 0}
          <span class="resend-cooldown">Resend code in {resendCooldown}s</span>
        {:else}
          <button class="btn-link" on:click={handleResendCode} disabled={loading}>
            Resend Code
          </button>
        {/if}
      </div>

      <button
        class="btn-link"
        on:click={() => {
          step = 'email';
          code = '';
          error = '';
        }}
      >
        Use a different email
      </button>
    {/if}
  </div>
</main>

<style>
  main {
    max-width: 450px;
    margin: 4rem auto;
    padding: 2rem;
  }

  .login-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 2.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: var(--text-color);
    text-align: center;
  }

  .description {
    text-align: center;
    color: var(--secondary-text);
    margin: 0 0 2rem 0;
    font-size: 0.95rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.9rem;
  }

  input[type='email'],
  input[type='text'] {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    font-size: 1rem;
    background: var(--card-bg);
    color: var(--text-color);
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: #f59e0b;
  }

  input.error {
    border-color: #ef4444;
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .code-input {
    font-size: 2rem;
    text-align: center;
    letter-spacing: 0.5rem;
    font-family: 'Courier New', monospace;
    font-weight: bold;
  }

  .checkbox-group {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
    cursor: pointer;
  }

  .checkbox-group input[type='checkbox'] {
    width: auto;
    cursor: pointer;
  }

  .checkbox-hint {
    color: var(--secondary-text);
    font-size: 0.85rem;
    margin-left: 1.5rem;
  }

  .error-message {
    background: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .btn {
    width: 100%;
    padding: 0.85rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #f59e0b;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #d97706;
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-link {
    background: none;
    border: none;
    color: var(--link-color);
    text-decoration: underline;
    cursor: pointer;
    padding: 0.5rem;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .btn-link:hover:not(:disabled) {
    color: var(--text-color);
  }

  .btn-link:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .resend-section {
    text-align: center;
    margin-top: 1rem;
  }

  .resend-cooldown {
    color: var(--secondary-text);
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    main {
      margin: 2rem auto;
      padding: 1rem;
    }

    .login-card {
      padding: 2rem 1.5rem;
    }

    h1 {
      font-size: 1.75rem;
    }
  }
</style>
