<script lang="ts">
  import Elections from '@components/Elections.svelte';

  let entries = $state<any[]>([]);
  let loading = $state(true);

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
  <Elections {entries} />
{/if}
