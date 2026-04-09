<script lang="ts">
  import './app.css';
  import StatsBar from '@components/StatsBar.svelte';
  import FilterPanel from '@components/FilterPanel.svelte';
  import DecisionTable from '@components/DecisionTable.svelte';
  import BoardMembers from '@components/BoardMembers.svelte';
  import type { Motion, FilterState, SortState } from '@types/index';
  import { filterMotions, sortMotions, getUniqueYears } from '@utils/filters';

  let activeTab = $state<'decisions' | 'board'>('decisions');

  // Import data - will be replaced with actual extracted data
  let allMotions = $state<Motion[]>([]);
  let boardMembers = $state<any[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let filters = $state<FilterState>({
    years: [],
    categories: [],
    results: [],
    search: '',
    carOnly: false,
    catOnly: false
  });

  let sort = $state<SortState>({
    column: 'year',
    direction: 'desc'
  });

  let availableYears = $derived(getUniqueYears(allMotions));
  let filteredMotions = $derived(sortMotions(filterMotions(allMotions, filters), sort));

  async function loadData() {
    try {
      const [decisionsRes, boardRes] = await Promise.all([
        fetch('./data/decisions_flat.json'),
        fetch('./data/board_terms.json'),
      ]);
      if (!decisionsRes.ok) throw new Error(`Failed to load decisions: ${decisionsRes.statusText}`);
      allMotions = await decisionsRes.json();
      if (boardRes.ok) {
        boardMembers = await boardRes.json();
      }
      loading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error loading data';
      loading = false;
    }
  }

  $effect(() => {
    loadData();
  });

  function handleFilterChange(newFilters: FilterState) {
    filters = newFilters;
  }

  function handleSortChange(newSort: SortState) {
    sort = newSort;
  }

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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">WSC Decisions Archive</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">NA World Service Conference decisions from 2000–2023</p>
      </div>
      <button class="rounded-lg border border-gray-300 p-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" onclick={toggleDark}>
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-24">
        <div class="text-center">
          <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
          <p class="text-gray-500 dark:text-gray-400">Loading decisions data...</p>
        </div>
      </div>
    {:else if error}
      <div class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/30">
        <h2 class="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">Error loading data</h2>
        <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
        <p class="mt-4 text-sm text-red-500">
          Make sure you've run the extraction script first:
          <code class="rounded bg-red-100 px-2 py-0.5 dark:bg-red-900">ANTHROPIC_API_KEY=sk-... python3 scripts/extract_decisions.py</code>
        </p>
        <p class="mt-2 text-sm text-red-500">
          Then copy the output to <code class="rounded bg-red-100 px-2 py-0.5 dark:bg-red-900">public/data/decisions_flat.json</code>
        </p>
      </div>
    {:else}
      <!-- Tabs -->
      <div class="mb-6 flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          class="px-4 py-2.5 text-sm font-medium {activeTab === 'decisions' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
          onclick={() => (activeTab = 'decisions')}
        >
          Decisions ({allMotions.length})
        </button>
        <button
          class="px-4 py-2.5 text-sm font-medium {activeTab === 'board' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
          onclick={() => (activeTab = 'board')}
        >
          World Board ({boardMembers.length})
        </button>
      </div>

      {#if activeTab === 'decisions'}
        <div class="space-y-6">
          <StatsBar motions={filteredMotions} />
          <FilterPanel {filters} {availableYears} onchange={handleFilterChange} />
          <DecisionTable motions={filteredMotions} {sort} onsort={handleSortChange} />
        </div>
      {:else}
        <BoardMembers members={boardMembers} />
      {/if}
    {/if}
  </main>

  <footer class="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
    Data extracted from <a href="https://na.org/conference/" class="text-primary-600 hover:underline" target="_blank" rel="noopener">na.org/conference</a> WSC Summary of Decisions documents.
  </footer>
</div>
