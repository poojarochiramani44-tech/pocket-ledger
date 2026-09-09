import { useRef, useState } from "react";
import { UploadCloud, FileText, Sparkles, Loader2, ScanLine } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { parseStatementText, SAMPLE_STATEMENT, type ParsedTxn } from "@/lib/statementParser";

// Worker served from CDN so no bundler-specific worker wiring is needed.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/** Extract real text from a PDF page-by-page (never readAsText on binary). */
async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    // Rebuild lines using each item's vertical position.
    const rows = new Map<number, string[]>();
    for (const item of content.items as { str: string; transform: number[] }[]) {
      if (!item.str?.trim()) continue;
      const y = Math.round(item.transform[5]);
      const row = rows.get(y) ?? [];
      row.push(item.str);
      rows.set(y, row);
    }
    const ordered = Array.from(rows.entries()).sort((a, b) => b[0] - a[0]);
    pages.push(ordered.map(([, parts]) => parts.join(" ").replace(/\s+/g, " ").trim()).join("\n"));
  }
  return pages.join("\n");
}


type Props = {
  onParsed: (txns: ParsedTxn[]) => void;
};

/**
 * Prototype-only statement & SMS parser.
 * Text is parsed in the browser and kept in component state — no uploads, no persistence.
 * A production implementation would require approved internal systems and security review.
 */
export default function StatementParser({ onParsed }: Props) {
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runParse = (raw: string) => {
    setBusy(true);
    setNote(null);
    setTimeout(() => {
      const parsed = parseStatementText(raw);
      setBusy(false);
      if (parsed.length === 0) {
        setNote("No transaction lines recognised. Try the sample statement format.");
        return;
      }
      onParsed(parsed);
      setNote(`Parsed ${parsed.length} transaction${parsed.length === 1 ? "" : "s"} into the dashboard.`);
    }, 350);
  };

  const readFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const allowed = Array.from(files).filter((f) => /\.(csv|txt|pdf)$/i.test(f.name));
    if (allowed.length === 0) {
      setNote("Supported formats: PDF, CSV, TXT or pasted SMS text.");
      return;
    }
    setBusy(true);
    setNote("Reading file…");
    try {
      const contents = await Promise.all(
        allowed.map((f) => (/\.pdf$/i.test(f.name) ? extractPdfText(f) : f.text())),
      );
      const joined = contents.join("\n");
      setText(joined.slice(0, 20000));
      setBusy(false);
      runParse(joined);
    } catch {
      setBusy(false);
      setNote("Could not read that file. Try a text-based PDF, CSV or TXT.");
    }

  };

  return (
    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-primary" /> Statement &amp; SMS Parser
        </h2>
        <span className="text-xs font-medium bg-primary-soft text-primary-strong px-2 py-1 rounded">
          Demo only — synthetic samples
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void readFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
        }`}
      >
        <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">Drop a statement here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, CSV or TXT — or paste raw SMS lines below</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv,.txt"
          multiple
          className="hidden"
          onChange={(e) => void readFiles(e.target.files)}
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={'Paste lines like:\nUPI/DR/324156789012/Swiggy/HDFC/PAYMENT  Rs 450.00\nDebited Rs 450.00 from VPA swiggy@icici'}
        className="w-full mt-4 p-3 border border-border rounded-lg text-xs font-mono bg-background focus:outline-primary"
      />

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => runParse(text)}
          disabled={busy || text.trim().length === 0}
          className="flex-1 min-w-40 bg-foreground text-surface py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Parse Transactions
        </button>
        <button
          onClick={() => {
            setText(SAMPLE_STATEMENT);
            runParse(SAMPLE_STATEMENT);
          }}
          className="flex-1 min-w-40 border border-border text-foreground py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-divider"
        >
          <FileText className="w-4 h-4" /> Load Sample HDFC/SBI Statement
        </button>
      </div>

      {note && <p className="text-xs text-muted-foreground mt-3">{note}</p>}
    </div>
  );
}
