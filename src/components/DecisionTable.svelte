<script lang="ts">
  import { CATEGORY_LABELS, RESULT_LABELS, RESULT_COLORS, type Motion, type SortState } from '$types/index';

  interface MotionGroup {
    motion: Motion;
    amendments: Motion[];
  }

  interface Props {
    motions: Motion[];
    sort: SortState;
    onsort: (sort: SortState) => void;
  }

  let { motions, sort, onsort }: Props = $props();

  let expandedKey = $state<string | null>(null);
  let currentPage = $state(0);
  const pageSize = 50;

  // Group amendments under their parent. Amendments whose parent is not in the
  // filtered list float to the top level as standalone groups.
  let groups = $derived.by((): MotionGroup[] => {
    const mains: Motion[] = [];
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const amendMap = new Map<string, Motion[]>();

    for (const m of motions) {
      if (m.amendment_to) {
        const key = `${m.year}-${m.amendment_to}`;
        if (!amendMap.has(key)) amendMap.set(key, []);
        amendMap.get(key)!.push(m);
      } else {
        mains.push(m);
      }
    }

    const mainKeys = new Set(mains.map((m) => `${m.year}-${m.motion_number}`));
    const result: MotionGroup[] = mains.map((m) => ({
      motion: m,
      amendments: amendMap.get(`${m.year}-${m.motion_number}`) ?? []
    }));

    // Orphaned amendments (parent filtered out) → standalone groups
    for (const [key, amends] of amendMap) {
      if (!mainKeys.has(key)) {
        for (const a of amends) result.push({ motion: a, amendments: [] });
      }
    }

    return result;
  });

  let pagedGroups = $derived(groups.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
  let totalPages = $derived(Math.ceil(groups.length / pageSize));

  function handleSort(column: string) {
    if (sort.column === column) {
      onsort({ column, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onsort({ column, direction: 'asc' });
    }
  }

  function sortIcon(column: string) {
    if (sort.column !== column) return '↕';
    return sort.direction === 'asc' ? '↑' : '↓';
  }

  function toggleExpand(key: string) {
    expandedKey = expandedKey === key ? null : key;
  }

  $effect(() => {
    void motions.length;
    currentPage = 0;
  });
</script>

{#snippet detailPanel(motion: Motion)}
  <div class="grid gap-6 md:grid-cols-2">
    <div>
      <h4 class="text-primary-900 dark:text-primary-100 mb-2 font-[--font-serif] text-sm font-bold">Full Motion Text</h4>
      <p class="text-primary-700 dark:text-primary-300 text-sm leading-relaxed">{motion.motion_text}</p>
    </div>
    <div class="space-y-2.5 text-sm">
      {#if motion.maker}
        <p><span class="text-primary-500 dark:text-primary-400 font-semibold">Maker:</span> <span class="text-primary-800 dark:text-primary-200">{motion.maker}</span></p>
      {/if}
      {#if motion.second}
        <p><span class="text-primary-500 dark:text-primary-400 font-semibold">Second:</span> <span class="text-primary-800 dark:text-primary-200">{motion.second}</span></p>
      {/if}
      {#if motion.vote_for !== null}
        <div>
          <span class="text-primary-500 dark:text-primary-400 font-semibold">Votes:</span>
          <div class="mt-1 flex gap-3">
            <span
              class="inline-flex items-center gap-1 rounded-md border border-emerald-200/50 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-300"
              >For {motion.vote_for}</span
            >
            <span
              class="inline-flex items-center gap-1 rounded-md border border-rose-200/50 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/30 dark:text-rose-300"
              >Against {motion.vote_against ?? 0}</span
            >
            <span
              class="bg-primary-50 dark:bg-primary-800/40 text-primary-600 dark:text-primary-300 border-primary-200/50 dark:border-primary-700/50 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
              >Abstain {motion.vote_abstain ?? 0}</span
            >
            {#if motion.vote_present !== null}
              <span
                class="bg-primary-50 dark:bg-primary-800/40 text-primary-600 dark:text-primary-300 border-primary-200/50 dark:border-primary-700/50 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                >Present {motion.vote_present}</span
              >
            {/if}
          </div>
        </div>
      {/if}
      <div class="flex flex-wrap gap-2">
        {#if motion.is_car_motion}
          <span class="rounded-md border border-sky-200/60 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:border-sky-800/40 dark:bg-sky-900/30 dark:text-sky-300">CAR Motion</span>
        {/if}
        {#if motion.is_cat_motion}
          <span class="rounded-md border border-violet-200/60 bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:border-violet-800/40 dark:bg-violet-900/30 dark:text-violet-300"
            >CAT Motion</span
          >
        {/if}
      </div>
      {#if motion.amendment_to}
        <p><span class="text-primary-500 dark:text-primary-400 font-semibold">Amendment to:</span> <span class="text-primary-800 dark:text-primary-200">Motion {motion.amendment_to}</span></p>
      {/if}
      {#if motion.notes}
        <div class="border-accent-400 bg-accent-50/50 dark:bg-accent-900/10 rounded-md border-l-2 px-3 py-2">
          <span class="text-accent-700 dark:text-accent-400 text-xs font-semibold">Note:</span>
          <p class="text-primary-700 dark:text-primary-300 mt-0.5 text-xs">{motion.notes}</p>
        </div>
      {/if}
    </div>
  </div>
{/snippet}

<div class="animate-fade-up border-primary-200 dark:border-primary-700 overflow-x-auto rounded-lg border shadow-sm" style="animation-delay: 200ms">
  <table class="w-full text-left text-sm">
    <thead class="border-primary-200 dark:border-primary-700 bg-primary-50/80 dark:bg-primary-900/60 border-b-2">
      <tr>
        <th class="w-8 px-3 py-3.5"></th>
        <th
          class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
          onclick={() => handleSort('year')}
        >
          Year <span class="text-primary-300 dark:text-primary-600">{sortIcon('year')}</span>
        </th>
        <th
          class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
          onclick={() => handleSort('motion_number')}
        >
          # <span class="text-primary-300 dark:text-primary-600">{sortIcon('motion_number')}</span>
        </th>
        <th class="text-primary-500 dark:text-primary-400 min-w-[300px] px-3 py-3.5 text-xs font-semibold tracking-widest uppercase">Motion</th>
        <th
          class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
          onclick={() => handleSort('maker')}
        >
          Maker <span class="text-primary-300 dark:text-primary-600">{sortIcon('maker')}</span>
        </th>
        <th
          class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
          onclick={() => handleSort('result')}
        >
          Result <span class="text-primary-300 dark:text-primary-600">{sortIcon('result')}</span>
        </th>
        <th
          class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
          onclick={() => handleSort('vote_for')}
        >
          Votes <span class="text-primary-300 dark:text-primary-600">{sortIcon('vote_for')}</span>
        </th>
        <th
          class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
          onclick={() => handleSort('category')}
        >
          Category <span class="text-primary-300 dark:text-primary-600">{sortIcon('category')}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each pagedGroups as group, gi (currentPage * pageSize + gi)}
        {@const gKey = `g-${currentPage * pageSize + gi}`}
        {@const motion = group.motion}

        <!-- Main motion row -->
        <tr
          class="border-primary-100 dark:border-primary-800 dark:bg-primary-900/30 hover:bg-accent-50/40 dark:hover:bg-primary-800/50 cursor-pointer border-b bg-white transition-colors duration-150"
          onclick={() => toggleExpand(gKey)}
        >
          <td class="text-primary-400 dark:text-primary-500 px-3 py-3">
            <svg class="h-3.5 w-3.5 transition-transform duration-200 {expandedKey === gKey ? 'rotate-90' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </td>
          <td class="text-primary-900 dark:text-primary-100 px-3 py-3 font-[--font-serif] font-bold">{motion.year}</td>
          <td class="text-primary-600 dark:text-primary-400 px-3 py-3 font-mono text-xs">
            {motion.motion_number ?? '—'}
            {#if group.amendments.length > 0}
              <span class="bg-accent-100 dark:bg-accent-800/40 text-accent-700 dark:text-accent-300 ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold">+{group.amendments.length}</span>
            {/if}
          </td>
          <td class="max-w-md px-3 py-3">
            <p class="text-primary-700 dark:text-primary-300 line-clamp-2 leading-snug">{motion.motion_text}</p>
          </td>
          <td class="text-primary-500 dark:text-primary-400 px-3 py-3 text-xs">{motion.maker ?? '—'}</td>
          <td class="px-3 py-3">
            <span class="rounded-md px-2 py-0.5 text-xs font-semibold {RESULT_COLORS[motion.result]}">
              {RESULT_LABELS[motion.result] ?? motion.result}
            </span>
          </td>
          <td class="px-3 py-3 font-mono text-xs">
            {#if motion.vote_for !== null}
              <span class="text-emerald-700 dark:text-emerald-400">{motion.vote_for}</span><span class="text-primary-300 dark:text-primary-600">/</span><span class="text-rose-600 dark:text-rose-400"
                >{motion.vote_against ?? 0}</span
              ><span class="text-primary-300 dark:text-primary-600">/</span><span class="text-primary-400">{motion.vote_abstain ?? 0}</span>
            {:else}
              <span class="text-primary-300 dark:text-primary-600">—</span>
            {/if}
          </td>
          <td class="px-3 py-3">
            <span
              class="border-primary-200/60 dark:border-primary-700/60 bg-primary-50 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 rounded-md border px-2 py-0.5 text-[11px] font-medium"
              >{CATEGORY_LABELS[motion.category] ?? motion.category}</span
            >
          </td>
        </tr>

        <!-- Main motion expanded detail -->
        {#if expandedKey === gKey}
          <tr class="border-primary-200 dark:border-primary-700 border-b">
            <td colspan="8" class="bg-primary-50/50 dark:bg-primary-900/60 px-8 py-5">
              {@render detailPanel(motion)}
            </td>
          </tr>
        {/if}

        <!-- Amendment sub-rows -->
        {#each group.amendments as amendment, ai (amendment.motion_number)}
          {@const aKey = `a-${currentPage * pageSize + gi}-${ai}`}
          <tr
            class="border-primary-100 dark:border-primary-800 border-l-accent-300 dark:border-l-accent-700 bg-primary-50/30 dark:bg-primary-900/20 hover:bg-accent-50/30 dark:hover:bg-primary-800/40 cursor-pointer border-b border-l-2 transition-colors duration-150"
            onclick={() => toggleExpand(aKey)}
          >
            <td class="text-primary-300 dark:text-primary-600 px-3 py-2">
              <svg class="h-3 w-3 transition-transform duration-200 {expandedKey === aKey ? 'rotate-90' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </td>
            <td class="text-primary-400 dark:text-primary-500 px-3 py-2 text-xs">{amendment.year}</td>
            <td class="px-3 py-2 font-mono text-xs">
              <span class="text-accent-700 dark:text-accent-400 ml-3">{amendment.motion_number}</span>
            </td>
            <td class="max-w-md px-3 py-2">
              <p class="text-primary-600 dark:text-primary-400 line-clamp-2 text-xs leading-snug">{amendment.motion_text}</p>
            </td>
            <td class="text-primary-400 dark:text-primary-500 px-3 py-2 text-xs">{amendment.maker ?? '—'}</td>
            <td class="px-3 py-2">
              <span class="rounded-md px-2 py-0.5 text-xs font-semibold {RESULT_COLORS[amendment.result]}">
                {RESULT_LABELS[amendment.result] ?? amendment.result}
              </span>
            </td>
            <td class="px-3 py-2 font-mono text-xs">
              {#if amendment.vote_for !== null}
                <span class="text-emerald-700 dark:text-emerald-400">{amendment.vote_for}</span><span class="text-primary-300 dark:text-primary-600">/</span><span
                  class="text-rose-600 dark:text-rose-400">{amendment.vote_against ?? 0}</span
                ><span class="text-primary-300 dark:text-primary-600">/</span><span class="text-primary-400">{amendment.vote_abstain ?? 0}</span>
              {:else}
                <span class="text-primary-300 dark:text-primary-600">—</span>
              {/if}
            </td>
            <td class="px-3 py-2">
              <span
                class="border-primary-200/60 dark:border-primary-700/60 bg-primary-50 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                >{CATEGORY_LABELS[amendment.category] ?? amendment.category}</span
              >
            </td>
          </tr>

          {#if expandedKey === aKey}
            <tr class="border-primary-200 dark:border-primary-700 border-l-accent-300 dark:border-l-accent-700 border-b border-l-2">
              <td colspan="8" class="bg-primary-50/50 dark:bg-primary-900/60 px-8 py-5">
                {@render detailPanel(amendment)}
              </td>
            </tr>
          {/if}
        {/each}
      {/each}

      {#if pagedGroups.length === 0}
        <tr>
          <td colspan="8" class="px-6 py-16 text-center">
            <p class="text-primary-400 dark:text-primary-500 font-[--font-serif] italic">No motions match your filters.</p>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<!-- Pagination -->
{#if totalPages > 1}
  <div class="animate-fade-up mt-5 flex items-center justify-between" style="animation-delay: 300ms">
    <p class="text-primary-400 dark:text-primary-500 text-sm">
      Showing <span class="text-primary-600 dark:text-primary-300 font-semibold">{currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, groups.length)}</span> of
      <span class="text-primary-600 dark:text-primary-300 font-semibold">{groups.length}</span> motions
    </p>
    <div class="flex gap-2">
      <button
        class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 hover:border-primary-300 dark:hover:border-primary-600 rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage === 0}
        onclick={() => (currentPage = currentPage - 1)}
      >
        Previous
      </button>
      <button
        class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 hover:border-primary-300 dark:hover:border-primary-600 rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage >= totalPages - 1}
        onclick={() => (currentPage = currentPage + 1)}
      >
        Next
      </button>
    </div>
  </div>
{/if}
