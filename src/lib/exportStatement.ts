import * as XLSX from 'xlsx';
import type { ParsedStatement } from '@/lib/statementParser';

const TRANSACTION_HEADERS = ['No', 'Tanggal', 'Keterangan', 'Debit', 'Kredit', 'Saldo', 'Kategori'];

function buildTransactionSheet(statement: ParsedStatement) {
  const rows = statement.transactions.map((t) => [
    t.no,
    t.date,
    t.description,
    t.debit,
    t.credit,
    t.balance,
    t.category,
  ]);
  const sheet = XLSX.utils.aoa_to_sheet([TRANSACTION_HEADERS, ...rows]);
  sheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 60 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
  ];
  return sheet;
}

function buildSummarySheet(statement: ParsedStatement) {
  const { summary } = statement;
  const sheet = XLSX.utils.aoa_to_sheet([
    ['Ringkasan Rekening Koran'],
    [],
    ['Periode', summary.period],
    ['Jumlah Transaksi', summary.transactionCount],
    ['Saldo Awal', summary.openingBalance],
    ['Total Debit', summary.totalDebit],
    ['Total Kredit', summary.totalCredit],
    ['Saldo Akhir', summary.closingBalance],
    ['Status Validasi', summary.isBalanced ? 'Sesuai' : 'Tidak sesuai'],
  ]);
  sheet['!cols'] = [{ wch: 22 }, { wch: 24 }];
  return sheet;
}

function baseFileName(fileName: string) {
  return fileName.replace(/\.pdf$/i, '');
}

export function downloadExcel(statement: ParsedStatement, sourceFileName: string) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, buildTransactionSheet(statement), 'Mutasi');
  XLSX.utils.book_append_sheet(workbook, buildSummarySheet(statement), 'Ringkasan');
  XLSX.writeFile(workbook, `${baseFileName(sourceFileName)}.xlsx`);
}

export function downloadCsv(statement: ParsedStatement, sourceFileName: string) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, buildTransactionSheet(statement), 'Mutasi');
  XLSX.writeFile(workbook, `${baseFileName(sourceFileName)}.csv`, { bookType: 'csv' });
}
