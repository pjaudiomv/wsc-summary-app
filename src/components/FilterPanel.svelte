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

  let activeCount = $derived(
    filters.years.length + filters.categories.length + filters.results.length + filters.makers.length + (filters.search ? 1 : 0) + (filters.carOnly ? 1 : 0) + (filters.catOnly ? 1 : 0)
  );
</script>

<div class="animate-fade-up border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 space-y-4 rounded-lg border bg-white p-5 transition-colors duration-200" style="animation-delay: 100ms">
  <!-- Search -->
  <div class="relative">
    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
      <svg class="text-primary-400 dark:text-primary-500 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
      </svg>
    </div>
    <input
      type="search"
      class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full rounded-lg border bg-[#faf8f5] p-3 ps-11 text-sm transition-colors focus:ring-1"
      placeholder="Search motions, makers, notes..."
      value={filters.search}
      oninput={updateSearch}
    />
  </div>

  <!-- Year chips -->
  <div>
    <p class="text-primary-400 dark:text-primary-500 mb-2 text-xs font-semibold tracking-widest uppercase">Conference Year</p>
    <div class="flex flex-wrap gap-1.5">
      {#each availableYears as year (year)}
        <button
          class="rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 {filters.years.includes(year)
            ? 'bg-primary-800 text-accent-200 dark:bg-accent-700 dark:text-accent-100 shadow-sm'
            : 'bg-primary-100/60 text-primary-600 hover:bg-primary-200 dark:bg-primary-800/60 dark:text-primary-300 dark:hover:bg-primary-700'}"
          onclick={() => toggleYear(year)}
        >
          {year}
        </button>
      {/each}
    </div>
  </div>

  <!-- Toggle advanced filters -->
  <button
    class="text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 flex items-center gap-2 text-sm font-medium transition-colors"
    onclick={() => (showAdvanced = !showAdvanced)}
  >
    <svg class="h-3.5 w-3.5 transition-transform duration-200 {showAdvanced ? 'rotate-90' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
    </svg>
    {showAdvanced ? 'Fewer' : 'More'} filters
    {#if activeCount > 0}
      <span class="bg-accent-100 dark:bg-accent-800 text-accent-800 dark:text-accent-200 rounded-full px-2 py-0.5 text-xs font-semibold">{activeCount}</span>
    {/if}
  </button>

  {#if showAdvanced}
    <div class="border-primary-100 dark:border-primary-700 space-y-4 border-t pt-4">
      <!-- Result filter -->
      <div>
        <p class="text-primary-400 dark:text-primary-500 mb-2 text-xs font-semibold tracking-widest uppercase">Result</p>
        <div class="flex flex-wrap gap-1.5">
          {#each Object.entries(RESULT_LABELS) as [key, label] (key)}
            <button
              class="rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 {filters.results.includes(key as MotionResult)
                ? 'bg-primary-800 text-accent-200 dark:bg-accent-700 dark:text-accent-100 shadow-sm'
                : 'bg-primary-100/60 text-primary-600 hover:bg-primary-200 dark:bg-primary-800/60 dark:text-primary-300 dark:hover:bg-primary-700'}"
              onclick={() => toggleResult(key as MotionResult)}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Category filter -->
      <div>
        <p class="text-primary-400 dark:text-primary-500 mb-2 text-xs font-semibold tracking-widest uppercase">Category</p>
        <div class="flex flex-wrap gap-1.5">
          {#each Object.entries(CATEGORY_LABELS) as [key, label] (key)}
            <button
              class="rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 {filters.categories.includes(key as MotionCategory)
                ? 'bg-primary-700 text-primary-100 dark:bg-primary-300 dark:text-primary-900 shadow-sm'
                : 'bg-primary-100/60 text-primary-600 hover:bg-primary-200 dark:bg-primary-800/60 dark:text-primary-300 dark:hover:bg-primary-700'}"
              onclick={() => toggleCategory(key as MotionCategory)}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Maker filter -->
      <div>
        <p class="text-primary-400 dark:text-primary-500 mb-2 text-xs font-semibold tracking-widest uppercase">Maker</p>
        <input
          type="search"
          class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 mb-2 block w-full rounded-lg border bg-[#faf8f5] p-2 text-sm transition-colors focus:ring-1"
          placeholder="Search makers..."
          bind:value={makerSearch}
        />
        <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/60 max-h-48 space-y-0.5 overflow-y-auto rounded-lg border bg-[#faf8f5] p-1">
          {#each visibleMakers as { maker, count } (maker)}
            <button
              class="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-all duration-150 {filters.makers.includes(maker)
                ? 'bg-primary-800 dark:bg-accent-700 dark:text-accent-100 text-white'
                : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-800'}"
              onclick={() => toggleMaker(maker)}
            >
              <span class="truncate">{maker}</span>
              <span
                class="ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium {filters.makers.includes(maker)
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-200/60 text-primary-500 dark:bg-primary-700 dark:text-primary-400'}">{count}</span
              >
            </button>
          {/each}
          {#if visibleMakers.length === 0}
            <p class="text-primary-400 px-2 py-2 text-xs italic">No makers match</p>
          {/if}
        </div>
        {#if filters.makers.length > 0}
          <button class="mt-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400" onclick={() => onchange({ ...filters, makers: [] })}>Clear maker filter</button>
        {/if}
      </div>

      <!-- CAR/CAT toggles -->
      <div class="flex gap-6">
        <label class="text-primary-600 dark:text-primary-300 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.carOnly}
            onchange={() => onchange({ ...filters, carOnly: !filters.carOnly })}
            class="border-primary-300 dark:border-primary-600 text-accent-600 focus:ring-accent-400 rounded"
          />
          CAR motions only
        </label>
        <label class="text-primary-600 dark:text-primary-300 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.catOnly}
            onchange={() => onchange({ ...filters, catOnly: !filters.catOnly })}
            class="border-primary-300 dark:border-primary-600 text-accent-600 focus:ring-accent-400 rounded"
          />
          CAT motions only
        </label>
      </div>
    </div>
  {/if}

  <!-- Clear filters -->
  {#if hasActiveFilters}
    <div class="border-primary-100 dark:border-primary-700 border-t pt-3">
      <button class="text-sm font-medium text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400" onclick={clearAll}> Clear all filters </button>
    </div>
  {/if}
</div>
