<script lang="ts">
  import StatsBar from '@components/StatsBar.svelte';
  import FilterPanel from '@components/FilterPanel.svelte';
  import DecisionTable from '@components/DecisionTable.svelte';
  import MakerTallyModal from '@components/MakerTallyModal.svelte';
  import type { Motion, FilterState, SortState } from '$types/index';
  import { filterMotions, sortMotions, getUniqueYears } from '@utils/filters';

  let allMotions = $state<Motion[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let filters = $state<FilterState>({
    years: [],
    categories: [],
    results: [],
    makers: [],
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
  let showMakerModal = $state(false);

  function toggleMakerFilter(maker: string) {
    const makers = filters.makers.includes(maker) ? filters.makers.filter((m) => m !== maker) : [...filters.makers, maker];
    filters = { ...filters, makers };
  }

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
      <div class="border-primary-200 dark:border-primary-700 border-t-accent-500 mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2"></div>
      <p class="text-primary-400 dark:text-primary-500 text-sm tracking-wide">Loading decisions&hellip;</p>
    </div>
  </div>
{:else if error}
  <div class="rounded-lg border border-rose-200 bg-rose-50 p-6 dark:border-rose-800 dark:bg-rose-900/20">
    <h2 class="mb-2 font-[--font-serif] text-lg font-bold text-rose-800 dark:text-rose-300">Error loading data</h2>
    <p class="text-sm text-rose-600 dark:text-rose-400">{error}</p>
  </div>
{:else}
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1"><StatsBar motions={filteredMotions} /></div>
      <button
        onclick={() => (showMakerModal = true)}
        class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-accent-50 dark:hover:bg-primary-800 hover:border-accent-300 dark:hover:border-accent-700 mt-0 shrink-0 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200"
      >
        Maker Tally
      </button>
    </div>
    <FilterPanel {filters} {availableYears} {allMotions} onchange={handleFilterChange} />
    <DecisionTable motions={filteredMotions} {sort} onsort={handleSortChange} />
  </div>

  {#if showMakerModal}
    <MakerTallyModal motions={allMotions} selectedMakers={filters.makers} onclose={() => (showMakerModal = false)} ontogglemaker={toggleMakerFilter} />
  {/if}
{/if}
