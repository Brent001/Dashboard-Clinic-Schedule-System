<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Loading from '$lib/components/Loading.svelte'; // Import the Loading component
  import Footer from '$lib/components/Footer.svelte'; // <-- Add this import
  import { goto } from '$app/navigation';

  interface Log {
    id: number;
    username: string;
    ip: string;
    time: string;
    os: string;
    browser: string;
  }

  let logs: Log[] = [];
  let filteredLogs: Log[] = []; // Filtered logs for search
  let searchQuery: string = ''; // Search query
  let username: string = '';
  let role: string = ''; // Store the user's role
  let showDropdown: boolean = false;
  let isLoading: boolean = true; // Loading state

  // Fetch logs and session data from the backend
  onMount(async () => {
    try {
      const sessionResponse = await fetch('/api/auth/session');
      if (!sessionResponse.ok) {
        goto('/'); // Redirect to login page if not authenticated
        return;
      }

      const sessionData = await sessionResponse.json();
      username = sessionData.username;
      role = sessionData.role; // Fetch the user's role

      const logsResponse = await fetch('/api/logs');
      if (logsResponse.ok) {
        logs = await logsResponse.json();
        filteredLogs = logs; // Initialize filtered logs
      } else {
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs or session data:', error);
      goto('/'); // Redirect to login page on error
    } finally {
      isLoading = false; // Stop loading once data is fetched
    }
  });

  // Filter logs based on the search query
  $: filteredLogs = logs.filter(
    (log) =>
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.browser.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  async function logout() {
    document.cookie = 'session=; Max-Age=0; path=/';
    goto('/');
  }
</script>

<main class="min-h-screen bg-gray-100">
  <!-- Navbar -->
  <div class="sticky top-0 z-50">
    <Navbar
      {username}
      {role}
      {showDropdown}
      toggleDropdown={toggleDropdown}
      logout={logout}
    />
  </div>

  <!-- Loading Spinner -->
  {#if isLoading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <Loading />
    </div>
  {:else}
    <!-- Logs Section -->
    <section class="max-w-7xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">
        {role === 'superadmin' ? 'All User Login Logs' : 'My Login Logs'}
      </h1>

      <!-- Search Box -->
      <div class="mb-4">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search logs by username, IP, OS, or browser..."
          class="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {#if filteredLogs.length > 0}
        <!-- Table for Larger Screens -->
        <div class="hidden sm:block relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">ID</th>
                <th scope="col" class="px-6 py-3">Username</th>
                <th scope="col" class="px-6 py-3">IP Address</th>
                <th scope="col" class="px-6 py-3 date-column">Date</th>
                <th scope="col" class="px-6 py-3 time-column">Time</th>
                <th scope="col" class="px-6 py-3">Operating System</th>
                <th scope="col" class="px-6 py-3">Browser</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredLogs as log, i}
                <tr class={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}>
                  <th
                    scope="row"
                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {log.id}
                  </th>
                  <td class="px-6 py-4">{log.username}</td>
                  <td class="px-6 py-4">{log.ip}</td>
                  <td class="px-6 py-4 date-column">
                    {new Date(log.time).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', // Full month name
                      day: 'numeric'
                    })}
                  </td>
                  <td class="px-6 py-4 time-column">
                    {new Date(log.time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit' // Remove seconds
                    })}
                  </td>
                  <td class="px-6 py-4">{log.os}</td>
                  <td class="px-6 py-4">{log.browser}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Cards for Mobile Screens -->
        <div class="sm:hidden space-y-4">
          {#each filteredLogs as log}
            <div class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
              <div class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-semibold text-gray-800">Log #{log.id}</h2>
              </div>
              <div class="text-sm text-gray-600 space-y-1">
                <p><strong>Username:</strong> {log.username}</p>
                <p><strong>IP Address:</strong> {log.ip}</p>
                <p><strong>Date:</strong> {new Date(log.time).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long', // Full month name
                  day: 'numeric'
                })}</p>
                <p><strong>Time:</strong> {new Date(log.time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit' // Remove seconds
                })}</p>
                <p><strong>Operating System:</strong> {log.os}</p>
                <p><strong>Browser:</strong> {log.browser}</p>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center text-gray-600">No logs available at the moment.</p>
      {/if}
    </section>
  {/if}
</main>

<Footer /> <!-- Add the Footer component here -->

<style>
  main {
    font-family: 'Inter', sans-serif;
  }

  table th {
    background-color: #f9fafb;
  }

  table tr:nth-child(even) {
    background-color: #f3f4f6;
  }

  /* Ensure Navbar is visually separate */
  .sticky {
    background-color: #ffffff; /* White background for navbar */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  }

  /* Add specific styles for the Date and Time columns */
  .date-column, .time-column {
    min-width: 150px; /* Adjust the width as needed */
  }
</style>