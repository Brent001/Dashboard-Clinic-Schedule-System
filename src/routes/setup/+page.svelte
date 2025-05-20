<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const SESSION_API = '/api/auth/session';

  let formUsername: string = '';
  let password: string = '';
  let confirmPassword: string = '';
  let errorMessage: string = '';
  let successMessage: string = '';

  let showPassword: boolean = false;
  let showConfirmPassword: boolean = false;

  // Only allow superadmin registration on setup page
  let onlySuperadmin = true;

  // On mount, check session and only allow temp user
  onMount(async () => {
    try {
      const sessionResponse = await fetch(SESSION_API);
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        // Only allow if role is 'temp'
        if (sessionData.role !== 'temp') {
          goto('/'); // Redirect if not temp user
        }
        // Optionally, you can also check username === 'admin'
      } else {
        goto('/'); // Redirect if not logged in
      }
    } catch (error) {
      goto('/'); // Redirect on error
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();

    // Prevent username "admin"
    if (formUsername.trim().toLowerCase() === 'admin') {
      errorMessage = 'The username "admin" is reserved and cannot be used.';
      successMessage = '';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match.';
      successMessage = '';
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to create a Superadmin account for "${formUsername}"?`
    );

    if (!isConfirmed) {
      return;
    }

    const response = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formUsername,
        password,
        role: 'superadmin',
      }),
    });

    const result = await response.json();

    if (response.ok) {
      successMessage = 'Superadmin account created successfully!';
      errorMessage = '';
      formUsername = '';
      password = '';
      confirmPassword = '';
      setTimeout(() => goto('/'), 1500);
    } else {
      errorMessage = result.error || 'Failed to create account.';
      successMessage = '';
    }
  }
</script>

<div class="setup-bg min-h-screen flex flex-col items-center justify-center px-2 py-8">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center">
    <div class="flex flex-col items-center mb-6">
      <div class="setup-circle mb-4 flex items-center justify-center">
        <i class="fas fa-user-shield text-3xl text-green-600"></i>
      </div>
      <h1 class="text-2xl font-bold text-gray-800 mb-1 text-center">Dashboard Setup</h1>
      <p class="text-gray-500 text-center text-sm">
        Welcome! Let's create your <span class="font-semibold text-green-600">Superadmin</span> account to get started.
      </p>
    </div>
    <form on:submit={handleSubmit} class="w-full space-y-4">
      {#if errorMessage}
        <div class="text-red-500 text-sm text-center">{errorMessage}</div>
      {/if}
      {#if successMessage}
        <div class="text-green-500 text-sm text-center">{successMessage}</div>
      {/if}
      <div>
        <label for="formUsername" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          id="formUsername"
          type="text"
          bind:value={formUsername}
          required
          autocomplete="username"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          placeholder="Enter username"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div class="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            required
            autocomplete="new-password"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm pr-10"
            placeholder="Enter password"
            on:copy|preventDefault
            on:paste|preventDefault
            on:contextmenu|preventDefault
          />
          <button
            type="button"
            on:click={() => (showPassword = !showPassword)}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabindex="-1"
          >
            <i class={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </button>
        </div>
      </div>
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <div class="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            bind:value={confirmPassword}
            required
            autocomplete="new-password"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm pr-10"
            placeholder="Re-enter password"
            on:copy|preventDefault
            on:paste|preventDefault
            on:contextmenu|preventDefault
          />
          <button
            type="button"
            on:click={() => (showConfirmPassword = !showConfirmPassword)}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            tabindex="-1"
          >
            <i class={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </button>
        </div>
      </div>
      <div class="flex flex-col items-center mt-4">
        <button
          type="submit"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 text-base font-semibold"
        >
          Create Superadmin Account
        </button>
        <div class="text-xs text-gray-400 mt-2 text-center">
          This step is required only once for initial setup.
        </div>
      </div>
    </form>
  </div>
  <div class="mt-8 text-center text-xs text-gray-400">
    &copy; {new Date().getFullYear()} Metro Dagupan Clinic System. All rights reserved.
  </div>
</div>

<style>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

  .setup-bg {
    background: linear-gradient(135deg, #e6f9f0 0%, #f8fafc 100%);
    min-height: 100vh;
  }
  .setup-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #e6f9f0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px 0 rgba(16, 185, 129, 0.08);
  }
</style>