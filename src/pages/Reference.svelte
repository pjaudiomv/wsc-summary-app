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
      <div class="border-primary-200 dark:border-primary-700 border-t-accent-500 mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2"></div>
      <p class="text-primary-400 dark:text-primary-500 text-sm tracking-wide">Loading reference data&hellip;</p>
    </div>
  </div>
{:else if data}
  <div class="space-y-10">
    <!-- Source -->
    <p class="text-primary-400 dark:text-primary-500 animate-fade-up text-sm tracking-wide italic">
      Source: {data.source}
    </p>

    <!-- Current Cycle -->
    <div
      class="animate-fade-up border-l-accent-400 border-accent-200/40 dark:border-accent-800/30 bg-accent-50/30 dark:bg-accent-900/10 rounded-lg border border-l-4 p-6"
      style="animation-delay: 50ms"
    >
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Current Conference Cycle: {data.current_cycle.cycle}</h2>
      <div class="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <span class="text-primary-400 dark:text-primary-500 text-xs font-semibold tracking-widest uppercase">Next WSC</span>
          <p class="text-primary-800 dark:text-primary-200 mt-0.5 font-medium">{data.current_cycle.next_wsc}</p>
        </div>
        <div>
          <span class="text-primary-400 dark:text-primary-500 text-xs font-semibold tracking-widest uppercase">Interim WSC</span>
          <p class="text-primary-800 dark:text-primary-200 mt-0.5 font-medium">{data.current_cycle.interim_wsc}</p>
        </div>
        <div>
          <span class="text-primary-400 dark:text-primary-500 text-xs font-semibold tracking-widest uppercase">CAR Available</span>
          <p class="text-primary-800 dark:text-primary-200 mt-0.5 font-medium">{data.current_cycle.car_available}</p>
        </div>
        <div>
          <span class="text-primary-400 dark:text-primary-500 text-xs font-semibold tracking-widest uppercase">CAT Available</span>
          <p class="text-primary-800 dark:text-primary-200 mt-0.5 font-medium">{data.current_cycle.cat_available}</p>
        </div>
        <div>
          <span class="text-primary-400 dark:text-primary-500 text-xs font-semibold tracking-widest uppercase">Unity Day 2025</span>
          <p class="text-primary-800 dark:text-primary-200 mt-0.5 font-medium">{data.current_cycle.unity_day_2025}</p>
        </div>
      </div>
    </div>

    <!-- Roles & Responsibilities -->
    {#if guide?.roles?.length}
      <section class="animate-fade-up" style="animation-delay: 100ms">
        <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Roles &amp; Responsibilities</h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each guide.roles as role (role.title)}
            <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-5 transition-all duration-200 hover:shadow-md">
              <div class="mb-2 flex items-start justify-between gap-2">
                <h4 class="text-primary-900 dark:text-primary-100 font-semibold">
                  {role.title}{#if role.abbreviation && role.abbreviation !== 'None'}&nbsp;<span class="text-accent-600 dark:text-accent-400 text-xs font-semibold">({role.abbreviation})</span>{/if}
                </h4>
                {#if role.term_length && !role.term_length.toLowerCase().includes('not')}
                  <span
                    class="border-primary-200/60 dark:border-primary-700/60 bg-primary-50 dark:bg-primary-800/40 text-primary-500 dark:text-primary-400 shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium"
                    >{role.term_length}</span
                  >
                {/if}
              </div>
              <p class="text-primary-600 dark:text-primary-400 mb-2 text-sm leading-relaxed">{role.description}</p>
              {#if role.how_selected}
                <p class="text-primary-400 dark:text-primary-500 mb-2 text-xs"><span class="font-semibold">Selected:</span> {role.how_selected}</p>
              {/if}
              {#if role.responsibilities?.length}
                <ul class="mt-3 space-y-1">
                  {#each role.responsibilities as r (r)}
                    <li class="text-primary-600 dark:text-primary-400 flex gap-2 text-xs">
                      <span class="text-accent-500 mt-0.5 shrink-0">&bull;</span>{r}
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
      <section class="animate-fade-up" style="animation-delay: 150ms">
        <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">WSC Seating Categories</h2>
        <div class="border-primary-200 dark:border-primary-700 overflow-x-auto rounded-lg border shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="border-primary-200 dark:border-primary-700 bg-primary-50/80 dark:bg-primary-900/60 border-b-2">
              <tr>
                <th class="text-primary-500 dark:text-primary-400 px-5 py-3.5 text-xs font-semibold tracking-widest uppercase">Category</th>
                <th class="text-primary-500 dark:text-primary-400 px-4 py-3.5 text-xs font-semibold tracking-widest uppercase">Vote</th>
                <th class="text-primary-500 dark:text-primary-400 px-4 py-3.5 text-xs font-semibold tracking-widest uppercase">Description</th>
              </tr>
            </thead>
            <tbody>
              {#each guide.seating_categories as seat (seat.category)}
                <tr class="border-primary-100 dark:border-primary-800 dark:bg-primary-900/30 hover:bg-accent-50/40 dark:hover:bg-primary-800/50 border-b bg-white transition-colors">
                  <td class="text-primary-900 dark:text-primary-100 px-5 py-3 font-medium">{seat.category}</td>
                  <td class="px-4 py-3">
                    {#if seat.vote === 'Yes'}
                      <span
                        class="rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-300"
                        >Yes</span
                      >
                    {:else}
                      <span
                        class="bg-primary-50 dark:bg-primary-800/40 border-primary-200/60 dark:border-primary-700/60 text-primary-500 dark:text-primary-400 rounded-md border px-2 py-0.5 text-xs font-medium"
                        >{seat.vote}</span
                      >
                    {/if}
                  </td>
                  <td class="text-primary-600 dark:text-primary-400 px-4 py-3 text-xs">{seat.description}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}

    <!-- Glossary -->
    <section class="animate-fade-up" style="animation-delay: 200ms">
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Glossary of Terms</h2>
      <input
        type="search"
        class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 mb-4 block w-full rounded-lg border bg-white p-3 text-sm transition-colors focus:ring-1"
        placeholder="Search {combinedGlossary.length + (search ? 0 : 0)} terms..."
        bind:value={search}
      />
      <div class="grid gap-3 md:grid-cols-2">
        {#each combinedGlossary as item (item.term)}
          <div
            class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 hover:border-accent-200 dark:hover:border-accent-800 rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-md"
          >
            <dt class="text-primary-900 dark:text-primary-100 font-[--font-serif] font-bold">{item.term}</dt>
            <dd class="text-primary-600 dark:text-primary-400 mt-1.5 text-sm leading-relaxed">{item.definition}</dd>
          </div>
        {/each}
      </div>
    </section>

    <!-- Motion Outcomes -->
    <section>
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Motion Outcomes</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.motion_outcomes as outcome (outcome.result)}
          {@const colors: Record<string, string> = {
            green: 'border-l-emerald-500',
            red: 'border-l-rose-500',
            blue: 'border-l-sky-500',
            purple: 'border-l-violet-500',
            yellow: 'border-l-amber-500',
            gray: 'border-l-primary-400'
          }}
          {@const badges: Record<string, string> = {
            green: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
            red: 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40',
            blue: 'bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40',
            purple: 'bg-violet-50 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40',
            yellow: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
            gray: 'bg-primary-50 text-primary-700 dark:bg-primary-800/40 dark:text-primary-300 border border-primary-200/60 dark:border-primary-700/60'
          }}
          <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border border-l-4 bg-white p-4 transition-all duration-200 hover:shadow-md {colors[outcome.color]}">
            <span class="mb-2 inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold {badges[outcome.color]}">{outcome.label}</span>
            <p class="text-primary-600 dark:text-primary-400 text-sm leading-relaxed">{outcome.description}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- CAR Process -->
    {#if guide?.car_process}
      <section>
        <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">CAR Process</h2>
        <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-6">
          <p class="text-primary-600 dark:text-primary-400 mb-4 text-sm leading-relaxed">{guide.car_process.description}</p>
          {#if guide.car_process.steps?.length}
            <ol class="space-y-3">
              {#each guide.car_process.steps as step, i (i)}
                <li class="text-primary-700 dark:text-primary-300 flex gap-3 text-sm">
                  <span
                    class="bg-accent-100 dark:bg-accent-900/30 border-accent-200/60 dark:border-accent-800/40 text-accent-800 dark:text-accent-300 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
                    >{i + 1}</span
                  >
                  <span class="pt-0.5 leading-relaxed">{step}</span>
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
        <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">CAT Process</h2>
        <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-6">
          <p class="text-primary-600 dark:text-primary-400 mb-4 text-sm leading-relaxed">{guide.cat_process.description}</p>
          {#if guide.cat_process.steps?.length}
            <ol class="mb-5 space-y-3">
              {#each guide.cat_process.steps as step, i (i)}
                <li class="text-primary-700 dark:text-primary-300 flex gap-3 text-sm">
                  <span
                    class="bg-accent-100 dark:bg-accent-900/30 border-accent-200/60 dark:border-accent-800/40 text-accent-800 dark:text-accent-300 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
                    >{i + 1}</span
                  >
                  <span class="pt-0.5 leading-relaxed">{step}</span>
                </li>
              {/each}
            </ol>
          {/if}
          {#if guide.cat_process.categories?.length}
            <p class="text-primary-400 dark:text-primary-500 mb-2 text-xs font-semibold tracking-widest uppercase">CAT Categories</p>
            <div class="flex flex-wrap gap-2">
              {#each guide.cat_process.categories as cat (cat)}
                <span
                  class="rounded-md border border-violet-200/60 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:border-violet-800/40 dark:bg-violet-900/30 dark:text-violet-300"
                  >{cat}</span
                >
              {/each}
            </div>
          {/if}
        </div>
      </section>
    {/if}

    <!-- Conference Timeline -->
    {#if guide?.conference_timeline?.length}
      <section>
        <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Conference Timeline</h2>
        <div class="border-primary-200 dark:border-primary-700 overflow-x-auto rounded-lg border shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="border-primary-200 dark:border-primary-700 bg-primary-50/80 dark:bg-primary-900/60 border-b-2">
              <tr>
                <th class="text-primary-500 dark:text-primary-400 px-5 py-3.5 text-xs font-semibold tracking-widest uppercase">Phase / Milestone</th>
                <th class="text-primary-500 dark:text-primary-400 px-4 py-3.5 text-xs font-semibold tracking-widest uppercase">Timing</th>
                <th class="text-primary-500 dark:text-primary-400 px-4 py-3.5 text-xs font-semibold tracking-widest uppercase">Description</th>
              </tr>
            </thead>
            <tbody>
              {#each visibleTimeline as item, i (i)}
                <tr class="border-primary-100 dark:border-primary-800 dark:bg-primary-900/30 hover:bg-accent-50/40 dark:hover:bg-primary-800/50 border-b bg-white transition-colors">
                  <td class="text-primary-900 dark:text-primary-100 px-5 py-3 font-medium">{item.phase}</td>
                  <td class="text-primary-500 dark:text-primary-400 px-4 py-3 font-mono text-xs">{item.timing}</td>
                  <td class="text-primary-600 dark:text-primary-400 px-4 py-3 text-xs leading-relaxed">{item.description}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        {#if guide.conference_timeline.length > 8}
          <button
            class="text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 mt-3 text-sm font-medium transition-colors"
            onclick={() => (showAllTimeline = !showAllTimeline)}
          >
            {showAllTimeline ? 'Show less' : `Show all ${guide.conference_timeline.length} items`}
          </button>
        {/if}
      </section>
    {/if}

    <!-- Consensus Thresholds -->
    <section>
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Consensus Thresholds</h2>
      <div class="border-primary-200 dark:border-primary-700 overflow-x-auto rounded-lg border shadow-sm">
        <table class="w-full text-left text-sm">
          <thead class="border-primary-200 dark:border-primary-700 bg-primary-50/80 dark:bg-primary-900/60 border-b-2">
            <tr>
              <th class="text-primary-500 dark:text-primary-400 px-5 py-3.5 text-xs font-semibold tracking-widest uppercase">Level</th>
              <th class="text-primary-500 dark:text-primary-400 px-4 py-3.5 text-xs font-semibold tracking-widest uppercase">Percentage</th>
              <th class="text-primary-500 dark:text-primary-400 px-4 py-3.5 text-xs font-semibold tracking-widest uppercase">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {#each data.consensus_thresholds as threshold (threshold.level)}
              <tr class="border-primary-100 dark:border-primary-800 dark:bg-primary-900/30 hover:bg-accent-50/40 dark:hover:bg-primary-800/50 border-b bg-white transition-colors">
                <td class="text-primary-900 dark:text-primary-100 px-5 py-3 font-medium">{threshold.level}</td>
                <td class="text-accent-700 dark:text-accent-400 px-4 py-3 font-mono text-sm font-semibold">{threshold.percentage}</td>
                <td class="text-primary-600 dark:text-primary-400 px-4 py-3">{threshold.description}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Decision-Making Process -->
    <section>
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Decision-Making Process</h2>
      <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-6">
        <ol class="text-primary-700 dark:text-primary-300 space-y-2.5 text-sm">
          {#each data.decision_process as step, i (i)}
            <li class="leading-relaxed">{step}</li>
          {/each}
        </ol>
      </div>
    </section>

    <!-- Vote Types -->
    <section>
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Types of Votes</h2>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {#each data.vote_types as vt (vt.type)}
          <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-md">
            <h4 class="text-primary-900 dark:text-primary-100 font-semibold">{vt.type}</h4>
            <p class="text-primary-600 dark:text-primary-400 mt-1.5 text-sm leading-relaxed">{vt.description}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Key Policies -->
    {#if guide?.key_policies?.length}
      <section>
        <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Key Policies</h2>
        <div class="grid gap-3 md:grid-cols-2">
          {#each visiblePolicies as policy (policy.policy)}
            <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-md">
              <h4 class="text-primary-900 dark:text-primary-100 mb-1 font-semibold">{policy.policy}</h4>
              <p class="text-primary-600 dark:text-primary-400 text-sm leading-relaxed">{policy.description}</p>
            </div>
          {/each}
        </div>
        {#if guide.key_policies.length > 8}
          <button
            class="text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 mt-3 text-sm font-medium transition-colors"
            onclick={() => (showAllPolicies = !showAllPolicies)}
          >
            {showAllPolicies ? 'Show less' : `Show all ${guide.key_policies.length} policies`}
          </button>
        {/if}
      </section>
    {/if}

    <!-- Key Rules -->
    <section>
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">Key Rules</h2>
      <div class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-6">
        <ul class="text-primary-700 dark:text-primary-300 space-y-2.5 text-sm">
          {#each data.key_rules as rule, i (i)}
            <li class="flex gap-2.5 leading-relaxed">
              <span class="text-accent-500 mt-1 shrink-0">&bull;</span>
              <span>{rule}</span>
            </li>
          {/each}
        </ul>
      </div>
    </section>

    <!-- Service Structure -->
    <section>
      <h2 class="text-primary-900 dark:text-primary-100 mb-4 font-[--font-serif] text-lg font-bold">NA Service Structure</h2>
      <div class="space-y-2">
        {#each data.service_structure as level, i (level.level)}
          <div
            class="border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 flex items-start gap-3 rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-md"
            style="margin-left: {i * 16}px"
          >
            <div
              class="bg-accent-100 dark:bg-accent-900/30 border-accent-200/60 dark:border-accent-800/40 text-accent-800 dark:text-accent-300 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-[--font-serif] text-sm font-bold"
            >
              {i + 1}
            </div>
            <div>
              <h4 class="text-primary-900 dark:text-primary-100 font-semibold">{level.level}</h4>
              <p class="text-primary-600 dark:text-primary-400 text-sm leading-relaxed">{level.description}</p>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
{/if}
