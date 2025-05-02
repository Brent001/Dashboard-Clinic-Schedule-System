<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';

  const SESSION_API = '/api/auth/session';
  const SCHEDULES_API = '/api/schedules';

  interface Schedule {
    id: string;
    purpose: string;
    date: string;
    time: string;
    message: string;
    showFullMessage?: boolean; // Add this property to track message expansion
  }

  let schedules: Schedule[] = [];
  let username: string = '';
  let newSchedule: Schedule = { id: '', purpose: '', date: '', time: '', message: '' };
  let showForm: boolean = false;
  let editingSchedule: Schedule | null = null; // Track the schedule being edited
  let showDropdown: boolean = false;

  // Fetch schedules from the server
  async function fetchSchedules() {
    try {
      const response = await fetch(SCHEDULES_API);
      if (response.ok) {
        const fetchedSchedules = await response.json();
        schedules = fetchedSchedules.map((schedule: Partial<Schedule>) => ({
          id: schedule.id ?? crypto.randomUUID(),
          purpose: schedule.purpose ?? '',
          date: schedule.date ?? '',
          time: schedule.time ?? '',
          message: schedule.message ?? '',
        })) as Schedule[];
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  }

  onMount(async () => {
    try {
      const sessionResponse = await fetch(SESSION_API);
      if (!sessionResponse.ok) {
        goto('/login');
        return;
      }

      const sessionData = await sessionResponse.json();
      username = sessionData.username;

      await fetchSchedules(); // Fetch schedules on mount
    } catch (error) {
      console.error('Error fetching session or schedules:', error);
      goto('/');
    }
  });

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  async function logout() {
    document.cookie = 'session=; Max-Age=0; path=/';
    goto('/login');
  }

  async function addOrUpdateSchedule() {
    try {
      if (editingSchedule) {
        // Update existing schedule
        const response = await fetch(`/api/schedules`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSchedule),
        });

        if (response.ok) {
          await fetchSchedules(); // Refresh schedules after update
          editingSchedule = null; // Clear editing state
        } else {
          const error = await response.json();
          console.error('Failed to update schedule:', error);
          alert(error.error || 'Failed to update schedule.');
        }
      } else {
        // Add new schedule
        const response = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSchedule),
        });

        if (response.ok) {
          await fetchSchedules(); // Refresh schedules after adding
        } else {
          const error = await response.json();
          console.error('Failed to add schedule:', error);
          alert(error.error || 'Failed to add schedule.');
        }
      }

      // Reset form and close it
      newSchedule = { id: '', purpose: '', date: '', time: '', message: '' };
      showForm = false;
    } catch (error) {
      console.error('Error adding or updating schedule:', error);
      alert('An error occurred while saving the schedule.');
    }
  }

  function openEditModal(schedule: Schedule) {
    editingSchedule = { ...schedule }; // Set the schedule being edited
    newSchedule = { ...schedule }; // Populate the form with the schedule's data
    showForm = true; // Open the form
  }

  async function deleteSchedule(id: string) {
    try {
      const response = await fetch(`/api/schedules`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchSchedules(); // Refresh schedules after deletion
      } else {
        const error = await response.json();
        console.error('Failed to delete schedule:', error);
        alert(error.error || 'Failed to delete schedule.');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('An error occurred while deleting the schedule.');
    }
  }
</script>

<main class="min-h-screen bg-gray-100">
  <!-- Navbar -->
  <Navbar
    {username}
    {showDropdown}
    toggleDropdown={toggleDropdown}
    logout={logout}
  />

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Announcements</h2>
      <button
        on:click={() => {
          editingSchedule = null; // Clear editing state
          newSchedule = { id: '', purpose: '', date: '', time: '', message: '' }; // Reset form
          showForm = !showForm;
        }}
        class="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
      >
        {showForm ? 'Close Form' : 'Add Announcement'}
      </button>
    </div>

    {#if showForm}
      <!-- Add/Edit Announcement Form -->
      <div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
          <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {editingSchedule ? 'Edit Announcement' : 'Add New Announcement'}
          </h3>
          <form on:submit|preventDefault={addOrUpdateSchedule} class="space-y-4">
            <div>
              <label for="purpose" class="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <select
                id="purpose"
                bind:value={newSchedule.purpose}
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="" disabled>Select purpose</option>
                <option value="Dental Checkup">Dental Checkup</option>
                <option value="Medical Checkup">Medical Checkup</option>
              </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  id="date"
                  bind:value={newSchedule.date}
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label for="time" class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  id="time"
                  bind:value={newSchedule.time}
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                id="message"
                bind:value={newSchedule.message}
                required
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your message here..."
              ></textarea>
            </div>
            <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                on:click={() => (showForm = false)}
                class="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {editingSchedule ? 'Update Announcement' : 'Save Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <!-- Announcements List -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {#each schedules as schedule}
        <div class="bg-white p-4 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold text-green-600">{schedule.purpose}</h3>
          <p class="text-sm text-gray-600">{schedule.date} at {schedule.time}</p>
          <p class="text-sm text-gray-500 italic mt-2" style="white-space: pre-wrap;">
            {#if schedule.showFullMessage}
              "{schedule.message}"
            {:else}
              "{schedule.message.slice(0, 100)}{schedule.message.length > 100 ? '...' : ''}"
            {/if}
          </p>
          {#if schedule.message.length > 100}
            <button
              on:click={() => (schedule.showFullMessage = !schedule.showFullMessage)}
              class="text-sm text-blue-500 hover:underline focus:outline-none"
            >
              {schedule.showFullMessage ? 'Read Less' : 'Read More'}
            </button>
          {/if}
          <div class="flex justify-end space-x-2 mt-4">
            <button
              on:click={() => openEditModal(schedule)}
              class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Edit
            </button>
            <button
              on:click={() => deleteSchedule(schedule.id)}
              class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</main>

<style>
  main {
    font-family: 'Inter', sans-serif;
  }

  @media (max-width: 640px) {
    h2 {
      font-size: 1.125rem; /* Adjust heading size for smaller screens */
    }

    .grid {
      gap: 1rem; /* Reduce grid gap for smaller screens */
    }

    button {
      font-size: 0.875rem; /* Adjust button font size for smaller screens */
    }
  }
</style>