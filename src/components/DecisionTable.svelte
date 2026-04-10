<script lang="ts">
  import { CATEGORY_LABELS, RESULT_LABELS, RESULT_COLORS, type Motion, type SortState } from '$types/index';

  interface Props {
    motions: Motion[];
    sort: SortState;
    onsort: (sort: SortState) => void;
  }

  let { motions, sort, onsort }: Props = $props();

  let expandedRow = $state<number | null>(null);
  let currentPage = $state(0);
  const pageSize = 50;

  let pagedMotions = $derived(motions.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
  let totalPages = $derived(Math.ceil(motions.length / pageSize));

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

  function toggleExpand(index: number) {
    expandedRow = expandedRow === index ? null : index;
  }

  // Reset page when motions change
  $effect(() => {
    void motions.length;
    currentPage = 0;
  });
</script>

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
      {#each pagedMotions as motion, i (currentPage * pageSize + i)}
        {@const globalIndex = currentPage * pageSize + i}
        <tr class="cursor-pointer border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700" onclick={() => toggleExpand(globalIndex)}>
          <td class="px-3 py-3 text-gray-400">
            {expandedRow === globalIndex ? '▾' : '▸'}
          </td>
          <td class="px-3 py-3 font-medium text-gray-900 dark:text-white">{motion.year}</td>
          <td class="px-3 py-3 font-mono">{motion.motion_number ?? '—'}</td>
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

        {#if expandedRow === globalIndex}
          <tr class="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <td colspan="8" class="px-6 py-4">
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
            </td>
          </tr>
        {/if}
      {/each}

      {#if pagedMotions.length === 0}
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
      Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, motions.length)} of {motions.length}
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
