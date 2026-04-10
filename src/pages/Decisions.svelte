<script lang="ts">
  import StatsBar from '@components/StatsBar.svelte';
  import FilterPanel from '@components/FilterPanel.svelte';
  import DecisionTable from '@components/DecisionTable.svelte';
  import type { Motion, FilterState, SortState } from '@types/index';
  import { filterMotions, sortMotions, getUniqueYears } from '@utils/filters';

  let allMotions = $state<Motion[]>([]);
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
      const response = await fetch('./data/decisions_flat.json');
      if (!response.ok) throw new Error(`Failed to load data: ${response.statusText}`);
      allMotions = await response.json();
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
</script>

{#if loading}
  <div class="flex items-center justify-center py-24">
    <div class="text-center">
      <div class="border-t-primary-600 mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200"></div>
      <p class="text-gray-500 dark:text-gray-400">Loading decisions data...</p>
    </div>
  </div>
{:else if error}
  <div class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/30">
    <h2 class="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">Error loading data</h2>
    <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
  </div>
{:else}
  <div class="space-y-6">
    <StatsBar motions={filteredMotions} />
    <FilterPanel {filters} {availableYears} onchange={handleFilterChange} />
    <DecisionTable motions={filteredMotions} {sort} onsort={handleSortChange} />
  </div>
{/if}
