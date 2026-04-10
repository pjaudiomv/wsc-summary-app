export interface Motion {
  year: number;
  motion_number: string | null;
  motion_text: string;
  maker: string | null;
  second: string | null;
  result: 'carried' | 'failed' | 'committed' | 'withdrawn' | 'tabled' | 'adopted' | 'referred' | 'pending' | 'other';
  vote_for: number | null;
  vote_against: number | null;
  vote_abstain: number | null;
  vote_present: number | null;
  category: MotionCategory;
  notes: string | null;
  is_car_motion: boolean;
  is_cat_motion: boolean;
  amendment_to: string | null;
}

export type MotionCategory = 'procedural' | 'literature' | 'fipt' | 'service_structure' | 'budget' | 'seating' | 'elections' | 'planning' | 'policy' | 'regional_motion' | 'zonal_motion' | 'other';

export type MotionResult = Motion['result'];

export interface StrawPoll {
  topic: string;
  result: string | null;
  for: number | null;
  against: number | null;
}

export interface ElectionResult {
  position: string;
  name: string | null;
}

export interface ConferenceMetadata {
  year: number;
  conference_type: 'regular' | 'interim' | 'virtual';
  location: string | null;
  dates: string | null;
  total_participants: number | null;
  total_regions_seated: number | null;
  new_regions_seated: string[];
  election_results: ElectionResult[];
  straw_polls: StrawPoll[];
  car_survey_results: { question: string; result: string | null }[];
  budget_approved: boolean | null;
  budget_amount: string | null;
  additional_notes: string | null;
}

export interface YearData {
  metadata: ConferenceMetadata;
  motions: Motion[];
}

export interface DecisionsData {
  generated_at: string;
  years: Record<string, YearData>;
}

export interface BoardTerm {
  [key: string]: string | number | null;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface FilterState {
  years: number[];
  categories: MotionCategory[];
  results: MotionResult[];
  makers: string[];
  search: string;
  carOnly: boolean;
  catOnly: boolean;
}

export const CATEGORY_LABELS: Record<MotionCategory, string> = {
  procedural: 'Procedural',
  literature: 'Literature',
  fipt: 'FIPT',
  service_structure: 'Service Structure',
  budget: 'Budget',
  seating: 'Seating',
  elections: 'Elections',
  planning: 'Planning',
  policy: 'Policy',
  regional_motion: 'Regional Motion',
  zonal_motion: 'Zonal Motion',
  other: 'Other'
};

export const RESULT_LABELS: Record<MotionResult, string> = {
  carried: 'Carried',
  failed: 'Failed',
  committed: 'Committed',
  withdrawn: 'Withdrawn',
  tabled: 'Tabled',
  adopted: 'Adopted',
  referred: 'Referred',
  pending: 'Pending',
  other: 'Other'
};

export const RESULT_COLORS: Record<MotionResult, string> = {
  carried: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
  adopted: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
  failed: 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40',
  committed: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
  withdrawn: 'bg-primary-50 text-primary-700 dark:bg-primary-800/40 dark:text-primary-300 border border-primary-200/60 dark:border-primary-700/60',
  tabled: 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40',
  referred: 'bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40',
  pending: 'bg-violet-50 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40',
  other: 'bg-primary-50 text-primary-700 dark:bg-primary-800/40 dark:text-primary-300 border border-primary-200/60 dark:border-primary-700/60'
};
