import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const LINE_TOLERANCE = 3;

interface PositionedText {
  text: string;
  x: number;
  y: number;
}

export async function extractPdfLines(file: File, password: string): Promise<string[]> {
  const data = new Uint8Array(await file.arrayBuffer());

  let pdf: pdfjs.PDFDocumentProxy;
  try {
    pdf = await pdfjs.getDocument({ data, password: password || undefined }).promise;
  } catch (error) {
    if (error instanceof Error && error.name === 'PasswordException') {
      throw new Error(
        password
          ? 'Password PDF salah. Silakan periksa kembali.'
          : 'PDF ini memakai password. Isi password PDF terlebih dahulu.',
      );
    }
    throw new Error('File PDF tidak dapat dibaca. Pastikan file yang dipilih adalah PDF rekening koran.');
  }

  const lines: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items: PositionedText[] = content.items.flatMap((item) =>
      'str' in item && item.str.trim()
        ? [{ text: item.str, x: item.transform[4], y: item.transform[5] }]
        : [],
    );
    lines.push(...groupIntoLines(items));
  }
  return lines;
}

function groupIntoLines(items: PositionedText[]): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: PositionedText[][] = [];

  for (const item of sorted) {
    const lastRow = rows[rows.length - 1];
    if (lastRow && Math.abs(lastRow[0].y - item.y) <= LINE_TOLERANCE) {
      lastRow.push(item);
    } else {
      rows.push([item]);
    }
  }

  return rows.map((row) =>
    row
      .sort((a, b) => a.x - b.x)
      .map((item) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}
