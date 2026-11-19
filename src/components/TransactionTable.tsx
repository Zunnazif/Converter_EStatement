import type { StatementTransaction } from '@/lib/statementParser';
import { formatAmount, formatDate } from '@/lib/format';

interface TransactionTableProps {
  transactions: StatementTransaction[];
}

const CATEGORY_TONES: Record<string, string> = {
  'Belum Dikategorikan': 'bg-slate-100 text-slate-600',
  'Biaya Listrik': 'bg-amber-100 text-amber-800',
  'Biaya Internet': 'bg-sky-100 text-sky-800',
  'Pendapatan Bunga': 'bg-emerald-100 text-emerald-800',
  'Beban Bunga': 'bg-red-100 text-red-800',
  'Beban Transfer Bank': 'bg-orange-100 text-orange-800',
};

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-100">
            <tr>
              <th className="px-4 py-3 text-center">No</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3 text-right">Debit</th>
              <th className="px-4 py-3 text-right">Kredit</th>
              <th className="px-4 py-3 text-right">Saldo</th>
              <th className="px-4 py-3">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.no}
                className="border-t border-slate-100 transition-colors hover:bg-blue-50/60"
              >
                <td className="px-4 py-2.5 text-center text-slate-500 tabular-nums">{t.no}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">{formatDate(t.date)}</td>
                <td className="px-4 py-2.5 text-slate-800">{t.description}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums text-red-600">
                  {t.debit ? formatAmount(t.debit) : '0.00'}
                </td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums text-emerald-600">
                  {t.credit ? formatAmount(t.credit) : '0.00'}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">{formatAmount(t.balance)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_TONES[t.category] ?? CATEGORY_TONES['Belum Dikategorikan']}`}
                  >
                    {t.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
