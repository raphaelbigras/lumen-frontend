export const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  PENDING: 'En attente',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique',
};

export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: 'bg-status-open-bg', text: 'text-status-open-text' },
  IN_PROGRESS: { bg: 'bg-status-progress-bg', text: 'text-status-progress-text' },
  PENDING: { bg: 'bg-status-pending-bg', text: 'text-status-pending-text' },
  RESOLVED: { bg: 'bg-status-resolved-bg', text: 'text-status-resolved-text' },
  CLOSED: { bg: 'bg-status-closed-bg', text: 'text-status-closed-text' },
};

export const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-gray-500',
};
