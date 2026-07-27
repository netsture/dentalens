import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FileText,
  GraduationCap,
  History,
  Mail,
  MessageSquare,
  MoreHorizontal,
  NotebookPen,
  Pill,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCircle2,
  Wallet,
} from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";

type Row = {
  id: string;
  date: string;
  type: "invoice" | "claim" | "patient-payment" | "insurance-payment" | "note" | "void";
  title: string;
  details: string;
  patient: string;
  amount: string;
  negative?: boolean;
  expandable?: boolean;
  lines?: string[][];
};

const typeMeta: Record<Row["type"], { label: string; bar: string }> = {
  invoice: { label: "Invoice", bar: "bg-sky-400" },
  claim: { label: "Claim", bar: "bg-amber-400" },
  "patient-payment": { label: "Patient Payment", bar: "bg-emerald-400" },
  "insurance-payment": { label: "Insurance Payment", bar: "bg-violet-400" },
  note: { label: "Note", bar: "bg-orange-400" },
  void: { label: "Void", bar: "bg-slate-400" },
};

const transactions: Row[] = [
  {
    id: "inv-5131",
    date: "Nov 19, 2020",
    type: "invoice",
    title: "Invoice #5131",
    details: "Patient: $152.00",
    patient: "Denise Wingard",
    amount: "$274.00",
    expandable: true,
    lines: [
      ["D2393 - Resin Based Restoration, Three Surfaces, Posterior", "20-MOD", "Greg Moses", "$67.20", "$206.80", "$274.00"],
    ],
  },
  {
    id: "claim-1136",
    date: "Nov 19, 2020",
    type: "claim",
    title: "Claim #1136",
    details: "CIGNA | Submitted | Claim tag: Open",
    patient: "",
    amount: "",
  },
  {
    id: "pp-5193",
    date: "Dec 10, 2020",
    type: "patient-payment",
    title: "Patient account payment #5193",
    details: "Denise Wingard | Visa",
    patient: "",
    amount: "($54.80)",
    negative: true,
    expandable: true,
    lines: [
      ["D2393 - Resin Based Restoration", "20-MOD", "Greg Moses", "($54.80)", "", ""],
    ],
  },
  {
    id: "invoice-5192",
    date: "Dec 10, 2020",
    type: "invoice",
    title: "Invoice #5192",
    details: "Patient: $88.80",
    patient: "Denise Wingard",
    amount: "$171.00",
    expandable: true,
    lines: [
      ["D7140 - Extraction, erupted tooth or exposed root", "3", "Greg Moses", "$48.00", "$123.00", "$171.00"],
    ],
  },
  {
    id: "claim-1155",
    date: "Dec 10, 2020",
    type: "claim",
    title: "Claim #1155",
    details: "CIGNA | Submitted | Claim tag: Open",
    patient: "",
    amount: "",
  },
  {
    id: "ins-5229",
    date: "Dec 10, 2020",
    type: "insurance-payment",
    title: "Insurance payment #5229",
    details: "CIGNA | Insurance EFT",
    patient: "",
    amount: "($67.20)",
    negative: true,
  },
  {
    id: "note-1",
    date: "Dec 24, 2020",
    type: "note",
    title: "Note",
    details: "EFT #11508194: Alternate benefit code applied for procedure D2393.",
    patient: "",
    amount: "",
  },
  {
    id: "invoice-5254",
    date: "Dec 31, 2020",
    type: "invoice",
    title: "Invoice #5254",
    details: "Patient: $708.00",
    patient: "Denise Wingard",
    amount: "$1,525.00",
    expandable: true,
    lines: [
      ["D2950 - Core buildup, including any pins when required", "21", "Greg Moses", "$95.50", "$204.50", "$300.00"],
      ["D2740 - Crown, porcelain/ceramic", "21-Ceramic", "Greg Moses", "$171.50", "$1,053.50", "$1,225.00"],
    ],
  },
  {
    id: "pp-5255",
    date: "Dec 31, 2020",
    type: "patient-payment",
    title: "Patient payment #5255",
    details: "Denise Wingard | Visa",
    patient: "",
    amount: "($550.00)",
    negative: true,
    expandable: true,
    lines: [
      ["D2950 - Core buildup, including any pins when required", "21", "Greg Moses", "", "($60.00)", "($60.00)"],
      ["D2740 - Crown, porcelain/ceramic", "21-Ceramic", "Greg Moses", "", "($490.00)", "($490.00)"],
    ],
  },
  {
    id: "claim-1171",
    date: "Dec 31, 2020",
    type: "claim",
    title: "Claim #1171",
    details: "CIGNA | Submitted | Claim tag: Open",
    patient: "",
    amount: "",
  },
  {
    id: "ins-5384",
    date: "Jan 14, 2021",
    type: "insurance-payment",
    title: "Insurance payment #5384",
    details: "CIGNA | Insurance EFT",
    patient: "",
    amount: "($267.00)",
    negative: true,
    expandable: true,
    lines: [
      ["D2950 - Core buildup, including any pins when required", "21", "Greg Moses", "($95.50)", "", "($95.50)"],
      ["D2740 - Crown, porcelain/ceramic", "21-Ceramic", "Greg Moses", "($171.50)", "", "($171.50)"],
    ],
  },
  {
    id: "void-5355",
    date: "Jan 28, 2021",
    type: "void",
    title: "Patient account payment #5355",
    details: "Void",
    patient: "",
    amount: "",
  },
];

