/**
 * Formata duração total em minutos para exibição (ex.: "2h 30min", "45min").
 * total_duration da API está em minutos.
 */
export function formatDurationFromMinutes(totalMinutes: number | undefined | null): string {
  if (totalMinutes == null || totalMinutes <= 0) return '—';
  const m = Math.round(Number(totalMinutes));
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}
