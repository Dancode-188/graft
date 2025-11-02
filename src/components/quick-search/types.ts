// Quick Search Types

export type SearchResultType = 'commit' | 'branch' | 'stash' | 'file';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  score: number; // Fuzzy match score
  data: any; // Original data object
}

export interface SearchResultGroup {
  type: SearchResultType;
  label: string;
  results: SearchResult[];
}
