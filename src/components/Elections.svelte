<script lang="ts">
  type Role = 'World Board' | 'HRP' | 'Cofacilitator';

  interface Entry {
    role: Role;
    name: string;
    region: string | null;
    firstElected: number | null;
    firstExpires: number | string | null;
    secondElected: number | null;
    secondExpires: number | string | null;
    note: string | null;
  }

  interface Props {
    entries: Entry[];
  }

  let { entries }: Props = $props();

  const CURRENT_YEAR = 2026;

  let search = $state('');
  let sortCol = $state<string>('firstElected');
  let sortDir = $state<'asc' | 'desc'>('desc');
  let roleFilter = $state<Role | 'All'>('All');

  let filtered = $derived.by(() => {
    let result = entries;

    if (roleFilter !== 'All') {
      result = result.filter((e) => e.role === roleFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name?.toLowerCase().includes(q) || (e.region ?? '').toLowerCase().includes(q));
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortCol === 'name') {
        aVal = a.name ?? '';
        bVal = b.name ?? '';
      } else if (sortCol === 'role') {
        aVal = a.role;
        bVal = b.role;
      } else if (sortCol === 'firstElected') {
        aVal = a.firstElected ?? 0;
        bVal = b.firstElected ?? 0;
      } else if (sortCol === 'expires') {
        const aRaw = a.secondExpires ?? a.firstExpires ?? 0;
        const bRaw = b.secondExpires ?? b.firstExpires ?? 0;
        aVal = parseFloat(String(aRaw)) || 0;
        bVal = parseFloat(String(bRaw)) || 0;
      } else {
        aVal = '';
        bVal = '';
      }
      const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal);
      const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * dir;
      return String(aVal).localeCompare(String(bVal)) * dir;
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

  function formatYear(val: string | number | null | undefined): { year: string; note: string } {
    if (val === null || val === undefined) return { year: '—', note: '' };
    const str = String(val).trim();
    const m = str.match(/^(\d{4})\s*(\(.+\))?/);
    if (!m) return { year: str, note: '' };
    return { year: m[1], note: m[2] ?? '' };
  }

  function displayName(entry: Entry): string {
    if (entry.role === 'World Board') return entry.name;
    const parts = entry.name.trim().split(/\s+/);
    if (parts.length < 2) return entry.name;
    const last = parts[parts.length - 1];
    if (last.length <= 1) return entry.name;
    return [...parts.slice(0, -1), last[0]].join(' ');
  }

  function getExpiresDisplay(entry: Entry): { year: string; note: string } {
    const raw = entry.secondExpires ?? entry.firstExpires;
    return formatYear(raw);
  }

  function isCurrentlyServing(entry: Entry): boolean {
    const raw = entry.secondExpires ?? entry.firstExpires;
    const year = parseFloat(String(raw ?? ''));
    return !isNaN(year) && year > CURRENT_YEAR;
  }

  const roleBadge: Record<Role, string> = {
    'World Board': 'bg-accent-100/80 dark:bg-accent-900/40 text-accent-800 dark:text-accent-200 border-accent-200/60 dark:border-accent-700/40',
    HRP: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-700/40',
    Cofacilitator: 'bg-violet-100/80 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 border-violet-200/60 dark:border-violet-700/40'
  };

  const roleFilterBtnBase = 'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer';

  const roleFilterActive: Record<'All' | Role, string> = {
    All: 'bg-primary-800 dark:bg-primary-200 text-white dark:text-primary-900 border-primary-800 dark:border-primary-200',
    'World Board': 'bg-accent-600 text-white border-accent-600',
    HRP: 'bg-emerald-600 text-white border-emerald-600',
    Cofacilitator: 'bg-violet-600 text-white border-violet-600'
  };

  const roleFilterInactive = 'border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-primary-900/20';

  const roleShort: Record<Role, string> = {
    'World Board': 'BRD',
    HRP: 'HRP',
    Cofacilitator: 'CFC'
  };

  let expandedKey = $state<string | null>(null);

  function rowKey(entry: Entry): string {
    return entry.role + entry.name + entry.firstElected;
  }

  function toggleExpand(entry: Entry) {
    const key = rowKey(entry);
    expandedKey = expandedKey === key ? null : key;
  }

  let currentEntries = $derived(entries.filter(isCurrentlyServing));
</script>

<div class="space-y-6">
  <!-- Currently serving summary -->
  <div class="animate-fade-up border-primary-200 dark:border-primary-700 dark:bg-primary-900/40 rounded-lg border bg-white p-5">
    <h3 class="text-primary-900 dark:text-primary-100 mb-3 font-[--font-serif] text-lg font-bold">Currently Serving</h3>
    <div class="flex flex-wrap gap-2">
      {#each currentEntries as entry (entry.role + entry.name + entry.firstElected)}
        <span class="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium {roleBadge[entry.role]}">
          <span class="text-xs opacity-70">{entry.role === 'World Board' ? 'WB' : entry.role === 'Cofacilitator' ? 'CF' : 'HRP'}</span>
          {displayName(entry)}
          {#if entry.region}
            <span class="text-xs opacity-60">· {entry.region}</span>
          {/if}
          <span class="text-xs opacity-60">(expires {entry.secondExpires ?? entry.firstExpires})</span>
        </span>
      {/each}
    </div>
  </div>

  <!-- Role filter + search -->
  <div class="animate-fade-up flex flex-col gap-3 sm:flex-row sm:items-center" style="animation-delay: 100ms">
    <div class="flex flex-wrap gap-2">
      {#each ['All', 'World Board', 'HRP', 'Cofacilitator'] as role (role)}
        <button class="{roleFilterBtnBase} {roleFilter === role ? roleFilterActive[role as 'All' | Role] : roleFilterInactive}" onclick={() => (roleFilter = role as 'All' | Role)}>
          {role}
        </button>
      {/each}
    </div>

    <div class="relative flex-1">
      <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
        <svg class="text-primary-400 dark:text-primary-500 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
        </svg>
      </div>
      <input
        type="search"
        class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full rounded-lg border bg-white p-3 ps-11 text-sm transition-colors focus:ring-1"
        placeholder="Search by name or region..."
        bind:value={search}
      />
    </div>
  </div>

  <!-- Table -->
  <div class="animate-fade-up border-primary-200 dark:border-primary-700 overflow-x-auto rounded-lg border shadow-sm" style="animation-delay: 200ms">
    <table class="w-full text-left text-sm">
      <thead class="border-primary-200 dark:border-primary-700 bg-primary-50/80 dark:bg-primary-900/60 border-b-2">
        <tr>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('role')}
          >
            Role <span class="text-primary-300 dark:text-primary-600">{sortIcon('role')}</span>
          </th>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('name')}
          >
            Name <span class="text-primary-300 dark:text-primary-600">{sortIcon('name')}</span>
          </th>
          <th class="text-primary-500 dark:text-primary-400 hidden px-4 py-3.5 text-xs font-semibold tracking-widest uppercase sm:table-cell">Region</th>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('firstElected')}
          >
            Elected <span class="text-primary-300 dark:text-primary-600">{sortIcon('firstElected')}</span>
          </th>
          <th
            class="text-primary-500 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 cursor-pointer px-3 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            onclick={() => handleSort('expires')}
          >
            Expires <span class="text-primary-300 dark:text-primary-600">{sortIcon('expires')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as entry (entry.role + entry.name + entry.firstElected)}
          {@const expires = getExpiresDisplay(entry)}
          {@const key = rowKey(entry)}
          {@const expanded = expandedKey === key}
          <tr
            class="border-primary-100 dark:border-primary-800 dark:bg-primary-900/30 hover:bg-accent-50/40 dark:hover:bg-primary-800/50 cursor-pointer border-b bg-white transition-colors duration-150 {expanded
              ? 'bg-accent-50/60 dark:bg-primary-800/60'
              : ''}"
            onclick={() => toggleExpand(entry)}
          >
            <td class="px-3 py-3">
              <span class="inline-block rounded border px-1.5 py-0.5 text-xs font-semibold {roleBadge[entry.role]}">
                {roleShort[entry.role]}
              </span>
            </td>
            <td class="text-primary-900 dark:text-primary-100 px-3 py-3 font-medium">
              {displayName(entry)}
              {#if entry.note}
                <span class="text-primary-400 dark:text-primary-500 ml-1 text-xs">({entry.note})</span>
              {/if}
            </td>
            <td class="text-primary-500 dark:text-primary-400 hidden px-4 py-3 text-sm sm:table-cell">{entry.region ?? '—'}</td>
            <td class="text-primary-600 dark:text-primary-400 px-3 py-3 font-mono text-sm">
              {entry.firstElected ?? '—'}{#if entry.secondElected}<span class="text-primary-400 dark:text-primary-500 text-xs">/{entry.secondElected}</span>{/if}
            </td>
            <td class="text-primary-600 dark:text-primary-400 px-3 py-3 font-mono text-sm">
              {expires.year}{#if expires.note}<span class="text-primary-300 dark:text-primary-600 ml-1 text-xs">{expires.note}</span>{/if}
            </td>
          </tr>
          {#if expanded}
            <tr class="border-primary-100 dark:border-primary-800 border-b sm:hidden">
              <td colspan="4" class="bg-accent-50/40 dark:bg-primary-800/40 px-5 py-2.5 text-sm">
                <span class="text-primary-500 dark:text-primary-400 font-medium">Region:</span>
                <span class="text-primary-700 dark:text-primary-300 ml-1">{entry.region ?? '—'}</span>
                {#if entry.secondElected}
                  <span class="text-primary-400 dark:text-primary-500 ml-4 text-xs">Re-elected {entry.secondElected}</span>
                {/if}
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

  <p class="text-primary-400 dark:text-primary-500 text-sm">
    Showing <span class="text-primary-600 dark:text-primary-300 font-semibold">{filtered.length}</span> of <span class="text-primary-600 dark:text-primary-300 font-semibold">{entries.length}</span> entries
  </p>
</div>
