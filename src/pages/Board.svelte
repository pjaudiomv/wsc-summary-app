<script lang="ts">
  import Elections from '@components/Elections.svelte';
  import CorrectionModal from '@components/CorrectionModal.svelte';

  let entries = $state<any[]>([]);
  let loading = $state(true);
  let correctionOpen = $state(false);

  async function loadData() {
    try {
      const res = await fetch('./data/elections.json');
      if (res.ok) entries = await res.json();
    } catch {
      // silently fail
    }
    loading = false;
  }

  $effect(() => {
    loadData();
  });
</script>

{#if loading}
  <div class="flex items-center justify-center py-24">
    <div class="text-center">
      <div class="border-primary-200 dark:border-primary-700 border-t-accent-500 mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2"></div>
      <p class="text-primary-400 dark:text-primary-500 text-sm tracking-wide">Loading elections data&hellip;</p>
    </div>
  </div>
{:else}
  <div class="space-y-6">
    <div class="flex">
      <button
        onclick={() => (correctionOpen = true)}
        class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 text-primary-500 dark:text-primary-400 hover:bg-accent-50 dark:hover:bg-primary-800 hover:border-accent-300 dark:hover:border-accent-700 flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        </svg>
        Corrections
      </button>
    </div>
    <Elections {entries} />
  </div>
{/if}

{#if correctionOpen}
  <CorrectionModal motion={null} onclose={() => (correctionOpen = false)} />
{/if}
