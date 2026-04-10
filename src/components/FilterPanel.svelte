<script lang="ts">
  import { CATEGORY_LABELS, RESULT_LABELS, type FilterState, type Motion, type MotionCategory, type MotionResult } from '$types/index';
  import { getMakerTally } from '@utils/filters';

  interface Props {
    filters: FilterState;
    availableYears: number[];
    allMotions: Motion[];
    onchange: (filters: FilterState) => void;
  }

  let { filters, availableYears, allMotions, onchange }: Props = $props();

  let showAdvanced = $state(false);
  let makerSearch = $state('');

  function updateSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange({ ...filters, search: target.value });
  }

  function toggleYear(year: number) {
    const years = filters.years.includes(year) ? filters.years.filter((y) => y !== year) : [...filters.years, year];
    onchange({ ...filters, years });
  }

  function toggleCategory(cat: MotionCategory) {
    const categories = filters.categories.includes(cat) ? filters.categories.filter((c) => c !== cat) : [...filters.categories, cat];
    onchange({ ...filters, categories });
  }

  function toggleResult(result: MotionResult) {
    const results = filters.results.includes(result) ? filters.results.filter((r) => r !== result) : [...filters.results, result];
    onchange({ ...filters, results });
  }

  function toggleMaker(maker: string) {
    const makers = filters.makers.includes(maker) ? filters.makers.filter((m) => m !== maker) : [...filters.makers, maker];
    onchange({ ...filters, makers });
  }

  function clearAll() {
    makerSearch = '';
    onchange({ years: [], categories: [], results: [], makers: [], search: '', carOnly: false, catOnly: false });
  }

  let makerTally = $derived(getMakerTally(allMotions));
  let visibleMakers = $derived(makerSearch.trim() ? makerTally.filter((t) => t.maker.toLowerCase().includes(makerSearch.toLowerCase())) : makerTally);

  let hasActiveFilters = $derived(
    filters.years.length > 0 || filters.categories.length > 0 || filters.results.length > 0 || filters.makers.length > 0 || filters.search !== '' || filters.carOnly || filters.catOnly
  );
</script>

<div class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
  <!-- Search -->
  <div>
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
        <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
        </svg>
      </div>
      <input
        type="search"
        class="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="Search motions, makers, notes..."
        value={filters.search}
        oninput={updateSearch}
      />
    </div>
  </div>

  <!-- Year chips -->
  <div>
    <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Year</p>
    <div class="flex flex-wrap gap-1.5">
      {#each availableYears as year (year)}
        <button
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filters.years.includes(year)
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
          onclick={() => toggleYear(year)}
        >
          {year}
        </button>
      {/each}
    </div>
  </div>

  <!-- Toggle advanced filters -->
  <button class="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium" onclick={() => (showAdvanced = !showAdvanced)}>
    {showAdvanced ? '▾ Hide' : '▸ Show'} advanced filters
  </button>

  {#if showAdvanced}
    <!-- Result filter -->
    <div>
      <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Result</p>
      <div class="flex flex-wrap gap-1.5">
        {#each Object.entries(RESULT_LABELS) as [key, label] (key)}
          <button
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filters.results.includes(key as MotionResult)
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
            onclick={() => toggleResult(key as MotionResult)}
          >
            {label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Category filter -->
    <div>
      <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
      <div class="flex flex-wrap gap-1.5">
        {#each Object.entries(CATEGORY_LABELS) as [key, label] (key)}
          <button
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filters.categories.includes(key as MotionCategory)
              ? 'bg-secondary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
            onclick={() => toggleCategory(key as MotionCategory)}
          >
            {label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Maker filter -->
    <div>
      <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Maker</p>
      <input
        type="search"
        class="focus:border-primary-500 focus:ring-primary-500 mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="Search makers..."
        bind:value={makerSearch}
      />
      <div class="max-h-48 space-y-0.5 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        {#each visibleMakers as { maker, count } (maker)}
          <button
            class="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm transition-colors {filters.makers.includes(maker)
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}"
            onclick={() => toggleMaker(maker)}
          >
            <span class="truncate">{maker}</span>
            <span
              class="ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium {filters.makers.includes(maker)
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}">{count}</span
            >
          </button>
        {/each}
        {#if visibleMakers.length === 0}
          <p class="px-2 py-2 text-xs text-gray-400">No makers match</p>
        {/if}
      </div>
      {#if filters.makers.length > 0}
        <button class="mt-1 text-xs text-red-500 hover:text-red-600" onclick={() => onchange({ ...filters, makers: [] })}>Clear maker filter</button>
      {/if}
    </div>

    <!-- CAR/CAT toggles -->
    <div class="flex gap-4">
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" checked={filters.carOnly} onchange={() => onchange({ ...filters, carOnly: !filters.carOnly })} class="rounded" />
        CAR motions only
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" checked={filters.catOnly} onchange={() => onchange({ ...filters, catOnly: !filters.catOnly })} class="rounded" />
        CAT motions only
      </label>
    </div>
  {/if}

  <!-- Clear filters -->
  {#if hasActiveFilters}
    <button class="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400" onclick={clearAll}> Clear all filters </button>
  {/if}
</div>
