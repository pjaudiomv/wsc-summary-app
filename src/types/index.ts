export interface Motion {
  year: number;
  motion_number: string | null;
  motion_text: string;
  maker: string | null;
  second: string | null;
  result: 'carried' | 'failed' | 'committed' | 'withdrawn' | 'tabled' | 'adopted' | 'referred' | 'other';
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

export type MotionCategory =
  | 'procedural'
  | 'literature'
  | 'fipt'
  | 'service_structure'
  | 'budget'
  | 'seating'
  | 'elections'
  | 'planning'
  | 'policy'
  | 'regional_motion'
  | 'zonal_motion'
  | 'other';

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
  other: 'Other'
};

export const RESULT_COLORS: Record<MotionResult, string> = {
  carried: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  adopted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  committed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  tabled: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  referred: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
};
