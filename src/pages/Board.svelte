<script lang="ts">
  import BoardMembers from '@components/BoardMembers.svelte';

  let members = $state<any[]>([]);
  let loading = $state(true);

  async function loadData() {
    try {
      const res = await fetch('./data/board_terms.json');
      if (res.ok) members = await res.json();
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
      <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
      <p class="text-gray-500 dark:text-gray-400">Loading board data...</p>
    </div>
  </div>
{:else}
  <BoardMembers {members} />
{/if}
