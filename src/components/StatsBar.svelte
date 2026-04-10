<script lang="ts">
  import type { Motion } from '$types/index';
  import { getStats } from '@utils/filters';

  interface Props {
    motions: Motion[];
  }

  let { motions }: Props = $props();

  let stats = $derived(getStats(motions));
</script>

<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
  <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Motions</p>
    <p class="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
  </div>
  <div class="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-800 dark:bg-green-900/30">
    <p class="text-sm font-medium text-green-600 dark:text-green-400">Carried/Adopted</p>
    <p class="text-3xl font-bold text-green-700 dark:text-green-300">{stats.carried}</p>
    {#if stats.total > 0}
      <p class="text-xs text-green-500">{((stats.carried / stats.total) * 100).toFixed(0)}%</p>
    {/if}
  </div>
  <div class="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-900/30">
    <p class="text-sm font-medium text-red-600 dark:text-red-400">Failed</p>
    <p class="text-3xl font-bold text-red-700 dark:text-red-300">{stats.failed}</p>
    {#if stats.total > 0}
      <p class="text-xs text-red-500">{((stats.failed / stats.total) * 100).toFixed(0)}%</p>
    {/if}
  </div>
  <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Other</p>
    <p class="text-3xl font-bold text-gray-700 dark:text-gray-300">{stats.other}</p>
    <p class="text-xs text-gray-400">committed, withdrawn, tabled, etc.</p>
  </div>
</div>
