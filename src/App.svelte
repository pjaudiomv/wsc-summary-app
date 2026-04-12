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

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  let darkMode = $state(prefersDark.matches);
  document.documentElement.classList.toggle('dark', prefersDark.matches);

  prefersDark.addEventListener('change', (e) => {
    darkMode = e.matches;
    document.documentElement.classList.toggle('dark', darkMode);
  });

  function toggleDark() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark', darkMode);
  }
</script>

<div class="min-h-screen bg-[#faf8f5] transition-colors duration-300 dark:bg-[#0f1419]">
  <!-- Header -->
  <header class="border-primary-800 bg-primary-900 relative overflow-hidden border-b-2 shadow-lg dark:bg-[#0a1628]">
    <!-- Decorative gold rule at top -->
    <div class="via-accent-400 h-[3px] bg-gradient-to-r from-transparent to-transparent"></div>

    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <div>
        <a href="/" use:link class="group block">
          <h1 class="font-[--font-serif] text-2xl font-bold tracking-tight text-white">WSC Decisions Archive</h1>
          <p class="text-primary-300 mt-0.5 text-sm font-light tracking-wide">
            NA World Service Conference Records <span class="text-accent-500">&middot;</span> 2000–2026
          </p>
        </a>
      </div>
      <div class="flex items-center gap-6">
        <nav class="flex gap-1">
          <a
            href="/"
            use:link
            use:active={{
              className: 'text-accent-300 border-b-2 border-accent-400',
              inactiveClassName: 'text-primary-300 hover:text-white border-b-2 border-transparent'
            }}
            class="px-3 py-2 text-sm font-medium tracking-wide transition-all duration-200"
          >
            Decisions
          </a>
          <a
            href="/board"
            use:link
            use:active={{
              className: 'text-accent-300 border-b-2 border-accent-400',
              inactiveClassName: 'text-primary-300 hover:text-white border-b-2 border-transparent'
            }}
            class="px-3 py-2 text-sm font-medium tracking-wide transition-all duration-200"
          >
            Board
          </a>
          <a
            href="/reference"
            use:link
            use:active={{
              className: 'text-accent-300 border-b-2 border-accent-400',
              inactiveClassName: 'text-primary-300 hover:text-white border-b-2 border-transparent'
            }}
            class="px-3 py-2 text-sm font-medium tracking-wide transition-all duration-200"
          >
            Reference
          </a>
        </nav>
        <button
          class="border-primary-600 text-primary-300 hover:border-accent-500 hover:text-accent-300 rounded-full border p-2 transition-all duration-200"
          onclick={toggleDark}
          aria-label="Toggle theme"
        >
          {#if darkMode}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          {:else}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-6 py-8">
    <Router {routes} />
  </main>

  <footer class="border-primary-200 dark:border-primary-800 border-t py-6 text-center">
    <p class="text-primary-400 dark:text-primary-500 text-sm tracking-wide">
      Data sourced from <a href="https://na.org/conference/" class="text-accent-600 dark:text-accent-400 underline-offset-2 hover:underline" target="_blank" rel="noopener">na.org/conference</a> WSC Summary
      of Decisions documents
    </p>
    <div class="via-accent-400 mx-auto mt-2 h-px w-16 bg-gradient-to-r from-transparent to-transparent"></div>
  </footer>
</div>
