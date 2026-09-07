import { useState } from "react";
import {
  Wallet, ArrowUpRight, ArrowDownRight, Plus,
  Search, Eye, Trash2, X, CreditCard, Building, CheckCircle,
} from "lucide-react";
import StatementParser from "@/components/StatementParser";
import AccountSync from "@/components/AccountSync";
import type { ParsedTxn } from "@/lib/statementParser";


type Txn = {
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

// Synthetic / demo-only sample records. No real account data.
const INITIAL_TRANSACTIONS: Txn[] = [
  { id: "TXN1001", title: "Monthly Salary", amount: 50000, type: "income", category: "Salary", date: "2026-09-01", bank: "Demo Bank (****0000)", method: "NEFT", refNo: "NEFT00000001", status: "Completed" },
  { id: "TXN1002", title: "Freelance Design", amount: 15000, type: "income", category: "Freelance", date: "2026-09-03", bank: "Sample Bank (****0000)", method: "UPI", refNo: "UPI000000000002", status: "Completed" },
  { id: "TXN1003", title: "Rent Payment", amount: 12000, type: "expense", category: "Housing", date: "2026-09-04", bank: "Demo Bank (****0000)", method: "IMPS", refNo: "IMPS00000003", status: "Completed" },
  { id: "TXN1004", title: "Food Delivery Order", amount: 450, type: "expense", category: "Food & Dining", date: "2026-09-05", bank: "Mock Bank (****0000)", method: "UPI", refNo: "UPI000000000004", status: "Completed" },
  { id: "TXN1005", title: "Mutual Fund SIP", amount: 5000, type: "expense", category: "Investments", date: "2026-09-06", bank: "Demo Bank (****0000)", method: "Auto-Debit", refNo: "SIP00000005", status: "Completed" },
];

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Txn[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);
  const [linkedBalance, setLinkedBalance] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food & Dining",
    type: "expense" as "expense" | "income",
    bank: "Demo Bank (****0000)",
    method: "UPI",
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const categories = ["All", ...Array.from(new Set(transactions.map((t) => t.category)))];

  const filteredTransactions = transactions.filter(
    (t) =>
      (categoryFilter === "All" || t.category === categoryFilter) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Parsed rows are merged into local state only — nothing is persisted or uploaded.
  const handleParsed = (parsed: ParsedTxn[]) => setTransactions([...parsed, ...transactions]);

  // Simulated account link: synthetic rows and balances merged into local state only.
  const handleSynced = (synced: ParsedTxn[], accountsBalance: number) => {
    setTransactions([...synced, ...transactions]);
    setLinkedBalance(accountsBalance);
  };




  // Prototype only: submissions stay in local component state, nothing is persisted.
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    const newTxn: Txn = {
      id: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: new Date().toISOString().split("T")[0],
      bank: form.bank,
      method: form.method,
      refNo: `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      status: "Completed",
    };
    setTransactions([newTxn, ...transactions]);
    setForm({ title: "", amount: "", category: "Food & Dining", type: "expense", bank: "Demo Bank (****0000)", method: "UPI" });
  };

  const handleDelete = (id: string) => setTransactions(transactions.filter((t) => t.id !== id));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="text-primary" /> FinanceFlow India
            </h1>
            <p className="text-sm text-muted-foreground">Personal Dashboard &amp; Transaction Manager — demo only, synthetic sample data</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
            <span className="text-sm text-muted-foreground font-medium">Net Balance</span>
            <div className="text-3xl font-bold mt-2 text-primary">
              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            {linkedBalance !== null && (
              <p className="text-xs text-muted-foreground mt-2">
                Linked demo accounts: ₹{linkedBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-income" /> Total Income
            </span>
            <div className="text-3xl font-bold mt-2 text-income">
              +₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4 text-expense" /> Total Expenses
            </span>
            <div className="text-3xl font-bold mt-2 text-expense">
              -₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <AccountSync onSync={handleSynced} />

        <StatementParser onParsed={handleParsed} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-surface p-5 rounded-xl border border-border shadow-sm h-fit">
            <h2 className="text-lg font-semibold mb-4">Log New Transaction</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "expense" })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border ${form.type === "expense" ? "bg-expense-soft border-expense-muted text-expense" : "border-border text-muted-foreground"}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "income" })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border ${form.type === "income" ? "bg-income-soft border-income-muted text-income" : "border-border text-muted-foreground"}`}
                >
                  Income
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Food delivery order"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 p-2 border border-border rounded-lg text-sm focus:outline-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full mt-1 p-2 border border-border rounded-lg text-sm focus:outline-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1 p-2 border border-border rounded-lg text-sm bg-surface"
                >
                  <option value="Food & Dining">Food &amp; Dining</option>
                  <option value="Housing">Housing</option>
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Investments">Investments</option>
                  <option value="Shopping">Shopping</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-foreground text-surface py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:opacity-90">
                <Plus className="w-4 h-4" /> Add Transaction
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-surface p-5 rounded-xl border border-border shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Transactions ({filteredTransactions.length})</h2>
              <div className="flex w-full sm:w-auto gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="py-1.5 px-2 text-sm border border-border rounded-lg bg-surface"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search merchant/category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-border rounded-lg focus:outline-primary"
                  />
                </div>
              </div>
            </div>


            <div className="divide-y divide-divider max-h-txn-list overflow-y-auto">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between hover:bg-background px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${t.type === "income" ? "bg-income-soft text-income" : "bg-expense-soft text-expense"}`}>
                      {t.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{t.title}</h4>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{t.category}</span> • <span>{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${t.type === "income" ? "text-income" : "text-foreground"}`}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </span>
                    <button onClick={() => setSelectedTxn(t)} title="View Details" className="p-1.5 text-muted-foreground hover:text-primary hover:bg-divider rounded-md">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} title="Delete" className="p-1.5 text-muted-foreground hover:text-expense hover:bg-divider rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedTxn && (
          <div className="fixed inset-0 bg-overlay/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-xl shadow-lg border border-border max-w-md w-full p-6 relative">
              <button onClick={() => setSelectedTxn(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                Transaction Breakdown
              </div>
              <h3 className="text-xl font-bold text-foreground">{selectedTxn.title}</h3>
              <p className="text-3xl font-extrabold my-3 text-foreground">
                {selectedTxn.type === "income" ? "+" : "-"}₹{selectedTxn.amount.toLocaleString("en-IN")}
              </p>
              <div className="space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-income" /> Status</span>
                  <span className="font-semibold text-income">{selectedTxn.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-foreground">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Building className="w-4 h-4" /> Linked Account</span>
                  <span className="font-medium">{selectedTxn.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Method</span>
                  <span className="font-medium">{selectedTxn.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference No (RRN)</span>
                  <span className="font-mono text-xs bg-divider p-1 rounded">{selectedTxn.refNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium bg-primary-soft text-primary-strong px-2 py-0.5 rounded text-xs">{selectedTxn.category}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="w-full mt-6 bg-divider text-foreground py-2 rounded-lg font-medium hover:bg-border">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
