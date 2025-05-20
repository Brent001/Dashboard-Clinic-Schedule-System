<script>
  import { page } from '$app/stores';

  const year = new Date().getFullYear();

  $: status = $page.status;
  $: message = $page.error?.message || 'An unexpected error occurred.';

  // Custom title and description for setup errors
  $: errorTitle =
    status === 403 && message.toLowerCase().includes('only temp users can access the setup page')
      ? 'Forbidden'
      : status === 401
      ? 'Unauthorized'
      : 'Setup Error';

  $: errorDescription =
    status === 403 && message.toLowerCase().includes('only temp users can access the setup page')
      ? 'Access to setup is restricted. Only first-time (temp) users can use the setup page.'
      : status === 401
      ? 'You must be logged in as a temp user to access the setup page.'
      : message;
</script>

<main class="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 px-4">
  <div class="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-green-200 dark:border-green-700 flex flex-col items-center">
    <img src="/logo/logo.png" alt="Clinic System Logo" class="h-16 w-auto mb-6 rounded-full border border-yellow-400 bg-white shadow" />
    <h1 class="text-3xl sm:text-5xl font-bold text-green-700 dark:text-yellow-300 mb-2 break-words">{status}</h1>
    <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-yellow-200 mb-4 text-center break-words">{errorTitle}</h2>
    <p class="mb-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 text-center break-words">{errorDescription}</p>
    <div class="mt-6 text-xs text-gray-400 text-center">
      &copy; {year} Clinic System Dashboard
    </div>
  </div>
</main>

<style>
  @media (max-width: 640px) {
    h1 {
      font-size: 2.5rem;
    }
    h2 {
      font-size: 1.25rem;
    }
    p {
      font-size: 1rem;
    }
    .p-6 {
      padding: 1.25rem;
    }
  }
</style>