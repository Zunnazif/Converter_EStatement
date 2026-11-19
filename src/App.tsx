import { useState } from 'react';
import { AlertCircle, Download, FileSpreadsheet, FileType2 } from 'lucide-react';
import UploadPanel from '@/components/UploadPanel';
import SummaryCards from '@/components/SummaryCards';
import TransactionTable from '@/components/TransactionTable';
import { extractPdfLines } from '@/lib/pdfText';
import { parseBcaStatement, type ParsedStatement } from '@/lib/statementParser';
import { downloadCsv, downloadExcel } from '@/lib/exportStatement';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statement, setStatement] = useState<ParsedStatement | null>(null);

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setStatement(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setStatement(null);
    try {
      const lines = await extractPdfLines(file, password);
      setStatement(parseBcaStatement(lines));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membaca PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
            <FileSpreadsheet className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Konverter Rekening Koran</h1>
            <p className="text-sm text-slate-500">Ubah mutasi rekening BCA dari PDF menjadi Excel</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <UploadPanel
          file={file}
          password={password}
          isProcessing={isProcessing}
          onFileSelect={handleFileSelect}
          onPasswordChange={setPassword}
          onConvert={handleConvert}
        />

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        )}

        {statement && file && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Hasil Konversi</h2>
                {statement.skippedEntries > 0 && (
                  <p className="mt-1 text-sm text-amber-700">
                    {statement.skippedEntries} baris tidak bisa dibaca dan dilewati. Periksa kembali hasil Excel.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => downloadCsv(statement, file.name)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <FileType2 className="h-4 w-4" aria-hidden />
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={() => downloadExcel(statement, file.name)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download Excel
                </button>
              </div>
            </div>

            <SummaryCards summary={statement.summary} />
            <TransactionTable transactions={statement.transactions} />
          </>
        )}
      </main>
    </div>
  );
}
