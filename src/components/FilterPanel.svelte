<script lang="ts">
  import { CATEGORY_LABELS, RESULT_LABELS, type FilterState, type MotionCategory, type MotionResult } from '@types/index';

  interface Props {
    filters: FilterState;
    availableYears: number[];
    onchange: (filters: FilterState) => void;
  }

  let { filters, availableYears, onchange }: Props = $props();

  let showAdvanced = $state(false);

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

  function clearAll() {
    onchange({ years: [], categories: [], results: [], search: '', carOnly: false, catOnly: false });
  }

  let hasActiveFilters = $derived(filters.years.length > 0 || filters.categories.length > 0 || filters.results.length > 0 || filters.search !== '' || filters.carOnly || filters.catOnly);
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
      <input type="search" class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" placeholder="Search motions, makers, notes..." value={filters.search} oninput={updateSearch} />
    </div>
  </div>

  <!-- Year chips -->
  <div>
    <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Year</p>
    <div class="flex flex-wrap gap-1.5">
      {#each availableYears as year}
        <button
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filters.years.includes(year) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
          onclick={() => toggleYear(year)}
        >
          {year}
        </button>
      {/each}
    </div>
  </div>

  <!-- Toggle advanced filters -->
  <button class="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400" onclick={() => (showAdvanced = !showAdvanced)}>
    {showAdvanced ? '▾ Hide' : '▸ Show'} advanced filters
  </button>

  {#if showAdvanced}
    <!-- Result filter -->
    <div>
      <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Result</p>
      <div class="flex flex-wrap gap-1.5">
        {#each Object.entries(RESULT_LABELS) as [key, label]}
          <button
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filters.results.includes(key as MotionResult) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
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
        {#each Object.entries(CATEGORY_LABELS) as [key, label]}
          <button
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filters.categories.includes(key as MotionCategory) ? 'bg-secondary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
            onclick={() => toggleCategory(key as MotionCategory)}
          >
            {label}
          </button>
        {/each}
      </div>
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
