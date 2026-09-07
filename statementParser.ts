// Prototype-only parsing engine for Indian bank statement / UPI SMS text.
// Works entirely in the browser on text the user pastes or loads from the demo sample.
// Nothing is uploaded, stored or sent anywhere.

export type ParsedTxn = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  bank: string;
  method: string;
  refNo: string;
  status: string;
};

const MERCHANT_CATEGORIES: { match: RegExp; merchant: string; category: string }[] = [
  { match: /swiggy|zomato|dominos|restaurant|food/i, merchant: "Swiggy", category: "Food & Dining" },
  { match: /zomato/i, merchant: "Zomato", category: "Food & Dining" },
  { match: /amazon|flipkart|myntra|shopping/i, merchant: "Amazon", category: "Shopping" },
  { match: /uber|ola|rapido|cab/i, merchant: "Uber", category: "Transport" },
  { match: /rent|landlord|housing/i, merchant: "Rent", category: "Housing" },
  { match: /salary|payroll|sal cr/i, merchant: "Salary", category: "Salary" },
  { match: /sip|mutual|invest|zerodha|groww/i, merchant: "Investments", category: "Investments" },
  { match: /electric|bescom|recharge|airtel|jio|bill/i, merchant: "Utilities", category: "Utilities" },
];

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function classify(text: string): { merchant: string; category: string } {
  for (const entry of MERCHANT_CATEGORIES) {
    if (entry.match.test(text)) {
      const zomato = /zomato/i.test(text);
      return { merchant: zomato ? "Zomato" : entry.merchant, category: zomato ? "Food & Dining" : entry.category };
    }
  }
  return { merchant: "Unknown Merchant", category: "Other" };
}

