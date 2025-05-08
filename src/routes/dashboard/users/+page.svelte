<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';

  const SESSION_API = '/api/auth/session';
  const LOGOUT_API = '/api/auth/logout';

  interface User {
    username: string;
    role: string;
    status: 'enable' | 'disable';
    password?: string;
    showPassword?: boolean;
  }

  let users: User[] = [];
  let username: string = '';
  let role: string = ''; // Store the user's role
  let showDropdown: boolean = false;

  // Modal state
  let showModal: boolean = false;
  let modalType: 'changePassword' | 'disableUser' | 'deleteUser' | 'editUser' | null = null;
  let selectedUser: User | null = null;
  let oldPassword: string = '';
  let selectedUsername: string = ''; // Temporary variable for binding
  let newPassword: string = '';
  let confirmPassword: string = '';
  let showOldPassword: boolean = false; // For the "Change Password" modal
  let showNewPassword: boolean = false; // For the "New Password" field
  let showConfirmPassword: boolean = false; // For the "Confirm Password" field

  // Fetch session data and users
  onMount(async () => {
    try {
      // Fetch session data
      const sessionResponse = await fetch(SESSION_API);
      if (!sessionResponse.ok) {
        goto('/'); // Redirect to login if session is invalid
        return;
      }

      const sessionData = await sessionResponse.json();
      username = sessionData.username;
      role = sessionData.role;

      // Fetch users
      await fetchUsers();
    } catch (error) {
      console.error('Error fetching session or users:', error);
      goto('/'); // Redirect to login on error
    }
  });

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        users = await response.json();
        // Add a `showPassword` property to each user for the table
        users = users.map(user => ({ ...user, showPassword: false }));
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  async function openModal(type: 'editUser' | 'disableUser' | 'deleteUser', user: User) {
    modalType = type;
    selectedUser = { ...user }; // Clone the user object to avoid direct mutation
    showModal = true;

    // Reset modal-specific fields
    oldPassword = '';
    newPassword = '';
    confirmPassword = '';
    showOldPassword = false;

    if (type === 'editUser') {
      try {
        const response = await fetch(`/api/users/${user.username}/password`);
        if (response.ok) {
          const data = await response.json();
          oldPassword = data.password; // Set the old password
        } else {
          console.error('Failed to fetch old password');
        }
      } catch (error) {
        console.error('Error fetching old password:', error);
      }
    }
  }

  async function handleModalAction() {
    if (!selectedUser) return;

    try {
      if (modalType === 'editUser') {
        const response = await fetch(`/api/users`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: selectedUser.username,
            newUsername: selectedUsername || selectedUser.username,
            newPassword: newPassword || undefined,
            role: selectedUser.role,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Failed to edit user: ${errorData.error}`);
        } else {
          alert(`User "${selectedUser.username}" updated successfully`);
          await fetchUsers(); // Refresh the user list
        }
      } else if (modalType === 'changePassword') {
        if (!newPassword || newPassword !== confirmPassword) {
          alert('New password and confirm password do not match.');
          return;
        }

        const response = await fetch(`/api/users/${selectedUser.username}/password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Failed to update password: ${errorData.error}`);
        } else {
          alert('Password updated successfully');
          await fetchUsers();
        }
      } else if (modalType === 'deleteUser') {
        const response = await fetch(`/api/users`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: selectedUser.username }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Failed to delete user: ${errorData.error}`);
        } else {
          alert(`User "${selectedUser.username}" deleted successfully`);
          await fetchUsers();
        }
      } else if (modalType === 'disableUser') {
        const newStatus = selectedUser.status === 'enable' ? 'disable' : 'enable';
        const response = await fetch(`/api/users`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: selectedUser.username, status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Failed to update status: ${errorData.error}`);
        } else {
          alert(`User "${selectedUser.username}" status updated to "${newStatus}"`);
          await fetchUsers();
        }
      }
    } catch (error) {
      alert('An error occurred.');
      console.error('Error performing action:', error);
    } finally {
      closeModal();
    }
  }

  function closeModal() {
    showModal = false;
    selectedUser = null;
    modalType = null;
  }

  async function updateRole(username: string, newRole: string) {
    try {
      const response = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role: newRole })
      });

      if (response.ok) {
        alert('Role updated successfully');
        await fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`Failed to update role: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('An error occurred while updating the role.');
    }
  }

  async function updateStatus(username: string, newStatus: 'enable' | 'disable') {
    try {
      const response = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, status: newStatus })
      });

      if (response.ok) {
        alert('Status updated successfully');
        await fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status.');
    }
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  async function logout() {
    try {
      const response = await fetch(LOGOUT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        goto('/'); // Redirect to login page after logout
      } else {
        console.error('Failed to log out:', await response.text());
        alert('An error occurred while logging out.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred while logging out.');
    }
  }
</script>

<link
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
  rel="stylesheet"
/>

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

  <!-- Users Section -->
  <section class="max-w-7xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>

    {#if users.length > 0}
      <!-- Table for Larger Screens -->
      <div class="hidden sm:block relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">Username</th>
              <th scope="col" class="px-6 py-3">Role</th>
              <th scope="col" class="px-6 py-3">Status</th>
              <th scope="col" class="px-6 py-3">Password</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user, i}
              <tr class={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.username}</td>
                <td class="px-6 py-4">
                  <select
                    bind:value={user.role}
                    on:change={() => updateRole(user.username, user.role)}
                    class="border border-gray-300 rounded px-1 py-1 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </td>
                <td class="px-6 py-4">
                  <select
                    bind:value={user.status}
                    on:change={() => updateStatus(user.username, user.status)}
                    class="border border-gray-300 rounded px-1 py-1 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="enable">Enable</option>
                    <option value="disable">Disable</option>
                  </select>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <input
                      type={user.showPassword ? 'text' : 'password'}
                      value={user.password}
                      readonly
                      class="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 cursor-not-allowed w-32"
                    />
                    <button
                      on:click={() => {
                        user.showPassword = !user.showPassword;
                        users = [...users]; // Trigger reactivity
                      }}
                      class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={user.showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i class={user.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                    </button>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <button
                    on:click={() => openModal('editUser', user)}
                    class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 ml-2"
                  >
                    Change Password
                  </button>
                  <button
                    on:click={() => openModal('deleteUser', user)}
                    class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Cards for Mobile Screens -->
      <div class="sm:hidden space-y-4">
        {#each users as user}
          <div class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-600 mb-2">
              <strong>Username:</strong> {user.username}
            </p>
            <div class="mb-4 flex flex-wrap gap-4">
              <div class="flex items-center">
                <label for="role-{user.username}" class="text-sm text-gray-600 mr-2"><strong>Role:</strong></label>
                <select
                  id="role-{user.username}"
                  bind:value={user.role}
                  on:change={() => updateRole(user.username, user.role)}
                  class="border border-gray-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div class="flex items-center">
                <label for="status-{user.username}" class="text-sm text-gray-600 mr-2"><strong>Status:</strong></label>
                <select
                  id="status-{user.username}"
                  bind:value={user.status}
                  on:change={() => updateStatus(user.username, user.status)}
                  class="border border-gray-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="enable">Enable</option>
                  <option value="disable">Disable</option>
                </select>
              </div>
            </div>
            <div class="mb-4">
              <label for="password-{user.username}" class="text-sm text-gray-600"><strong>Password:</strong></label>
              <div class="flex items-center mt-1">
                <input
                  id="password-{user.username}"
                  type={user.showPassword ? 'text' : 'password'}
                  value={user.password}
                  readonly
                  class="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 cursor-not-allowed w-full"
                />
                <button
                  on:click={() => {
                    user.showPassword = !user.showPassword;
                    users = [...users]; // Trigger reactivity
                  }}
                  class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={user.showPassword ? 'Hide password' : 'Show password'}
                >
                  <i class={user.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                on:click={() => openModal('editUser', user)}
                class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Change Password
              </button>
              <button
                on:click={() => openModal('deleteUser', user)}
                class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-center text-gray-600">No users available at the moment.</p>
    {/if}
  </section>
</main>

{#if showModal}
  <div class="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
    <div class="frosted-glass p-6 rounded shadow-md w-96">
      <h2 class="text-xl font-bold mb-4">
        {#if modalType === 'changePassword'} Change Password
        {:else if modalType === 'disableUser'} {selectedUser?.status === 'disable' ? 'Enable User' : 'Disable User'}
        {:else if modalType === 'deleteUser'} Delete User
        {:else if modalType === 'editUser'} Edit User
        {/if}
      </h2>

      {#if modalType === 'changePassword'}
        <p class="mb-4 text-gray-600">
          Are you sure you want to change the password for user "{selectedUser?.username}"? This action cannot be undone.
        </p>
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
              type={showConfirmPassword ? 'text' : 'password'}
              bind:value={confirmPassword}
              class="w-full border border-gray-300 rounded px-2 py-1"
              placeholder="Confirm new password"
            />
            <button
              on:click={() => (showConfirmPassword = !showConfirmPassword)}
              class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              <i class={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>
        </label>
      {/if}

      {#if modalType === 'editUser'}
        <label for="username-input" class="block mb-2">
          Username:
        </label>
        {#if selectedUser}
          <input
            id="username-input"
            type="text"
            bind:value={selectedUser.username}
            class="w-full border border-gray-300 rounded px-2 py-1"
            placeholder="Enter username"
            required
          />

          <!-- Password Fields -->
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
                type={showConfirmPassword ? 'text' : 'password'}
                bind:value={confirmPassword}
                class="w-full border border-gray-300 rounded px-2 py-1"
                placeholder="Confirm new password"
              />
              <button
                on:click={() => (showConfirmPassword = !showConfirmPassword)}
                class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                <i class={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
          </label>
        {/if}
      {/if}

      <p class="mb-4">
        {#if modalType === 'disableUser'}
          Are you sure you want to {selectedUser?.status === 'disable' ? 'enable' : 'disable'} user "{selectedUser?.username}"?
        {:else if modalType === 'deleteUser'}
          Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
        {/if}
      </p>

      <div class="flex justify-end">
        <button on:click={closeModal} class="px-4 py-2 bg-gray-300 rounded mr-2">Cancel</button>
        <button on:click={handleModalAction} class="px-4 py-2 bg-green-600 text-white rounded">
          {#if modalType === 'changePassword'} Save
          {:else if modalType === 'disableUser'} Confirm
          {:else if modalType === 'deleteUser'} Delete
          {:else if modalType === 'editUser'} Save
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

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

  .backdrop-blur-sm {
    backdrop-filter: blur(10px); /* Stronger blur effect */
    background-color: rgba(255, 255, 255, 0.2); /* Light transparent white */
  }

  .frosted-glass {
    background: rgba(255, 255, 255, 0.7); /* Semi-transparent white */
    backdrop-filter: blur(15px); /* Frosted glass effect */
    border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border for glass effect */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Soft shadow */
  }
</style>