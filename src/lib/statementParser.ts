export interface StatementTransaction {
  no: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  category: string;
}

export interface StatementSummary {
  period: string;
  transactionCount: number;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface ParsedStatement {
  summary: StatementSummary;
  transactions: StatementTransaction[];
  skippedEntries: number;
}

const MONTHS: Record<string, number> = {
  JANUARI: 1,
  PEBRUARI: 2,
  MARET: 3,
  APRIL: 4,
  MEI: 5,
  JUNI: 6,
  JULI: 7,
  AGUSTUS: 8,
  SEPTEMBER: 9,
  OKTOBER: 10,
  NOVEMBER: 11,
  DESEMBER: 12,
};

const AMOUNT_PATTERN = /(?<![\d.,])\d{1,3}(?:[.,]\d{3})*[.,]\d{2}(?!\d)/g;
const DATE_PATTERN = /^(\d{2})\/(\d{2})(?=\s|$)/;
const PERIOD_PATTERN = /PERIODE\s*:?\s*([A-Z]+)\s+(\d{4})/i;
const FOOTER_PATTERN = /^(SALDO (AWAL|AKHIR)|MUTASI (CR|DB)|CATATAN|BERSAMBUNG|TANGGAL KETERANGAN)\b/i;

const parseAmount = (value: string) => {
  const decimalIndex = Math.max(value.lastIndexOf('.'), value.lastIndexOf(','));
  const whole = value.slice(0, decimalIndex).replace(/[.,]/g, '');
  const fraction = value.slice(decimalIndex + 1);
  return Number(`${whole}.${fraction}`);
};
const roundCents = (value: number) => Math.round(value * 100) / 100;
const isSameAmount = (a: number, b: number) => Math.abs(a - b) < 0.005;

function categorize(description: string, isDebit: boolean) {
  const upper = description.toUpperCase();
  if (/LISTRIK|PLN/.test(upper)) return 'Biaya Listrik';
  if (/WIFI|INTERNET|INDIHOME/.test(upper)) return 'Biaya Internet';
  if (/BUNGA/.test(upper)) return isDebit ? 'Beban Bunga' : 'Pendapatan Bunga';
  if (/\bADM\b|BIAYA TRANSFER|BIAYA ADMIN/.test(upper)) return 'Beban Transfer Bank';
  return 'Belum Dikategorikan';
}

interface RawEntry {
  date: string;
  parts: string[];
}

export function parseBcaStatement(lines: string[]): ParsedStatement {
  const periodMatch = lines.map((line) => line.match(PERIOD_PATTERN)).find(Boolean);
  const monthName = periodMatch?.[1].toUpperCase() ?? '';
  const monthNumber = MONTHS[monthName];
  if (!periodMatch || !monthNumber) {
    throw new Error('Periode rekening tidak ditemukan. Pastikan file ini adalah rekening koran BCA.');
  }
  const year = periodMatch[2];
  const period = `${monthName.charAt(0)}${monthName.slice(1).toLowerCase()} ${year}`;

  let openingBalance: number | null = null;
  const entries: RawEntry[] = [];
  let current: RawEntry | null = null;

  for (const line of lines) {
    const dateMatch = DATE_PATTERN.exec(line);
    if (dateMatch) {
      const [matchedDate, day, month] = dateMatch;
      const body = line.slice(matchedDate.length).trim();
      if (/^SALDO AWAL\b/i.test(body)) {
        const amounts = body.match(AMOUNT_PATTERN);
        if (amounts) openingBalance = parseAmount(amounts[amounts.length - 1]);
        current = null;
        continue;
      }
      current = { date: `${year}-${month}-${day}`, parts: [body] };
      entries.push(current);
      continue;
    }
    if (FOOTER_PATTERN.test(line)) {
      current = null;
      continue;
    }
    if (current) current.parts.push(line);
  }

  if (openingBalance === null) {
    throw new Error('Saldo awal tidak ditemukan. Pastikan file ini adalah rekening koran BCA.');
  }

  const transactions: StatementTransaction[] = [];
  let skippedEntries = 0;
  let runningBalance: number = openingBalance;

  for (const entry of entries) {
    const text = entry.parts.join(' ').replace(/\s+/g, ' ').trim();
    const amounts = text.match(AMOUNT_PATTERN);
    if (!amounts) {
      skippedEntries++;
      continue;
    }

    const amount = parseAmount(amounts[0]);
    const isDebit = /\bDB\b/.test(text);
    const balance = amounts[1]
      ? parseAmount(amounts[1])
      : roundCents(runningBalance + (isDebit ? -amount : amount));
    const description = text
      .replace(AMOUNT_PATTERN, ' ')
      .replace(/\b(DB|CR)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    transactions.push({
      no: transactions.length + 1,
      date: entry.date,
      description,
      debit: isDebit ? amount : 0,
      credit: isDebit ? 0 : amount,
      balance,
      category: categorize(description, isDebit),
    });
    runningBalance = balance;
  }

  if (transactions.length === 0) {
    throw new Error('Tidak ada transaksi yang bisa dibaca dari file ini.');
  }

  const totalDebit = roundCents(transactions.reduce((sum, t) => sum + t.debit, 0));
  const totalCredit = roundCents(transactions.reduce((sum, t) => sum + t.credit, 0));
  const closingBalance = transactions[transactions.length - 1].balance;

  return {
    summary: {
      period,
      transactionCount: transactions.length,
      openingBalance,
      closingBalance,
      totalDebit,
      totalCredit,
      isBalanced: isSameAmount(roundCents(openingBalance - totalDebit + totalCredit), closingBalance),
    },
    transactions,
    skippedEntries,
  };
}
