<script lang="ts">
  interface BoardTerm {
    Name: string;
    'First Term Elected': number | null;
    'First Term Expires': number | null;
    'Second Term Elected': number | null;
    'Second Term Expires': number | null;
  }

  interface Props {
    members: BoardTerm[];
  }

  let { members }: Props = $props();

  let search = $state('');
  let sortCol = $state<string>('First Term Elected');
  let sortDir = $state<'asc' | 'desc'>('desc');

  let filtered = $derived.by(() => {
    let result = members;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.Name?.toLowerCase().includes(q));
    }
    const col = sortCol as keyof BoardTerm;
    const dir = sortDir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      const aRaw = a[col] ?? '';
      const bRaw = b[col] ?? '';
      const aNum = parseFloat(String(aRaw));
      const bNum = parseFloat(String(bRaw));
      if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * dir;
      return String(aRaw).localeCompare(String(bRaw)) * dir;
    });
    return result;
  });

  function handleSort(col: string) {
    if (sortCol === col) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortCol = col;
      sortDir = 'asc';
    }
  }

  function sortIcon(col: string) {
    if (sortCol !== col) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  }

  function formatYear(val: string | number | null): { year: string; note: string } {
    if (val === null || val === undefined) return { year: '—', note: '' };
    const str = String(val).trim();
    const m = str.match(/^(\d{4})\s*(\(.+\))?/);
    if (!m) return { year: str, note: '' };
    return { year: m[1], note: m[2] ?? '' };
  }

  let currentMembers = $derived(
    members.filter((m) => {
      const raw = m['Second Term Expires'] ?? m['First Term Expires'];
      const year = parseInt(String(raw ?? ''));
      return !isNaN(year) && year >= 2026;
    })
  );
</script>

<div class="space-y-6">
  <!-- Current Board summary -->
  <div class="animate-fade-up border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-5">
    <h3 class="text-primary-900 dark:text-primary-100 mb-3 font-[--font-serif] text-lg font-bold">Current World Board Members</h3>
    <div class="flex flex-wrap gap-2">
      {#each currentMembers as member (member.Name)}
        <span class="border-accent-200/60 dark:border-accent-800/40 bg-accent-50/60 dark:bg-accent-900/20 text-primary-800 dark:text-primary-200 rounded-md border px-3 py-1.5 text-sm font-medium">
          {member.Name}
          <span class="text-primary-400 dark:text-primary-500 text-xs">
            ({member['Second Term Elected'] ? '2nd' : '1st'} term, expires {member['Second Term Expires'] ?? member['First Term Expires']})
          </span>
        </span>
      {/each}
    </div>
  </div>

  <!-- Search -->
  <div class="animate-fade-up relative" style="animation-delay: 100ms">
    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
      <svg class="text-primary-400 dark:text-primary-500 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
      </svg>
    </div>
    <input
      type="search"
      class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full rounded-lg border bg-white p-3 ps-11 text-sm transition-colors focus:ring-1"
      placeholder="Search board members..."
      bind:value={search}
    />
  </div>

  <!-- Table -->
  <div class="animate-fade-up border-primary-200 dark:border-primary-700 overflow-x-auto rounded-lg border shadow-sm" style="animation-delay: 200ms">
    <table class="w-full text-left text-sm">
      <thead class="border-primary-200 dark:border-primary-700 bg-primary-50/80 dark:bg-primary-900/60 border-b-2">
        <tr>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-5 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('Name')}
          >
            Name <span class="text-primary-300 dark:text-primary-600">{sortIcon('Name')}</span>
          </th>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-4 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('First Term Elected')}
          >
            1st Elected <span class="text-primary-300 dark:text-primary-600">{sortIcon('First Term Elected')}</span>
          </th>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-4 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('First Term Expires')}
          >
            1st Expires <span class="text-primary-300 dark:text-primary-600">{sortIcon('First Term Expires')}</span>
          </th>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-4 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('Second Term Elected')}
          >
            2nd Elected <span class="text-primary-300 dark:text-primary-600">{sortIcon('Second Term Elected')}</span>
          </th>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-4 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('Second Term Expires')}
          >
            2nd Expires <span class="text-primary-300 dark:text-primary-600">{sortIcon('Second Term Expires')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as member (member.Name)}
          <tr class="border-primary-100 dark:border-primary-800 dark:bg-primary-900/30 hover:bg-accent-50/40 dark:hover:bg-primary-800/50 border-b bg-white transition-colors duration-150">
            <td class="text-primary-900 dark:text-primary-100 px-5 py-3 font-medium">{member.Name}</td>
            {#each ['First Term Elected', 'First Term Expires', 'Second Term Elected', 'Second Term Expires'] as col (col)}
              {@const { year, note } = formatYear(member[col as keyof BoardTerm])}
              <td class="text-primary-600 dark:text-primary-400 px-4 py-3 font-mono text-sm">
                {year}{#if note}<span class="text-primary-300 dark:text-primary-600 ml-1 text-xs">{note}</span>{/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="text-primary-400 dark:text-primary-500 text-sm">
    Showing <span class="text-primary-600 dark:text-primary-300 font-semibold">{filtered.length}</span> of <span class="text-primary-600 dark:text-primary-300 font-semibold">{members.length}</span> board
    members
  </p>
</div>
