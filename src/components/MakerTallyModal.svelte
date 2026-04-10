<script lang="ts">
  import type { Motion } from '$types/index';

  interface MakerRow {
    maker: string;
    total: number;
    carried: number;
    failed: number;
    other: number;
  }

  interface Props {
    motions: Motion[];
    selectedMakers: string[];
    onclose: () => void;
    ontogglemaker: (maker: string) => void;
  }

  let { motions, selectedMakers, onclose, ontogglemaker }: Props = $props();

  type SortCol = 'maker' | 'total' | 'carried' | 'failed';
  let sortCol = $state<SortCol>('total');
  let sortAsc = $state(false);
  let search = $state('');

  let rows = $derived.by(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const map = new Map<string, MakerRow>();
    for (const m of motions) {
      if (!m.maker) continue;
      if (!map.has(m.maker)) map.set(m.maker, { maker: m.maker, total: 0, carried: 0, failed: 0, other: 0 });
      const row = map.get(m.maker)!;
      row.total++;
      if (m.result === 'carried' || m.result === 'adopted') row.carried++;
      else if (m.result === 'failed') row.failed++;
      else row.other++;
    }
    let arr = [...map.values()];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((r) => r.maker.toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortCol === 'maker') return a.maker.localeCompare(b.maker) * dir;
      return (a[sortCol] - b[sortCol]) * dir;
    });
    return arr;
  });

  function setSort(col: SortCol) {
    if (sortCol === col) sortAsc = !sortAsc;
    else {
      sortCol = col;
      sortAsc = false;
    }
  }

  function arrow(col: SortCol) {
    if (sortCol !== col) return '';
    return sortAsc ? ' ▲' : ' ▼';
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={handleKey} />

<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Maker tally">
  <!-- Modal -->
  <div class="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Maker Tally</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400">{rows.length} makers · click a row to filter</p>
      </div>
      <button onclick={onclose} class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200" aria-label="Close">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>

    <!-- Search -->
    <div class="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
      <input
        type="search"
        class="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="Search makers..."
        bind:value={search}
      />
    </div>

    <!-- Table -->
    <div class="min-h-0 flex-1 overflow-y-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="cursor-pointer px-5 py-2.5 text-left font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" onclick={() => setSort('maker')}>
              Maker{arrow('maker')}
            </th>
            <th class="cursor-pointer px-3 py-2.5 text-right font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" onclick={() => setSort('total')}>
              Total{arrow('total')}
            </th>
            <th class="cursor-pointer px-3 py-2.5 text-right font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200" onclick={() => setSort('carried')}>
              Carried{arrow('carried')}
            </th>
            <th class="cursor-pointer px-3 py-2.5 text-right font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200" onclick={() => setSort('failed')}>
              Failed{arrow('failed')}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          {#each rows as row (row.maker)}
            {@const selected = selectedMakers.includes(row.maker)}
            <tr class="cursor-pointer transition-colors {selected ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}" onclick={() => ontogglemaker(row.maker)}>
              <td class="px-5 py-2.5 font-medium {selected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}">
                <div class="flex items-center gap-2">
                  {#if selected}
                    <span class="bg-primary-600 inline-block h-1.5 w-1.5 rounded-full"></span>
                  {/if}
                  {row.maker}
                </div>
              </td>
              <td class="px-3 py-2.5 text-right font-semibold text-gray-900 dark:text-white">{row.total}</td>
              <td class="px-3 py-2.5 text-right text-green-700 dark:text-green-400">{row.carried > 0 ? row.carried : '—'}</td>
              <td class="px-3 py-2.5 text-right text-red-600 dark:text-red-400">{row.failed > 0 ? row.failed : '—'}</td>
            </tr>
          {/each}
          {#if rows.length === 0}
            <tr><td colspan="4" class="px-5 py-8 text-center text-gray-400">No makers match</td></tr>
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    {#if selectedMakers.length > 0}
      <div class="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-gray-700">
        <span class="text-sm text-gray-600 dark:text-gray-400">{selectedMakers.length} maker{selectedMakers.length > 1 ? 's' : ''} selected</span>
        <button
          class="text-sm text-red-500 hover:text-red-600"
          onclick={() => {
            selectedMakers.forEach((m) => ontogglemaker(m));
          }}>Clear selection</button
        >
      </div>
    {/if}
  </div>
</div>
