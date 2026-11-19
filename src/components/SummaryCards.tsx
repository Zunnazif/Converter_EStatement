import { CalendarRange, CheckCircle2, AlertTriangle, ArrowDownLeft, ArrowUpRight, Hash, Wallet } from 'lucide-react';
import type { StatementSummary } from '@/lib/statementParser';
import { formatRupiah } from '@/lib/format';

interface SummaryCardsProps {
  summary: StatementSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const validation = summary.isBalanced
    ? { label: 'Sesuai', tone: 'success' as const, icon: CheckCircle2 }
    : { label: 'Tidak sesuai', tone: 'error' as const, icon: AlertTriangle };

  const toneClasses = {
    success: 'border-emerald-200 bg-emerald-50',
    error: 'border-red-200 bg-red-50',
  };

  const cards = [
    { label: 'Periode', value: summary.period, icon: CalendarRange, accent: 'text-blue-700' },
    { label: 'Jumlah Transaksi', value: String(summary.transactionCount), icon: Hash, accent: 'text-slate-700' },
    { label: 'Total Debit', value: formatRupiah(summary.totalDebit), icon: ArrowUpRight, accent: 'text-red-600' },
    { label: 'Total Kredit', value: formatRupiah(summary.totalCredit), icon: ArrowDownLeft, accent: 'text-emerald-600' },
    {
      label: 'Saldo Awal',
      value: formatRupiah(summary.openingBalance),
      icon: Wallet,
      accent: 'text-slate-700',
    },
    { label: 'Saldo Akhir', value: formatRupiah(summary.closingBalance), icon: Wallet, accent: 'text-blue-700' },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{label}</p>
            <Icon className={`h-4 w-4 ${accent}`} aria-hidden />
          </div>
          <p className="mt-2 break-words text-lg font-semibold tabular-nums text-slate-900">{value}</p>
        </div>
      ))}
      <div
        className={`rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-4 ${toneClasses[validation.tone]}`}
      >
        <div className="flex items-center gap-3">
          <validation.icon
            className={`h-5 w-5 ${validation.tone === 'success' ? 'text-emerald-600' : 'text-red-600'}`}
            aria-hidden
          />
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Status Validasi: {validation.label}</span>
            <span className="ml-2 text-slate-500">
              Saldo awal dikurangi total debit ditambah total kredit harus sama dengan saldo akhir.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
