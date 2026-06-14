/**
 * UI utility functions for displaying labels
 * These are safe for client-side use and don't depend on server-only code
 */

export function getAgeGroupLabel(ageGroup: string): string {
  const labels: Record<string, string> = {
    "5-7": "Ages 5-7",
    "8-10": "Ages 8-10",
    "11-13": "Ages 11-13",
    "14+": "Ages 14+",
  };
  return labels[ageGroup] || ageGroup;
}

export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
  };
  return labels[difficulty] || difficulty;
}
