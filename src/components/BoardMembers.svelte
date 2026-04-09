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

  let filtered = $derived(() => {
    let result = members;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => m.Name?.toLowerCase().includes(q));
    }
    const col = sortCol as keyof BoardTerm;
    const dir = sortDir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      const aVal = a[col] ?? '';
      const bVal = b[col] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
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

  let currentMembers = $derived(
    members.filter(m => {
      const expires = m['First Term Expires'] ?? m['Second Term Expires'];
      return expires !== null && expires >= 2024;
    })
  );
</script>

<div class="space-y-6">
  <!-- Current Board summary -->
  <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Current World Board Members</h3>
    <div class="flex flex-wrap gap-2">
      {#each currentMembers as member}
        <span class="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
          {member.Name}
          <span class="text-xs opacity-70">
            ({member['Second Term Elected'] ? '2nd' : '1st'} term, expires {member['Second Term Expires'] ?? member['First Term Expires']})
          </span>
        </span>
      {/each}
    </div>
  </div>

  <!-- Search -->
  <div class="relative">
    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
      <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
      </svg>
    </div>
    <input type="search" class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" placeholder="Search board members..." bind:value={search} />
  </div>

  <!-- Table -->
  <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
    <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th class="cursor-pointer px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('Name')}>
            Name <span class="text-gray-400">{sortIcon('Name')}</span>
          </th>
          <th class="cursor-pointer px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('First Term Elected')}>
            1st Term Elected <span class="text-gray-400">{sortIcon('First Term Elected')}</span>
          </th>
          <th class="cursor-pointer px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('First Term Expires')}>
            1st Term Expires <span class="text-gray-400">{sortIcon('First Term Expires')}</span>
          </th>
          <th class="cursor-pointer px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('Second Term Elected')}>
            2nd Term Elected <span class="text-gray-400">{sortIcon('Second Term Elected')}</span>
          </th>
          <th class="cursor-pointer px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => handleSort('Second Term Expires')}>
            2nd Term Expires <span class="text-gray-400">{sortIcon('Second Term Expires')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each filtered() as member}
          <tr class="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{member.Name}</td>
            <td class="px-4 py-3">{member['First Term Elected'] ? Math.round(member['First Term Elected']) : '—'}</td>
            <td class="px-4 py-3">{member['First Term Expires'] ? Math.round(member['First Term Expires']) : '—'}</td>
            <td class="px-4 py-3">{member['Second Term Elected'] ? Math.round(member['Second Term Elected']) : '—'}</td>
            <td class="px-4 py-3">{member['Second Term Expires'] ? Math.round(member['Second Term Expires']) : '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="text-sm text-gray-500 dark:text-gray-400">
    Showing {filtered().length} of {members.length} board members
  </p>
</div>
