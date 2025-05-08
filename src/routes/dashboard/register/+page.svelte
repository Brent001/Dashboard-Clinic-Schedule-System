<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation'; // Import goto for redirection
  import Navbar from '$lib/components/Navbar.svelte';

  const SESSION_API = '/api/auth/session';
  const LOGOUT_API = '/api/auth/logout'; // Add logout API endpoint

  export let loggedInUsername: string = ''; // Username for the Navbar
  export let role: string = 'user'; // Default role for the Navbar

  let formUsername: string = ''; // Username for the account creation form
  let formRole: string = 'user'; // Default role for the account creation form
  let password: string = '';
  let confirmPassword: string = '';
  let errorMessage: string = '';
  let successMessage: string = '';
  let showDropdown: boolean = false;

  // State for toggling password visibility
  let showPassword: boolean = false;
  let showConfirmPassword: boolean = false;

  // Variables for modal functionality
  let modalType: 'changePassword' | 'deleteUser' | null = null;
  let selectedUser: { username: string } | null = null;
  let oldPassword: string = '';
  let newPassword: string = '';
  let confirmPasswordModal: string = '';
  let showOldPassword: boolean = false;
  let showNewPassword: boolean = false;
  let showConfirmPasswordModal: boolean = false;

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeModal() {
    modalType = null;
    selectedUser = null;
    oldPassword = '';
    newPassword = '';
    confirmPasswordModal = '';
    showOldPassword = false;
    showNewPassword = false;
    showConfirmPasswordModal = false;
  }

  async function fetchUsers() {
    // Placeholder function for fetching users
    console.log('Fetching users...');
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match.';
      successMessage = '';
      return;
    }

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to create an account for "${formUsername}" with the role "${formRole}"?`
    );

    if (!isConfirmed) {
      return; // Exit if the user cancels
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: formUsername, password, role: formRole }) // Use formRole here
    });

    const result = await response.json();

    if (response.ok) {
      successMessage = 'Account created successfully!';
      errorMessage = '';

      // Clear all input fields
      formUsername = ''; // Clear the username field
      formRole = 'user'; // Reset the role to default
      password = ''; // Clear the password field
      confirmPassword = ''; // Clear the confirm password field
    } else {
      errorMessage = result.error || 'Failed to create account.';
      successMessage = '';
    }
  }

  async function logout() {
    try {
      // Call the logout API
      const response = await fetch(LOGOUT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Failed to log out:', await response.text());
        alert('An error occurred while logging out.');
        return;
      }

      // Redirect to the home page
      goto('/');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred while logging out.');
    }
  }

  async function handleModalAction() {
    if (!selectedUser) return;

    try {
      if (modalType === 'deleteUser') {
        const response = await fetch(`/api/users`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: selectedUser.username }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to delete user:', errorData);
          alert(`Failed to delete user: ${errorData.error}`);
        } else {
          alert(`User "${selectedUser.username}" deleted successfully`);
          await fetchUsers(); // Refresh the user list
        }
      } else if (modalType === 'changePassword') {
        console.log('Changing password...');
        // Validate new password and confirm password
        if (!newPassword || newPassword !== confirmPasswordModal) {
          alert('New password and confirm password do not match.');
          return;
        }

        // Send the request to update the password
        const response = await fetch(`/api/users/${selectedUser.username}/password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to update password:', errorData);
          alert(`Failed to update password: ${errorData.error}`);
        } else {
          alert('Password updated successfully');
          await fetchUsers(); // Refresh the user list
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('An error occurred while deleting the user.');
    } finally {
      closeModal();
    }
  }

  // Fetch session data
  onMount(async () => {
    try {
      const sessionResponse = await fetch(SESSION_API);
      if (!sessionResponse.ok) {
        goto('/'); // Redirect to home if session is invalid
        return;
      }

      const sessionData = await sessionResponse.json();
      loggedInUsername = sessionData.username; // Set the username for the Navbar
      role = sessionData.role || 'user'; // Set the role for the Navbar
    } catch (error) {
      console.error('Error fetching session data:', error);
      goto('/'); // Redirect to home on error
    }
  });
</script>

<!-- Navbar Section -->
<div class="w-full fixed top-0 left-0 z-50 bg-white shadow-md">
  <Navbar
    username={loggedInUsername}
    {role}
    {showDropdown}
    toggleDropdown={toggleDropdown}
    logout={logout}
  />
</div>

<!-- Main Content Section -->
<div class="pt-16 min-h-screen bg-gray-100">
  <div class="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md sm:max-w-lg md:max-w-xl">
    <h1 class="text-2xl font-bold mb-4 text-center">Create Account</h1>
    {#if errorMessage}
      <div class="text-red-500 text-sm mb-4">{errorMessage}</div>
    {/if}
    {#if successMessage}
      <div class="text-green-500 text-sm mb-4">{successMessage}</div>
    {/if}
    <form on:submit={handleSubmit} class="space-y-4">
      <!-- Username Field -->
      <div>
        <label for="formUsername" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          id="formUsername"
          type="text"
          bind:value={formUsername}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        />
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm pr-10"
          />
          <button
            type="button"
            on:click={() => (showPassword = !showPassword)}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i class={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </button>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
        <div class="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            bind:value={confirmPassword}
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm pr-10"
          />
          <button
            type="button"
            on:click={() => (showConfirmPassword = !showConfirmPassword)}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            <i class={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </button>
        </div>
      </div>

      <!-- Role Dropdown -->
      <div>
        <label for="formRole" class="block text-sm font-medium text-gray-700">Role</label>
        <select
          id="formRole"
          bind:value={formRole}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        >
          <option value="user">User</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 text-sm"
      >
        Create Account
      </button>
    </form>
  </div>
</div>

{#if modalType === 'changePassword'}
  <p class="mb-4 text-gray-600">
    Change the password for user "{selectedUser?.username}".
  </p>
  <label class="block mb-2">
    Old Password:
    <div class="flex items-center">
      <input
        type={showOldPassword ? 'text' : 'password'}
        bind:value={oldPassword}
        class="w-full border border-gray-300 rounded px-2 py-1"
        placeholder="Enter old password"
      />
      <button
        on:click={() => (showOldPassword = !showOldPassword)}
        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={showOldPassword ? 'Hide old password' : 'Show old password'}
      >
        <i class={showOldPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
      </button>
    </div>
  </label>
  <label class="block mb-2">
    New Password:
    <div class="flex items-center">
      <input
        type={showNewPassword ? 'text' : 'password'}
        bind:value={newPassword}
        class="w-full border border-gray-300 rounded px-2 py-1"
        placeholder="Enter new password"
      />
      <button
        on:click={() => (showNewPassword = !showNewPassword)}
        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
      >
        <i class={showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
      </button>
    </div>
  </label>
  <label class="block mb-4">
    Confirm Password:
    <div class="flex items-center">
      <input
        type={showConfirmPasswordModal ? 'text' : 'password'}
        bind:value={confirmPasswordModal}
        class="w-full border border-gray-300 rounded px-2 py-1"
        placeholder="Confirm new password"
      />
      <button
        on:click={() => (showConfirmPasswordModal = !showConfirmPasswordModal)}
        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={showConfirmPasswordModal ? 'Hide confirm password' : 'Show confirm password'}
      >
        <i class={showConfirmPasswordModal ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
      </button>
    </div>
  </label>
{/if}

<style>
  /* Add FontAwesome for icons */
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>