<script lang="ts">
  import type { Motion } from '$types/index';
  import { getStats } from '@utils/filters';

  interface Props {
    motions: Motion[];
  }

  let { motions }: Props = $props();

  let stats = $derived(getStats(motions));

  function pct(n: number) {
    if (stats.total === 0) return '0';
    return ((n / stats.total) * 100).toFixed(0);
  }
</script>

<div class="animate-fade-up grid grid-cols-2 gap-4 md:grid-cols-4">
  <!-- Total -->
  <div class="group border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 relative rounded-lg border bg-white p-5 transition-all duration-200 hover:shadow-md">
    <div class="from-primary-400 to-primary-600 absolute top-0 left-0 h-[2px] w-full rounded-t-lg bg-gradient-to-r"></div>
    <p class="text-primary-400 dark:text-primary-500 text-xs font-semibold tracking-widest uppercase">Total Motions</p>
    <p class="text-primary-900 dark:text-primary-100 mt-2 font-[--font-serif] text-3xl font-bold">{stats.total}</p>
  </div>

  <!-- Carried -->
  <div class="group relative rounded-lg border border-emerald-200/60 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-emerald-800/40 dark:bg-emerald-950/20">
    <div class="absolute top-0 left-0 h-[2px] w-full rounded-t-lg bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
    <p class="text-xs font-semibold tracking-widest text-emerald-600/70 uppercase dark:text-emerald-400/70">Carried / Adopted</p>
    <p class="mt-2 font-[--font-serif] text-3xl font-bold text-emerald-800 dark:text-emerald-300">{stats.carried}</p>
    {#if stats.total > 0}
      <p class="mt-1 text-xs font-medium text-emerald-500/80 dark:text-emerald-500">{pct(stats.carried)}% of total</p>
    {/if}
  </div>

  <!-- Failed -->
  <div class="group relative rounded-lg border border-rose-200/60 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-rose-800/40 dark:bg-rose-950/20">
    <div class="absolute top-0 left-0 h-[2px] w-full rounded-t-lg bg-gradient-to-r from-rose-400 to-rose-600"></div>
    <p class="text-xs font-semibold tracking-widest text-rose-600/70 uppercase dark:text-rose-400/70">Failed</p>
    <p class="mt-2 font-[--font-serif] text-3xl font-bold text-rose-800 dark:text-rose-300">{stats.failed}</p>
    {#if stats.total > 0}
      <p class="mt-1 text-xs font-medium text-rose-500/80 dark:text-rose-500">{pct(stats.failed)}% of total</p>
    {/if}
  </div>

  <!-- Other -->
  <div class="group border-primary-200/60 dark:border-primary-700/40 dark:bg-primary-900/30 relative rounded-lg border bg-white p-5 transition-all duration-200 hover:shadow-md">
    <div class="absolute top-0 left-0 h-[2px] w-full rounded-t-lg bg-gradient-to-r from-amber-400 to-amber-600"></div>
    <p class="text-primary-400 dark:text-primary-500 text-xs font-semibold tracking-widest uppercase">Other</p>
    <p class="text-primary-800 dark:text-primary-200 mt-2 font-[--font-serif] text-3xl font-bold">{stats.other}</p>
    <p class="text-primary-400 dark:text-primary-500 mt-1 text-xs">committed, withdrawn, tabled&hellip;</p>
  </div>
</div>
