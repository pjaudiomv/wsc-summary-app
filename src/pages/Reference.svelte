<script lang="ts">
  let data = $state<any>(null);
  let loading = $state(true);
  let search = $state('');

  async function loadData() {
    try {
      const res = await fetch('./data/gwsna_reference.json');
      if (res.ok) data = await res.json();
    } catch {
      // silently fail
    }
    loading = false;
  }

  $effect(() => {
    loadData();
  });

  let filteredGlossary = $derived(() => {
    if (!data?.glossary) return [];
    if (!search) return data.glossary;
    const q = search.toLowerCase();
    return data.glossary.filter((g: any) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q));
  });
</script>

{#if loading}
  <div class="flex items-center justify-center py-24">
    <div class="text-center">
      <div class="border-t-primary-600 mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200"></div>
      <p class="text-gray-500 dark:text-gray-400">Loading reference data...</p>
    </div>
  </div>
{:else if data}
  <div class="space-y-8">
    <!-- Source -->
    <p class="text-sm text-gray-500 italic dark:text-gray-400">
      Source: {data.source}
    </p>

    <!-- Current Cycle -->
    <div class="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20 rounded-lg border p-5 shadow-sm">
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Current Conference Cycle: {data.current_cycle.cycle}</h2>
      <div class="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <span class="font-medium text-gray-600 dark:text-gray-400">Next WSC:</span>
          <span class="text-gray-900 dark:text-white"> {data.current_cycle.next_wsc}</span>
        </div>
        <div>
          <span class="font-medium text-gray-600 dark:text-gray-400">Interim WSC:</span>
          <span class="text-gray-900 dark:text-white"> {data.current_cycle.interim_wsc}</span>
        </div>
        <div>
          <span class="font-medium text-gray-600 dark:text-gray-400">CAR Available:</span>
          <span class="text-gray-900 dark:text-white"> {data.current_cycle.car_available}</span>
        </div>
        <div>
          <span class="font-medium text-gray-600 dark:text-gray-400">CAT Available:</span>
          <span class="text-gray-900 dark:text-white"> {data.current_cycle.cat_available}</span>
        </div>
        <div>
          <span class="font-medium text-gray-600 dark:text-gray-400">Unity Day 2025:</span>
          <span class="text-gray-900 dark:text-white"> {data.current_cycle.unity_day_2025}</span>
        </div>
      </div>
    </div>

    <!-- Glossary -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Glossary of Terms</h2>
      <input
        type="search"
        class="focus:border-primary-500 focus:ring-primary-500 mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="Search terms..."
        bind:value={search}
      />
      <div class="grid gap-3 md:grid-cols-2">
        {#each filteredGlossary() as item (item.term)}
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <dt class="font-semibold text-gray-900 dark:text-white">{item.term}</dt>
            <dd class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.definition}</dd>
          </div>
        {/each}
      </div>
    </section>

    <!-- Consensus Thresholds -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Consensus Thresholds</h2>
      <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th class="px-4 py-3">Level</th>
              <th class="px-4 py-3">Percentage</th>
              <th class="px-4 py-3">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {#each data.consensus_thresholds as threshold (threshold.level)}
              <tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{threshold.level}</td>
                <td class="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">{threshold.percentage}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{threshold.description}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Decision-Making Process -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Decision-Making Process</h2>
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ol class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {#each data.decision_process as step, i (i)}
            <li>{step}</li>
          {/each}
        </ol>
      </div>
    </section>

    <!-- Vote Types -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Types of Votes</h2>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {#each data.vote_types as vt (vt.type)}
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 class="font-semibold text-gray-900 dark:text-white">{vt.type}</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{vt.description}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Key Rules -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Key Rules</h2>
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {#each data.key_rules as rule, i (i)}
            <li class="flex gap-2">
              <span class="text-primary-600 mt-1">&#8226;</span>
              <span>{rule}</span>
            </li>
          {/each}
        </ul>
      </div>
    </section>

    <!-- Service Structure -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">NA Service Structure</h2>
      <div class="space-y-2">
        {#each data.service_structure as level, i (level.level)}
          <div class="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800" style="margin-left: {i * 12}px">
            <div class="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {i + 1}
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white">{level.level}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
{/if}
