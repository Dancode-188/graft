// Recent Commands Tracker
// Stores and retrieves recently used commands from localStorage

const STORAGE_KEY = 'graft_recent_commands';
const MAX_RECENT = 5;

export function saveRecentCommand(commandId: string): void {
  try {
    const recent = getRecentCommands();
    // Add command to front, remove duplicates, limit to MAX_RECENT
    const updated = [
      commandId,
      ...recent.filter(id => id !== commandId)
    ].slice(0, MAX_RECENT);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent command:', error);
  }
}

export function getRecentCommands(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load recent commands:', error);
    return [];
  }
}

export function clearRecentCommands(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recent commands:', error);
  }
}
