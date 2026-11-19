import { useRef, useState, type DragEvent } from 'react';
import { FileText, KeyRound, Loader2, Upload } from 'lucide-react';

interface UploadPanelProps {
  file: File | null;
  password: string;
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
  onPasswordChange: (password: string) => void;
  onConvert: () => void;
}

export default function UploadPanel({
  file,
  password,
  isProcessing,
  onFileSelect,
  onPasswordChange,
  onConvert,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Unggah Rekening Koran</h2>
      <p className="mt-1 text-sm text-slate-500">
        Pilih file PDF mutasi rekening BCA. Data diproses langsung di browser Anda.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_280px]">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
        >
          {file ? (
            <FileText className="h-8 w-8 text-blue-700" aria-hidden />
          ) : (
            <Upload className="h-8 w-8 text-slate-400" aria-hidden />
          )}
          <p className="text-sm font-medium text-slate-800">
            {file ? file.name : 'Seret file PDF ke sini atau klik untuk memilih'}
          </p>
          <p className="text-xs text-slate-500">
            {file ? 'Klik untuk mengganti file' : 'Format yang didukung: PDF'}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) onFileSelect(selected);
              event.target.value = '';
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <KeyRound className="h-4 w-4 text-slate-400" aria-hidden />
              Password PDF
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Isi jika PDF memakai password"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            type="button"
            onClick={onConvert}
            disabled={!file || isProcessing}
            className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Memproses...
              </>
            ) : (
              'Proses Konversi'
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
