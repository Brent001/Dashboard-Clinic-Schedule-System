<script lang="ts">
  import Loading from '$lib/components/Loading.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let username = '';
  let password = '';
  let showPassword = false;
  let isLoading = false;
  let ready = false;

  onMount(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session.role && session.role !== 'temp') {
          goto('/dashboard');
          return;
        }
      }
    } catch (e) {
      // Ignore errors, allow login page to load
    }
    ready = true;
  });

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      alert('Username and password are required.');
      return;
    }

    isLoading = true;
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      isLoading = false;
      if (!response.ok) {
        const error = await response.json();
        console.error('Error response from server:', error);

        switch (response.status) {
          case 401:
            alert('Unauthorized: Invalid username or password.');
            break;
          case 403:
            alert('Forbidden: Your account is disabled or you lack access.');
            break;
          default:
            alert(error.error || 'Login failed. Please try again.');
        }
        return;
      }

      const data = await response.json();

      if (data.redirect) {
        window.location = data.redirect;
        return;
      }

      if (data.status === 'disable') {
        alert('Your account is disabled. Please contact the administrator.');
        return;
      }

      if (data.role !== 'temp') {
        console.log('Login successful');
      }

      window.location.href = '/dashboard';
    } catch (error) {
      isLoading = false;
      console.error('An error occurred:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  }
</script>

{#if !ready}
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
    <Loading />
  </div>
{:else}
  <main class="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 px-4">
    <div class="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
      <div class="text-center mb-4">
        <img src="/logo/logo.png" alt="Clinic Logo" class="h-12 mx-auto mb-2" />
        <h1 class="text-xl font-bold text-gray-800">Welcome Back</h1>
        <p class="text-xs text-gray-600">Log in to access your account</p>
      </div>
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <label for="username" class="block text-xs font-medium text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            bind:value={username}
            placeholder="Enter your username"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </div>
        <div>
          <label for="password" class="block text-xs font-medium text-gray-700">Password</label>
          <div class="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              bind:value={password}
              placeholder="Enter your password"
              required
              class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
          <div class="mt-1 flex items-center">
            <input
              type="checkbox"
              id="show-password"
              bind:checked={showPassword}
              class="h-3.5 w-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label for="show-password" class="ml-2 text-xs text-gray-700">Show Password</label>
          </div>
        </div>
        <button
          type="submit"
          class="w-full px-3 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  </main>
{/if}

<style>
  @media (max-width: 640px) {
    h1 {
      font-size: 1.5rem;
    }
    p {
      font-size: 0.75rem;
    }
    button {
      font-size: 0.75rem;
    }
  }
</style>