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
<div class="bg-primary-900/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm dark:bg-black/70" role="dialog" aria-modal="true" aria-label="Maker tally">
  <!-- Modal -->
  <div class="border-primary-200 dark:border-primary-700 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border bg-white shadow-2xl dark:bg-[#141e2e]">
    <!-- Header -->
    <div class="border-primary-200 dark:border-primary-700 flex items-center justify-between border-b px-6 py-5">
      <div>
        <h2 class="text-primary-900 dark:text-primary-100 font-[--font-serif] text-lg font-bold">Maker Tally</h2>
        <p class="text-primary-400 dark:text-primary-500 mt-0.5 text-xs">{rows.length} makers <span class="text-accent-500">&middot;</span> click a row to filter</p>
      </div>
      <button
        onclick={onclose}
        class="text-primary-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-800 dark:hover:text-primary-200 rounded-lg p-2 transition-colors"
        aria-label="Close"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>

    <!-- Search -->
    <div class="border-primary-200 dark:border-primary-700 border-b px-6 py-3">
      <input
        type="search"
        class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full rounded-lg border bg-[#faf8f5] p-2.5 text-sm transition-colors focus:ring-1"
        placeholder="Search makers..."
        bind:value={search}
      />
    </div>

    <!-- Table -->
    <div class="min-h-0 flex-1 overflow-y-auto">
      <table class="w-full text-sm">
        <thead class="bg-primary-50 border-primary-100 dark:border-primary-700 sticky top-0 border-b dark:bg-[#0f1824]">
          <tr>
            <th
              class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-6 py-3 text-left text-xs font-semibold tracking-widest uppercase transition-colors"
              onclick={() => setSort('maker')}
            >
              Maker{arrow('maker')}
            </th>
            <th
              class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-widest uppercase transition-colors"
              onclick={() => setSort('total')}
            >
              Total{arrow('total')}
            </th>
            <th
              class="cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-widest text-emerald-600 uppercase transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
              onclick={() => setSort('carried')}
            >
              Carried{arrow('carried')}
            </th>
            <th
              class="cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-widest text-rose-600 uppercase transition-colors hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200"
              onclick={() => setSort('failed')}
            >
              Failed{arrow('failed')}
            </th>
          </tr>
        </thead>
        <tbody class="divide-primary-100 dark:divide-primary-800 divide-y">
          {#each rows as row (row.maker)}
            {@const selected = selectedMakers.includes(row.maker)}
            <tr
              class="cursor-pointer transition-colors duration-150 {selected ? 'bg-accent-50/60 dark:bg-accent-900/20' : 'hover:bg-primary-50 dark:hover:bg-primary-800/40'}"
              onclick={() => ontogglemaker(row.maker)}
            >
              <td class="px-6 py-3 font-medium {selected ? 'text-accent-800 dark:text-accent-300' : 'text-primary-900 dark:text-primary-100'}">
                <div class="flex items-center gap-2">
                  {#if selected}
                    <span class="bg-accent-500 inline-block h-1.5 w-1.5 rounded-full"></span>
                  {/if}
                  {row.maker}
                </div>
              </td>
              <td class="text-primary-900 dark:text-primary-100 px-4 py-3 text-right font-[--font-serif] font-bold">{row.total}</td>
              <td class="px-4 py-3 text-right font-medium text-emerald-700 dark:text-emerald-400">{row.carried > 0 ? row.carried : '—'}</td>
              <td class="px-4 py-3 text-right font-medium text-rose-600 dark:text-rose-400">{row.failed > 0 ? row.failed : '—'}</td>
            </tr>
          {/each}
          {#if rows.length === 0}
            <tr><td colspan="4" class="text-primary-400 dark:text-primary-500 px-6 py-10 text-center font-[--font-serif] italic">No makers match</td></tr>
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    {#if selectedMakers.length > 0}
      <div class="border-primary-200 dark:border-primary-700 flex items-center justify-between border-t px-6 py-3.5">
        <span class="text-primary-500 dark:text-primary-400 text-sm">{selectedMakers.length} maker{selectedMakers.length > 1 ? 's' : ''} selected</span>
        <button
          class="text-sm font-medium text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400"
          onclick={() => {
            selectedMakers.forEach((m) => ontogglemaker(m));
          }}>Clear selection</button
        >
      </div>
    {/if}
  </div>
</div>