function extractDate(line: string): string {
  // 2026-08-14
  const iso = line.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // 14/08/2026 or 14-08-26
  const dmy = line.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  // 14-Aug-26 / 14 Aug 2026
  const named = line.match(/(\d{1,2})[\s-]([A-Za-z]{3})[a-z]*[\s-](\d{2,4})/);
  if (named) {
    const monthIndex = MONTHS.indexOf(named[2].toLowerCase());
    if (monthIndex >= 0) {
      const year = named[3].length === 2 ? `20${named[3]}` : named[3];
      return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${named[1].padStart(2, "0")}`;
    }
  }
  return new Date().toISOString().split("T")[0];
}

function extractAmount(line: string): number | null {
  const patterns = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+\.\d{2})\s*(?:dr|cr)\b/i,
    /,\s*([\d,]+\.\d{2})\s*(?:,|$)/,
  ];
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      if (!Number.isNaN(value) && value > 0) return value;
    }
  }
  return null;
}

function extractType(line: string): "income" | "expense" {
  if (/\b(cr|credit|credited|received|deposit|salary)\b/i.test(line) && !/\bdebit/i.test(line)) return "income";
  return "expense";
}

function extractRef(line: string): string {
  const upi = line.match(/UPI\/(?:DR|CR)\/(\d{6,})/i);
  if (upi) return `UPI${upi[1]}`;
  const rrn = line.match(/\b(?:ref(?:erence)?(?:\sno)?\.?:?\s*|rrn:?\s*)([A-Z0-9]{6,})/i);
  if (rrn) return rrn[1].toUpperCase();
  const neft = line.match(/\b((?:NEFT|IMPS|RTGS)[A-Z0-9]{6,})/i);
  if (neft) return neft[1].toUpperCase();
  const bare = line.match(/\b(\d{12})\b/);
  if (bare) return `UPI${bare[1]}`;
  return `REF${Math.floor(100000000000 + Math.random() * 899999999999)}`;
}

function extractMethod(line: string): string {
  if (/upi|vpa|@(?:icici|okhdfc|ybl|paytm|axl|oksbi)/i.test(line)) return "UPI";
  if (/neft/i.test(line)) return "NEFT";
  if (/imps/i.test(line)) return "IMPS";
  if (/rtgs/i.test(line)) return "RTGS";
  if (/atm|cash/i.test(line)) return "ATM";
  if (/auto[\s-]?debit|si\b|mandate/i.test(line)) return "Auto-Debit";
  if (/card|pos/i.test(line)) return "Card";
  return "Bank Transfer";
}

function extractBank(line: string): string {
  const known = line.match(/\b(HDFC|SBI|ICICI|AXIS|KOTAK|PNB)\b/i);
  // Demo-only masked account label — never a real account number.
  return known ? `${known[1].toUpperCase()} Demo (****0000)` : "Demo Bank (****0000)";
}

function extractTitle(line: string, merchant: string): string {
  const upi = line.match(/UPI\/(?:DR|CR)\/\d+\/([A-Za-z0-9 &._-]+)/i);
  if (upi) return upi[1].trim();
  const vpa = line.match(/VPA\s+([A-Za-z0-9._-]+)@/i);
  if (vpa) return vpa[1].replace(/[._-]/g, " ").trim();
  if (merchant !== "Unknown Merchant") return merchant;
  const words = line.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3);
  return words.slice(0, 3).join(" ") || "Statement Entry";
}

// Raw PDF stream / object keywords that must never become ledger rows.
const PDF_NOISE =
  /\b(stream|endstream|obj|endobj|xref|trailer|startxref|DeviceRGB|DeviceGray|DeviceCMYK|ColorSpace|Indexed|FlateDecode|MediaBox|Font|FontDescriptor|Encoding|Filter|Length|Contents|Metadata|Producer|CreationDate|Linearized)\b/i;

export function parseStatementText(raw: string): ParsedTxn[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 8 && /\d/.test(line))
    .filter((line) => !PDF_NOISE.test(line))
    // drop lines that are mostly non-text binary noise
    .filter((line) => (line.replace(/[^\x20-\x7E]/g, "").length / line.length) > 0.9);

  const results: ParsedTxn[] = [];

  lines.forEach((line, index) => {
    if (/^(date|txn|s\.?no|narration|description)\b/i.test(line)) return; // header row

    const amount = extractAmount(line);
    if (amount === null) return;

    const { merchant, category } = classify(line);
    const type = extractType(line);

    results.push({
      id: `PRS${Date.now().toString().slice(-5)}${index}`,
      title: extractTitle(line, merchant),
      amount,
      type,
      category: type === "income" && category === "Other" ? "Salary" : category,
      date: extractDate(line),
      bank: extractBank(line),
      method: extractMethod(line),
      refNo: extractRef(line),
      status: "Completed",
    });
  });

  return results;
}

// Clearly synthetic sample statement text used for one-click testing.
export const SAMPLE_STATEMENT = `Date, Narration, Ref No, Amount, Type
2026-08-01, SALARY CREDIT DEMO PAYROLL, NEFT00000001, Rs 50,000.00, CR
2026-08-03, UPI/DR/324156789012/Swiggy/HDFC/PAYMENT, , Rs 450.00, DR
2026-08-05, Debited Rs 1,299.00 from VPA amazon@icici (Demo), , , DR
2026-08-07, UPI/DR/324199900011/Uber/SBI/RIDE, , Rs 240.50, DR
2026-08-10, RENT PAYMENT LANDLORD DEMO IMPS00000010, , Rs 12,000.00, DR
2026-08-12, UPI/CR/324277711122/Freelance Studio/AXIS/INVOICE, , Rs 15,000.00, CR
2026-08-15, ZOMATO ORDER DEMO UPI 324333344455, , Rs 620.00, DR
2026-08-18, MUTUAL FUND SIP AUTO-DEBIT DEMO, , Rs 5,000.00, DR
2026-08-22, AIRTEL RECHARGE BILL DEMO UPI 324444455566, , Rs 799.00, DR`;
