<script lang="ts">
  import { fade, slide } from 'svelte/transition';

  export let username: string;
  export let role: string; // Accept the role as a prop
  export let showDropdown: boolean;
  export let toggleDropdown: () => void;
  export let logout: () => void;

  function handleLogout() {
    logout();
  }
</script>

<header class="bg-white shadow-md">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <a href="/dashboard">
          <img src="/logo/logo.png" alt="Clinic Dashboard Logo" class="h-8 w-auto" />
        </a>
      </div>

      <!-- Hamburger Menu Button -->
      <div class="relative">
        <button
          type="button"
          class="text-green-600 hover:text-green-800 transition duration-300"
          on:click={toggleDropdown}
          aria-label="Toggle navigation menu"
        >
          <svg
            class="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        {#if showDropdown}
          <div
            class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
            transition:fade|slide={{ duration: 300 }}
          >
            <!-- Username Section -->
            <div class="px-4 py-2 text-gray-600 font-medium">
              Logged in as: {username}
            </div>
            <hr class="border-gray-200" />

            <!-- Navigation Links -->
            <a href="/dashboard" class="block px-4 py-2 text-gray-600 hover:bg-green-100 hover:text-green-800">
              Dashboard
            </a>
            <a href="/dashboard/logs" class="block px-4 py-2 text-gray-600 hover:bg-green-100 hover:text-green-800">
              {role === 'superadmin' ? 'All User Logs' : role === 'user' ? 'My Logs' : 'Logs'}
            </a>
            {#if role === 'superadmin'}
              <a href="/dashboard/register" class="block px-4 py-2 text-gray-600 hover:bg-green-100 hover:text-green-800">
                Create New Account
              </a>
              <a href="/dashboard/users" class="block px-4 py-2 text-gray-600 hover:bg-green-100 hover:text-green-800">
                View All Users
              </a>
            {/if}

            <!-- Logout Button -->
            <button
              on:click={handleLogout}
              class="block w-full text-left px-4 py-2 text-gray-600 hover:bg-green-100 hover:text-green-800"
            >
              Logout
            </button>
          </div>
        {/if}
      </div>
    </div>
  </nav>
</header>

<style>
  header {
    font-family: 'Inter', sans-serif;
  }
</style>