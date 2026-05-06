<script lang="ts">
  import BoardMembers from '@components/BoardMembers.svelte';

  let members = $state<any[]>([]);
  let hrpCoface = $state<{ hrp: any[]; cofacilitators: any[] }>({ hrp: [], cofacilitators: [] });
  let loading = $state(true);

  async function loadData() {
    try {
      const [boardRes, hrpRes] = await Promise.all([fetch('./data/board_terms.json'), fetch('./data/hrp_coface.json')]);
      if (boardRes.ok) members = await boardRes.json();
      if (hrpRes.ok) hrpCoface = await hrpRes.json();
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
      <p class="text-primary-400 dark:text-primary-500 text-sm tracking-wide">Loading board data&hellip;</p>
    </div>
  </div>
{:else}
  <BoardMembers {members} hrp={hrpCoface.hrp} cofacilitators={hrpCoface.cofacilitators} />
{/if}