const sideMenu = [
  { name: "Profile", icon: UserCircle2 },
  { name: "Insurance", icon: ShieldCheck },
  { name: "Claims", icon: FileCheck2 },
  { name: "Billing", icon: CircleDollarSign },
  { name: "Recare", icon: History },
  { name: "Education", icon: GraduationCap },
  { name: "Charting", icon: Stethoscope },
  { name: "Perio Charting", icon: ReceiptText },
  { name: "Appointments", icon: CalendarDays },
  { name: "Files and Letters", icon: FileText },
  { name: "Correspondence", icon: Mail },
  { name: "Notes", icon: NotebookPen },
  { name: "Prescriptions", icon: Pill },
];

const aging = [
  { label: "Account Holder", values: ["$0.00", "$0.00", "$0.00", "$948.80", "$948.80"] },
  { label: "Primary Insurance", values: ["$0.00", "$0.00", "$0.00", "$0.00", "$0.00"] },
  { label: "Other Insurance", values: ["$0.00", "$0.00", "$0.00", "$0.00", "$0.00"] },
];

export default function PatientBillingPage() {
  const [active, setActive] = useState("Billing");
  const [openId, setOpenId] = useState<string | null>("inv-5131");
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [agingRefreshing, setAgingRefreshing] = useState(false);

  const filteredTx = useMemo(() => {
    void tick;
    let list = transactions;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.details.toLowerCase().includes(s) ||
        t.patient.toLowerCase().includes(s) ||
        t.date.toLowerCase().includes(s)
    );
  }, [q, typeFilter, tick]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold">Patient Billing</h1>
          <p className="text-[11px] text-muted-foreground">Ledger, claims and account aging</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        <div className="col-span-12 xl:col-span-9 flex flex-col gap-2 min-h-0">
          <TableToolbar
            search={q}
            onSearchChange={setQ}
            searchPlaceholder="Search transactions..."
            onRefresh={handleRefresh}
            refreshing={refreshing}
            filterContent={
              <div className="field min-w-[180px]">
                <label>Transaction Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="invoice">Invoice</option>
                  <option value="claim">Claim</option>
                  <option value="patient-payment">Patient Payment</option>
                  <option value="insurance-payment">Insurance Payment</option>
                  <option value="note">Note</option>
                  <option value="void">Void</option>
                </select>
              </div>
            }
            actions={
              <>
                <button type="button" className="btn btn-primary"><Plus className="w-3.5 h-3.5" /> Invoice</button>
                <button type="button" className="btn btn-success"><Plus className="w-3.5 h-3.5" /> Account payment <ChevronDown className="w-3 h-3" /></button>
                <button type="button" className="btn"><Plus className="w-3.5 h-3.5" /> Deposit</button>
                <button type="button" className="btn"><FileText className="w-3.5 h-3.5" /> Statement</button>
                <button type="button" className="btn"><MessageSquare className="w-3.5 h-3.5" /></button>
                <button type="button" className="btn"><Bell className="w-3.5 h-3.5" /></button>
              </>
            }
          />

          <div className="panel flex flex-col min-h-0 flex-1">
            <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground font-bold bg-secondary border-b border-border">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Transaction</div>
              <div className="col-span-4">Details</div>
              <div className="col-span-2">Patient</div>
              <div className="col-span-1 text-right">Amount</div>
            </div>

            <div className="overflow-auto flex-1">
              {filteredTx.map((row) => {
                const meta = typeMeta[row.type];
                const open = openId === row.id;
                return (
                  <div key={row.id} className="border-b border-border">
                    <div className="grid grid-cols-12 items-center gap-2 px-3 py-2 hover:bg-secondary/60">
                      <button
                        type="button"
                        className="col-span-2 flex items-center gap-1.5 text-left border-none bg-transparent cursor-pointer"
                        onClick={() => row.expandable && setOpenId(open ? null : row.id)}
                      >
                        {row.expandable ? (
                          open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <span className="w-3.5" />
                        )}
                        <span className="text-[11px] font-medium">{row.date}</span>
                      </button>
                      <div className="col-span-3 flex items-center gap-2">
                        <span className={`w-1 h-4 rounded-full ${meta.bar}`} />
                        <span className="text-[11px] font-semibold">{row.title}</span>
                      </div>
                      <div className="col-span-4 text-[11px] text-muted-foreground truncate">{row.details}</div>
                      <div className="col-span-2 text-[11px]">{row.patient}</div>
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <span className={`text-[11px] font-bold ${row.negative ? "text-destructive" : ""}`}>
                          {row.amount}
                        </span>
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                    {open && row.lines && (
                      <div className="px-8 pb-3">
                        <div className="table-wrap">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Line item</th>
                                <th>Site</th>
                                <th>Provider</th>
                                <th>Insurance</th>
                                <th>Patient</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.lines.map((line, i) => (
                                <tr key={i}>
                                  {line.map((c, j) => (
                                    <td key={j}>{c}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <TableToolbar
            searchPlaceholder="Search aging..."
            onRefresh={() => {
              setAgingRefreshing(true);
              setTimeout(() => setAgingRefreshing(false), 400);
            }}
            refreshing={agingRefreshing}
            filterContent={
              <div className="field min-w-[160px]">
                <label>Bucket</label>
                <select defaultValue="all">
                  <option value="all">All</option>
                  <option value="30">Past 30</option>
                  <option value="60">31–60</option>
                  <option value="90">61–90</option>
                  <option value="90plus">Over 90</option>
                </select>
              </div>
            }
          />

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-primary" /> Account Summary
              </div>
            </div>
            <div className="p-3 flex items-center gap-4 overflow-auto">
              <div
                className="w-20 h-20 rounded-full shrink-0 grid place-items-center"
                style={{ background: "conic-gradient(#f59e0b 0deg 356deg, #e2e8f0 356deg)" }}
                aria-label="99 percent of balance is over 90 days"
              >
                <div className="w-12 h-12 rounded-full bg-card grid place-items-center text-[11px] font-bold text-amber-600">
                  99%+
                </div>
              </div>
              <table className="data-table min-w-[620px]">
                <thead>
                  <tr>
                    <th></th>
                    <th>Past 30 Days</th>
                    <th>31–60</th>
                    <th>61–90</th>
                    <th>Over 90</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {aging.map((r) => (
                    <tr key={r.label}>
                      <td className="font-semibold">{r.label}</td>
                      {r.values.slice(0, 4).map((v, i) => (
                        <td key={i}>{v}</td>
                      ))}
                      <td className="text-right font-semibold">{r.values[4]}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/50">
                    <td>Total</td>
                    <td>$0.00</td>
                    <td>$0.00</td>
                    <td>$0.00</td>
                    <td>$948.80</td>
                    <td className="text-right text-destructive">$948.80</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="col-span-12 xl:col-span-3 flex flex-col gap-2">
          <div className="panel p-3">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patient"
                className="w-full h-7 pl-8 pr-8 text-[11px] border border-border rounded-[3px] bg-background outline-none focus:border-primary"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-none cursor-pointer">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
              <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                <UserCircle2 className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-bold text-primary text-[13px]">Denise Wingard</p>
                <p className="text-[10px] text-muted-foreground">Patient #16665</p>
              </div>
            </div>
            <nav className="flex flex-col gap-0.5">
              {sideMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActive(item.name)}
                    className={`w-full flex items-center gap-2 px-2 h-7 rounded-[3px] text-[11px] font-medium text-left border-none cursor-pointer ${
                      active === item.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-foreground hover:bg-secondary"
                    }`}
                  >
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-75" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="panel p-3">
            <div className="flex items-center justify-between mb-2 text-[11px]">
              <button className="btn btn-ghost p-0 h-auto border-0"><ChevronLeft className="w-4 h-4" /></button>
              <div className="font-semibold">August 2021</div>
              <button className="btn btn-ghost p-0 h-auto border-0"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <table className="w-full text-[10px] text-center">
              <thead>
                <tr className="text-muted-foreground">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <th key={d} className="py-1 font-medium">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [1, 2, 3, 4, 5, 6, 7],
                  [8, 9, 10, 11, 12, 13, 14],
                  [15, 16, 17, 18, 19, 20, 21],
                  [22, 23, 24, 25, 26, 27, 28],
                  [29, 30, 31, 1, 2, 3, 4],
                ].map((row, ri) => (
                  <tr key={ri}>
                    {row.map((d, ci) => (
                      <td key={ci} className="py-0.5">
                        <span
                          className={`inline-flex w-5 h-5 items-center justify-center rounded-full ${
                            d === 2 && ri === 0 ? "bg-destructive text-white font-bold" : ""
                          } ${ri === 4 && ci >= 3 ? "text-muted-foreground/40" : ""}`}
                        >
                          {d}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
}
