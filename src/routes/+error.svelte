<script lang="ts">
  export let error: { name?: string; message?: string };
  export let status: number;

  const titles = {
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Page Not Found',
    500: 'Server Error'
  } as const;

  const descriptions = {
    401: 'You must be logged in to access this page.',
    403: 'You do not have permission to access this page.',
    404: "Sorry, we can't find that page. You'll find lots to explore on the home page.",
    500: 'A server error occurred. Please try refreshing the page.'
  } as const;

  $: errorTitle = status
    ? `${status} ${titles[status as keyof typeof titles] || error?.name || 'Error'}`
    : error?.name || 'Error';

  $: errorDescription =
    error?.message ||
    descriptions[status as keyof typeof descriptions] ||
    'Sorry, something went wrong. Please try again later.';
</script>

<main class="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 px-4">
  <div class="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-green-200 dark:border-green-700 flex flex-col items-center">
    <img src="/logo/logo.png" alt="Clinic System Logo" class="h-16 w-auto mb-6 rounded-full border border-yellow-400 bg-white shadow" />
    <h1 class="text-6xl sm:text-7xl font-extrabold text-green-700 dark:text-yellow-300 mb-2 break-words">{status}</h1>
    <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-yellow-200 mb-4 text-center break-words">{errorTitle}</h2>
    <p class="mb-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 text-center break-words">{errorDescription}</p>
    {#if status === 404}
      <a href="/" class="mt-2 text-lg text-green-700 dark:text-yellow-200 hover:underline font-semibold">Go back home</a>
    {/if}
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
    a {
      font-size: 1rem;
    }
    .p-6 {
      padding: 1.25rem;
    }
  }
</style>