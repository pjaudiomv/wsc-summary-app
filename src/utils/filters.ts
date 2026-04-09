import type { Motion, FilterState, SortState } from '@types/index';

export function filterMotions(motions: Motion[], filters: FilterState): Motion[] {
  return motions.filter((m) => {
    if (filters.years.length > 0 && !filters.years.includes(m.year)) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(m.category)) return false;
    if (filters.results.length > 0 && !filters.results.includes(m.result)) return false;
    if (filters.carOnly && !m.is_car_motion) return false;
    if (filters.catOnly && !m.is_cat_motion) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = [m.motion_text, m.maker, m.notes, m.motion_number, m.category].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export function sortMotions(motions: Motion[], sort: SortState): Motion[] {
  const sorted = [...motions];
  const dir = sort.direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let aVal: string | number | null;
    let bVal: string | number | null;

    switch (sort.column) {
      case 'year':
        return (a.year - b.year) * dir;
      case 'motion_number':
        aVal = a.motion_number ?? '';
        bVal = b.motion_number ?? '';
        // Try numeric sort first
        const aNum = parseInt(aVal);
        const bNum = parseInt(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * dir;
        return aVal.localeCompare(bVal) * dir;
      case 'result':
        return (a.result ?? '').localeCompare(b.result ?? '') * dir;
      case 'category':
        return (a.category ?? '').localeCompare(b.category ?? '') * dir;
      case 'maker':
        return ((a.maker ?? '') as string).localeCompare((b.maker ?? '') as string) * dir;
      case 'vote_for':
        return ((a.vote_for ?? 0) - (b.vote_for ?? 0)) * dir;
      default:
        return 0;
    }
  });

  return sorted;
}

export function getUniqueYears(motions: Motion[]): number[] {
  return [...new Set(motions.map((m) => m.year))].sort((a, b) => b - a);
}

export function getStats(motions: Motion[]) {
  const total = motions.length;
  const carried = motions.filter((m) => m.result === 'carried' || m.result === 'adopted').length;
  const failed = motions.filter((m) => m.result === 'failed').length;
  const other = total - carried - failed;
  const byCategory = motions.reduce(
    (acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return { total, carried, failed, other, byCategory };
}
