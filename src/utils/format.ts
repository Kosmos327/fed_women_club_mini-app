function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatDate(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return '—';

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatDateTime(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return '—';

  const formattedDate = formatDate(value);
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${formattedDate}, ${hours}:${minutes}`;
}

export function formatSubscriptionStatus(status?: string | null, isActive?: boolean): string {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === 'expired') return 'истекла';
  if (normalizedStatus === 'paused') return 'приостановлена';
  if (normalizedStatus === 'blocked') return 'заблокирована';
  if (normalizedStatus === 'active') return 'активна';
  if (normalizedStatus === 'inactive') return 'не активна';

  if (isActive === true) return 'активна';
  if (isActive === false) return 'не активна';

  return status?.trim() || 'не активна';
}

export function formatVerificationStatus(status?: string | null): string {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === 'active') return 'Активна';
  if (normalizedStatus === 'used') return 'Использована';
  if (normalizedStatus === 'confirmed') return 'Подтверждена';
  if (normalizedStatus === 'expired') return 'Истекла';
  if (normalizedStatus === 'cancelled') return 'Отменена';
  if (normalizedStatus === 'pending') return 'Ожидает';

  return status?.trim() || '—';
}
