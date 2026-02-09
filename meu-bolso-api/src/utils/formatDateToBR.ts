export function formatDateToBR(value: string | Date): string {
  if (!value) return '';

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return '';
    date = new Date(year, month - 1, day);
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
