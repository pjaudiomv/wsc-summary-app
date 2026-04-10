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
  <div class="grid gap-4 md:grid-cols-2">
    <div>
      <h4 class="mb-2 font-semibold text-gray-900 dark:text-white">Full Motion Text</h4>
      <p class="text-sm text-gray-700 dark:text-gray-300">{motion.motion_text}</p>
    </div>
    <div class="space-y-2 text-sm">
      {#if motion.maker}
        <p><span class="font-medium text-gray-600 dark:text-gray-400">Maker:</span> {motion.maker}</p>
      {/if}
      {#if motion.second}
        <p><span class="font-medium text-gray-600 dark:text-gray-400">Second:</span> {motion.second}</p>
      {/if}
      {#if motion.vote_for !== null}
        <p>
          <span class="font-medium text-gray-600 dark:text-gray-400">Votes:</span>
          For: <span class="font-semibold text-green-600">{motion.vote_for}</span> | Against: <span class="font-semibold text-red-600">{motion.vote_against ?? 0}</span> | Abstain: {motion.vote_abstain ??
            0}
          {#if motion.vote_present !== null}
            | Present: {motion.vote_present}
          {/if}
        </p>
      {/if}
      {#if motion.is_car_motion}
        <p><span class="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">CAR Motion</span></p>
      {/if}
      {#if motion.is_cat_motion}
        <p><span class="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">CAT Motion</span></p>
      {/if}
      {#if motion.amendment_to}
        <p><span class="font-medium text-gray-600 dark:text-gray-400">Amendment to:</span> Motion {motion.amendment_to}</p>
      {/if}
      {#if motion.notes}
        <p><span class="font-medium text-gray-600 dark:text-gray-400">Notes:</span> {motion.notes}</p>
      {/if}
    </div>
  </div>
{/snippet}

<div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
  <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
    <thead class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
      <tr>
        <th class="w-8 px-3 py-3"></th>
        <th class="cursor-pointer px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('year')}>
          Year <span class="text-gray-400">{sortIcon('year')}</span>
        </th>
        <th class="cursor-pointer px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('motion_number')}>
          # <span class="text-gray-400">{sortIcon('motion_number')}</span>
        </th>
        <th class="min-w-[300px] px-3 py-3">Motion</th>
        <th class="cursor-pointer px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('maker')}>
          Maker <span class="text-gray-400">{sortIcon('maker')}</span>
        </th>
        <th class="cursor-pointer px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('result')}>
          Result <span class="text-gray-400">{sortIcon('result')}</span>
        </th>
        <th class="cursor-pointer px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('vote_for')}>
          Votes <span class="text-gray-400">{sortIcon('vote_for')}</span>
        </th>
        <th class="cursor-pointer px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('category')}>
          Category <span class="text-gray-400">{sortIcon('category')}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each pagedGroups as group, gi (currentPage * pageSize + gi)}
        {@const gKey = `g-${currentPage * pageSize + gi}`}
        {@const motion = group.motion}

        <!-- Main motion row -->
        <tr class="cursor-pointer border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700" onclick={() => toggleExpand(gKey)}>
          <td class="px-3 py-3 text-gray-400">
            {expandedKey === gKey ? '▾' : '▸'}
          </td>
          <td class="px-3 py-3 font-medium text-gray-900 dark:text-white">{motion.year}</td>
          <td class="px-3 py-3 font-mono">
            {motion.motion_number ?? '—'}
            {#if group.amendments.length > 0}
              <span class="ml-1 rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">+{group.amendments.length}</span>
            {/if}
          </td>
          <td class="max-w-md px-3 py-3">
            <p class="line-clamp-2">{motion.motion_text}</p>
          </td>
          <td class="px-3 py-3 text-xs">{motion.maker ?? '—'}</td>
          <td class="px-3 py-3">
            <span class="rounded-full px-2 py-0.5 text-xs font-medium {RESULT_COLORS[motion.result]}">
              {RESULT_LABELS[motion.result] ?? motion.result}
            </span>
          </td>
          <td class="px-3 py-3 text-xs">
            {#if motion.vote_for !== null}
              <span class="text-green-600">{motion.vote_for}</span>/<span class="text-red-600">{motion.vote_against ?? 0}</span>/{motion.vote_abstain ?? 0}
            {:else}
              —
            {/if}
          </td>
          <td class="px-3 py-3">
            <span class="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{CATEGORY_LABELS[motion.category] ?? motion.category}</span>
          </td>
        </tr>

        <!-- Main motion expanded detail -->
        {#if expandedKey === gKey}
          <tr class="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <td colspan="8" class="px-6 py-4">
              {@render detailPanel(motion)}
            </td>
          </tr>
        {/if}

        <!-- Amendment sub-rows -->
        {#each group.amendments as amendment, ai (amendment.motion_number)}
          {@const aKey = `a-${currentPage * pageSize + gi}-${ai}`}
          <tr
            class="border-primary-200 dark:border-primary-800 cursor-pointer border-b border-l-2 bg-gray-50/50 hover:bg-gray-100/70 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
            onclick={() => toggleExpand(aKey)}
          >
            <td class="px-3 py-2 text-xs text-gray-400">
              {expandedKey === aKey ? '▾' : '▸'}
            </td>
            <td class="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">{amendment.year}</td>
            <td class="px-3 py-2 font-mono text-xs">
              <span class="text-primary-600 dark:text-primary-400 ml-3">{amendment.motion_number}</span>
            </td>
            <td class="max-w-md px-3 py-2">
              <p class="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{amendment.motion_text}</p>
            </td>
            <td class="px-3 py-2 text-xs text-gray-500">{amendment.maker ?? '—'}</td>
            <td class="px-3 py-2">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium {RESULT_COLORS[amendment.result]}">
                {RESULT_LABELS[amendment.result] ?? amendment.result}
              </span>
            </td>
            <td class="px-3 py-2 text-xs">
              {#if amendment.vote_for !== null}
                <span class="text-green-600">{amendment.vote_for}</span>/<span class="text-red-600">{amendment.vote_against ?? 0}</span>/{amendment.vote_abstain ?? 0}
              {:else}
                —
              {/if}
            </td>
            <td class="px-3 py-2">
              <span class="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{CATEGORY_LABELS[amendment.category] ?? amendment.category}</span>
            </td>
          </tr>

          {#if expandedKey === aKey}
            <tr class="border-primary-200 dark:border-primary-800 border-b border-l-2 bg-gray-100 dark:bg-gray-900">
              <td colspan="8" class="px-6 py-4">
                {@render detailPanel(amendment)}
              </td>
            </tr>
          {/if}
        {/each}
      {/each}

      {#if pagedGroups.length === 0}
        <tr>
          <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400"> No motions match your filters. </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<!-- Pagination -->
{#if totalPages > 1}
  <div class="mt-4 flex items-center justify-between">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, groups.length)} of {groups.length} motions
    </p>
    <div class="flex gap-2">
      <button
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        disabled={currentPage === 0}
        onclick={() => (currentPage = currentPage - 1)}
      >
        Previous
      </button>
      <button
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        disabled={currentPage >= totalPages - 1}
        onclick={() => (currentPage = currentPage + 1)}
      >
        Next
      </button>
    </div>
  </div>
{/if}
