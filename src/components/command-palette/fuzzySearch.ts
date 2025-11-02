// Fuzzy search algorithm for command palette
import { Command, FuzzyMatch } from './types';

/**
 * Calculate fuzzy match score between query and text
 * Higher score = better match
 * Returns { score, matches } where matches are the indices of matched characters
 */
export function fuzzyMatch(query: string, text: string): { score: number; matches: number[] } {
  if (!query) {
    return { score: 0, matches: [] };
  }

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) {
    return { 
      score: 1000, 
      matches: Array.from({ length: query.length }, (_, i) => i) 
    };
  }
  
  // Contains gets high score
  const containsIndex = textLower.indexOf(queryLower);
  if (containsIndex !== -1) {
    return {
      score: 500 - containsIndex, // Prefer matches at start
      matches: Array.from({ length: query.length }, (_, i) => containsIndex + i)
    };
  }

  // Fuzzy matching - characters in order
  let queryIndex = 0;
  let score = 0;
  const matches: number[] = [];
  let lastMatchIndex = -1;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      matches.push(i);
      
      // Score based on position and consecutive matches
      if (i === 0) score += 10; // Match at start
      if (i === lastMatchIndex + 1) score += 5; // Consecutive match
      score += 1; // Base match score
      
      lastMatchIndex = i;
      queryIndex++;
    }
  }

  // Did we match all characters?
  if (queryIndex === queryLower.length) {
    return { score, matches };
  }

  // No match
  return { score: 0, matches: [] };
}

/**
 * Search commands using fuzzy matching
 * Returns sorted array of matches (best match first)
 */
export function searchCommands(query: string, commands: Command[]): FuzzyMatch[] {
  if (!query.trim()) {
    return [];
  }

  const results: FuzzyMatch[] = [];

  for (const command of commands) {
    // Match against label
    const labelMatch = fuzzyMatch(query, command.label);
    
    // Match against description
    const descMatch = command.description 
      ? fuzzyMatch(query, command.description)
      : { score: 0, matches: [] };
    
    // Match against keywords
    let keywordScore = 0;
    if (command.keywords) {
      for (const keyword of command.keywords) {
        const match = fuzzyMatch(query, keyword);
        keywordScore = Math.max(keywordScore, match.score);
      }
    }

    // Best score wins
    const bestScore = Math.max(labelMatch.score, descMatch.score, keywordScore);

    if (bestScore > 0) {
      results.push({
        command,
        score: bestScore,
        matches: labelMatch.score >= descMatch.score ? labelMatch.matches : descMatch.matches
      });
    }
  }

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}
