import { useState } from "react";
import { Smartphone, ShieldCheck, X, Building, Loader2, CheckCircle } from "lucide-react";
import type { ParsedTxn } from "@/lib/statementParser";

// Prototype-only account linking simulation.
// No real account aggregator, no network calls, no persistence — every value below is synthetic.
// A production implementation must use approved systems and pass security/privacy review.

type DemoAccount = {
  id: string;
  bank: string;
  mask: string;
  balance: number;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: "acc-hdfc", bank: "HDFC Demo", mask: "****4102", balance: 84250.75 },
  { id: "acc-sbi", bank: "SBI Demo", mask: "****8819", balance: 31980.4 },
  { id: "acc-icici", bank: "ICICI Demo", mask: "****0000", balance: 12500 },
];

// Representative synthetic transactions "discovered" per demo account.
const DEMO_TRANSACTIONS: Record<string, Omit<ParsedTxn, "id" | "bank">[]> = {
  "acc-hdfc": [
    { title: "Monthly Salary", amount: 50000, type: "income", category: "Salary", date: "2026-09-01", method: "NEFT", refNo: "NEFT00000101", status: "Completed" },
    { title: "Rent Payment", amount: 12000, type: "expense", category: "Housing", date: "2026-09-04", method: "IMPS", refNo: "IMPS00000102", status: "Completed" },
    { title: "Electricity Bill", amount: 1840, type: "expense", category: "Utilities", date: "2026-09-06", method: "Auto-Debit", refNo: "REF000000000103", status: "Completed" },
  ],
  "acc-sbi": [
    { title: "Food Delivery Order", amount: 450, type: "expense", category: "Food & Dining", date: "2026-09-05", method: "UPI", refNo: "UPI000000000201", status: "Completed" },
    { title: "Cab Ride", amount: 240.5, type: "expense", category: "Transport", date: "2026-09-07", method: "UPI", refNo: "UPI000000000202", status: "Completed" },
    { title: "Freelance Invoice", amount: 15000, type: "income", category: "Freelance", date: "2026-09-03", method: "UPI", refNo: "UPI000000000203", status: "Completed" },
  ],
  "acc-icici": [
    { title: "Online Shopping", amount: 1299, type: "expense", category: "Shopping", date: "2026-09-02", method: "Card", refNo: "REF000000000301", status: "Completed" },
    { title: "Mutual Fund SIP", amount: 5000, type: "expense", category: "Investments", date: "2026-09-06", method: "Auto-Debit", refNo: "SIP00000302", status: "Completed" },
  ],
};

type Step = "idle" | "otp" | "discovering" | "accounts" | "done";

export default function AccountSync({ onSync }: { onSync: (txns: ParsedTxn[], balance: number) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>(DEMO_ACCOUNTS.map((a) => a.id));

  const phoneValid = /^\d{10}$/.test(phone);

  const closeAll = () => {
    setStep("idle");
    setOtp("");
    setError("");
  };

  const handleSendOtp = () => {
    if (!phoneValid) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    setError("");
    setOtp("");
    setStep("otp");
  };

  const handleVerify = () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter any 6-digit demo code, e.g. 123456.");
      return;
    }
    setError("");
    setStep("discovering");
    // Simulated discovery delay — no request is made.
    window.setTimeout(() => setStep("accounts"), 1200);
  };

  const toggleAccount = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const handleConfirm = () => {
    const accounts = DEMO_ACCOUNTS.filter((a) => selected.includes(a.id));
    const txns: ParsedTxn[] = accounts.flatMap((account) =>
      (DEMO_TRANSACTIONS[account.id] ?? []).map((t, index) => ({
        ...t,
        id: `AA${account.id.slice(-4).toUpperCase()}${index}`,
        bank: `${account.bank} (${account.mask})`,
      }))
    );
    const balance = accounts.reduce((sum, a) => sum + a.balance, 0);
    onSync(txns, balance);
    setStep("done");
    setOtp("");
  };

  return (
    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" /> Link Bank Accounts
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Demo only — synthetic sample accounts. No real accounts are contacted and nothing is stored.
          </p>
        </div>
        {step === "done" && (
          <span className="text-xs font-medium text-income flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Demo accounts linked
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="flex items-center border border-border rounded-lg overflow-hidden flex-1">
          <span className="px-3 py-2 text-sm text-muted-foreground bg-background border-r border-border">+91</span>
          <input
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="flex-1 px-3 py-2 text-sm bg-surface focus:outline-primary"
          />
        </div>
        <button
          onClick={handleSendOtp}
          className="bg-foreground text-surface px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          disabled={!phoneValid}
        >
          Send OTP
        </button>
      </div>
      {error && step === "idle" && <p className="text-xs text-expense mt-2">{error}</p>}

      {step === "otp" && (
        <div className="fixed inset-0 bg-overlay/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl shadow-lg border border-border max-w-sm w-full p-6 relative">
            <button onClick={closeAll} className="absolute right-4 top-4 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" /> Verify Mobile (Demo)
            </div>
            <h3 className="text-lg font-bold text-foreground">Enter the 6-digit code</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sent to +91 {phone} in this prototype. Any 6 digits work, e.g. 123456.
            </p>
            <input
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full mt-4 p-3 text-center text-lg font-mono tracking-widest border border-border rounded-lg focus:outline-primary"
            />
            {error && <p className="text-xs text-expense mt-2">{error}</p>}
            <button
              onClick={handleVerify}
              className="w-full mt-4 bg-foreground text-surface py-2.5 rounded-lg text-sm font-medium hover:opacity-90"
            >
              Verify &amp; Continue
            </button>
          </div>
        </div>
      )}

      {step === "discovering" && (
        <div className="fixed inset-0 bg-overlay/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl shadow-lg border border-border max-w-sm w-full p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Discovering demo accounts…</p>
            <p className="text-xs text-muted-foreground">Simulated locally — no data leaves this page.</p>
          </div>
        </div>
      )}

      {step === "accounts" && (
        <div className="fixed inset-0 bg-overlay/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl shadow-lg border border-border max-w-md w-full p-6 relative">
            <button onClick={closeAll} className="absolute right-4 top-4 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Accounts Found (Synthetic)</div>
            <h3 className="text-lg font-bold text-foreground">Select accounts to load</h3>
            <div className="mt-4 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <label
                  key={account.id}
                  className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-background"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(account.id)}
                      onChange={() => toggleAccount(account.id)}
                    />
                    <span>
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-muted-foreground" /> {account.bank}
                      </span>
                      <span className="text-xs text-muted-foreground">{account.mask} • Savings</span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    ₹{account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="w-full mt-5 bg-foreground text-surface py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Load Demo Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
