const amountFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (value: number) => amountFormatter.format(value);

export const formatRupiah = (value: number) => `Rp ${amountFormatter.format(value)}`;

export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
