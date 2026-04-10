<script lang="ts">
  import './app.css';
  import Router, { link } from '@bmlt-enabled/svelte-spa-router';
  import active from '@bmlt-enabled/svelte-spa-router/active';
  import Decisions from './pages/Decisions.svelte';
  import Board from './pages/Board.svelte';
  import Reference from './pages/Reference.svelte';

  const routes = {
    '/': Decisions,
    '/board': Board,
    '/reference': Reference
  };

  let darkMode = $state(false);

  function toggleDark() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark', darkMode);
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Header -->
  <header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <div>
        <a href="/" use:link class="block">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">WSC Decisions Archive</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">NA World Service Conference decisions from 2000–2026</p>
        </a>
      </div>
      <div class="flex items-center gap-4">
        <nav class="flex gap-1">
          <a
            href="/"
            use:link
            use:active={{
              className: 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400',
              inactiveClassName: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }}
            class="px-3 py-2 text-sm font-medium"
          >
            Decisions
          </a>
          <a
            href="/reference"
            use:link
            use:active={{
              className: 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400',
              inactiveClassName: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }}
            class="px-3 py-2 text-sm font-medium"
          >
            Reference
          </a>
        </nav>
        <button class="rounded-lg border border-gray-300 p-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" onclick={toggleDark}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-6">
    <Router {routes} />
  </main>

  <footer class="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
    Data extracted from <a href="https://na.org/conference/" class="text-primary-600 hover:underline" target="_blank" rel="noopener">na.org/conference</a> WSC Summary of Decisions documents.
  </footer>
</div>
