<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';

  let username = '';
  let password = '';
  let confirmPassword = '';
  let errorMessage = '';
  let successMessage = '';
  let showDropdown = false; // Add this state for the hamburger menu

  function toggleDropdown() {
    showDropdown = !showDropdown; // Toggle the dropdown state
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match.';
      return;
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (response.ok) {
      successMessage = 'Account created successfully!';
      errorMessage = '';
      setTimeout(() => goto('/login'), 2000);
    } else {
      errorMessage = result.error || 'Failed to create account.';
      successMessage = '';
    }
  }
</script>

<Navbar 
  username={username} 
  {showDropdown} 
  toggleDropdown={toggleDropdown} 
  logout={() => goto('/')} 
/>

<div class="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
  <h1 class="text-2xl font-bold mb-4 text-center">Create Account</h1>
  {#if errorMessage}
    <div class="text-red-500 text-sm mb-4">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="text-green-500 text-sm mb-4">{successMessage}</div>
  {/if}
  <form on:submit={handleSubmit}>
    <div class="mb-4">
      <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
      <input
        id="username"
        type="text"
        bind:value={username}
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
      />
    </div>
    <div class="mb-4">
      <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
      <input
        id="password"
        type="password"
        bind:value={password}
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
      />
    </div>
    <div class="mb-4">
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
      <input
        id="confirmPassword"
        type="password"
        bind:value={confirmPassword}
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
      />
    </div>
    <button
      type="submit"
      class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
    >
      Create Account
    </button>
  </form>
</div>