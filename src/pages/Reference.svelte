<script lang="ts">
  let data = $state<any>(null);
  let guide = $state<any>(null);
  let loading = $state(true);
  let search = $state('');
  let showAllPolicies = $state(false);
  let showAllTimeline = $state(false);

  async function loadData() {
    try {
      const [r1, r2] = await Promise.all([fetch('./data/gwsna_reference.json'), fetch('./data/gwsna_extracted.json')]);
      if (r1.ok) data = await r1.json();
      if (r2.ok) guide = await r2.json();
    } catch {
      // silently fail
    }
    loading = false;
  }

  $effect(() => {
    loadData();
  });

  let visibleTimeline = $derived(showAllTimeline ? (guide?.conference_timeline ?? []) : (guide?.conference_timeline ?? []).slice(0, 8));
  let visiblePolicies = $derived(showAllPolicies ? (guide?.key_policies ?? []) : (guide?.key_policies ?? []).slice(0, 8));

  let combinedGlossary = $derived.by(() => {
    if (!data?.glossary) return [];
    const base: any[] = data.glossary;
    const additions: any[] = guide?.glossary_additions ?? [];
    const existing = new Set(base.map((g: any) => g.term.toLowerCase()));
    const merged = [...base, ...additions.filter((g: any) => !existing.has(g.term.toLowerCase()))];
    if (!search) return merged;
    const q = search.toLowerCase();
    return merged.filter((g: any) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q));
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

    <!-- Roles & Responsibilities -->
    {#if guide?.roles?.length}
      <section>
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Roles &amp; Responsibilities</h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each guide.roles as role (role.title)}
            <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div class="mb-2 flex items-start justify-between gap-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {role.title}{#if role.abbreviation && role.abbreviation !== 'None'}&nbsp;<span class="text-primary-600 dark:text-primary-400 text-xs">({role.abbreviation})</span>{/if}
                </h4>
                {#if role.term_length && !role.term_length.toLowerCase().includes('not')}
                  <span class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">{role.term_length}</span>
                {/if}
              </div>
              <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
              {#if role.how_selected}
                <p class="mb-2 text-xs text-gray-500 dark:text-gray-500"><span class="font-medium">Selected:</span> {role.how_selected}</p>
              {/if}
              {#if role.responsibilities?.length}
                <ul class="space-y-1">
                  {#each role.responsibilities as r (r)}
                    <li class="flex gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <span class="text-primary-500 mt-0.5 shrink-0">•</span>{r}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- WSC Seating -->
    {#if guide?.seating_categories?.length}
      <section>
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">WSC Seating Categories</h2>
        <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">Vote</th>
                <th class="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {#each guide.seating_categories as seat (seat.category)}
                <tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{seat.category}</td>
                  <td class="px-4 py-3">
                    {#if seat.vote === 'Yes'}
                      <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">Yes</span>
                    {:else}
                      <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">{seat.vote}</span>
                    {/if}
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{seat.description}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}

    <!-- Glossary -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Glossary of Terms</h2>
      <input
        type="search"
        class="focus:border-primary-500 focus:ring-primary-500 mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="Search {combinedGlossary.length + (search ? 0 : 0)} terms..."
        bind:value={search}
      />
      <div class="grid gap-3 md:grid-cols-2">
        {#each combinedGlossary as item (item.term)}
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <dt class="font-semibold text-gray-900 dark:text-white">{item.term}</dt>
            <dd class="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.definition}</dd>
          </div>
        {/each}
      </div>
    </section>

    <!-- Motion Outcomes -->
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Motion Outcomes</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.motion_outcomes as outcome (outcome.result)}
          {@const colors: Record<string, string> = {
            green: 'border-green-200 dark:border-green-800',
            red: 'border-red-200 dark:border-red-800',
            blue: 'border-blue-200 dark:border-blue-800',
            purple: 'border-purple-200 dark:border-purple-800',
            yellow: 'border-yellow-200 dark:border-yellow-800',
            gray: 'border-gray-200 dark:border-gray-700'
          }}
          {@const badges: Record<string, string> = {
            green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
            red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
            blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
            purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
            yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
            gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }}
          <div class="rounded-lg border-l-4 bg-white p-4 shadow-sm dark:bg-gray-800 {colors[outcome.color]}">
            <span class="mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold {badges[outcome.color]}">{outcome.label}</span>
            <p class="text-sm text-gray-600 dark:text-gray-400">{outcome.description}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- CAR Process -->
    {#if guide?.car_process}
      <section>
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">CAR Process</h2>
        <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">{guide.car_process.description}</p>
          {#if guide.car_process.steps?.length}
            <ol class="space-y-2">
              {#each guide.car_process.steps as step, i (i)}
                <li class="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span class="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span
                  >
                  {step}
                </li>
              {/each}
            </ol>
          {/if}
        </div>
      </section>
    {/if}

    <!-- CAT Process -->
    {#if guide?.cat_process}
      <section>
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">CAT Process</h2>
        <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">{guide.cat_process.description}</p>
          {#if guide.cat_process.steps?.length}
            <ol class="mb-4 space-y-2">
              {#each guide.cat_process.steps as step, i (i)}
                <li class="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span class="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span
                  >
                  {step}
                </li>
              {/each}
            </ol>
          {/if}
          {#if guide.cat_process.categories?.length}
            <p class="mb-2 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">CAT Categories</p>
            <div class="flex flex-wrap gap-2">
              {#each guide.cat_process.categories as cat (cat)}
                <span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">{cat}</span>
              {/each}
            </div>
          {/if}
        </div>
      </section>
    {/if}

    <!-- Conference Timeline -->
    {#if guide?.conference_timeline?.length}
      <section>
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Conference Timeline</h2>
        <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-4 py-3">Phase / Milestone</th>
                <th class="px-4 py-3">Timing</th>
                <th class="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {#each visibleTimeline as item, i (i)}
                <tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.phase}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{item.timing}</td>
                  <td class="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{item.description}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        {#if guide.conference_timeline.length > 8}
          <button class="text-primary-600 hover:text-primary-700 dark:text-primary-400 mt-2 text-sm font-medium" onclick={() => (showAllTimeline = !showAllTimeline)}>
            {showAllTimeline ? 'Show less' : `Show all ${guide.conference_timeline.length} items`}
          </button>
        {/if}
      </section>
    {/if}

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

    <!-- Key Policies -->
    {#if guide?.key_policies?.length}
      <section>
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Key Policies</h2>
        <div class="grid gap-3 md:grid-cols-2">
          {#each visiblePolicies as policy (policy.policy)}
            <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">{policy.policy}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{policy.description}</p>
            </div>
          {/each}
        </div>
        {#if guide.key_policies.length > 8}
          <button class="text-primary-600 hover:text-primary-700 dark:text-primary-400 mt-2 text-sm font-medium" onclick={() => (showAllPolicies = !showAllPolicies)}>
            {showAllPolicies ? 'Show less' : `Show all ${guide.key_policies.length} policies`}
          </button>
        {/if}
      </section>
    {/if}

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
