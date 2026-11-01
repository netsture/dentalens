import { useMemo, useState } from "react";
import { FilterX } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { exportToExcel } from "@/lib/exportToExcel";

type AccountRow = {
  id: string;
  procId: string;
  procMeta: string;
  office: string;
  createdDate: string;
  startDate: string;
  finishDate: string;
  productCode: string;
  provider: string;
  insurance: string;
  officeFees: string;
  insPaid: string;
  deductible: string;
  patCharge: string;
  patPaid: string;
  patAdj: string;
  patBal: string;
  lo: string;
  user: string;
};

type ColumnKey = keyof Omit<AccountRow, "id" | "procMeta">;
type ColumnFilterType = "text" | "select";
type FilterState = Record<string, string>;

const seedAccounts: AccountRow[] = [
  {
    id: "r201910",
    procId: "R201910",
    procMeta: "PLANID:1",
    office: "TEST DR. B",
    createdDate: "01-08-2021",
    startDate: "01-08-2021",
    finishDate: "01-08-2021",
    productCode: "D1099",
    provider: "START:001 OFFICE ACCOUNT (DOCTOR) = 100%\nFINISH:001 OFFICE ACCOUNT (DOCTOR) = 0%",
    insurance: "DRPP DISCOUNT PLAN (DISCOUNT PLANS)[DED]",
    officeFees: "$15.00",
    insPaid: "×",
    deductible: "×",
    patCharge: "$15.00",
    patPaid: "×",
    patAdj: "",
    patBal: "$15.00",
    lo: "×",
    user: "LIVEADMIN",
  },
  {
    id: "acc120970-127",
    procId: "ACC120970-127",
    procMeta: "PLANID:2\nCL.SENT:0",
    office: "TEST DR. B",
    createdDate: "01-01-2026",
    startDate: "",
    finishDate: "",
    productCode: "",
    provider: "PATIENT PAYMENT",
    insurance: "BCBS OF ATLANTA (PPO)\n[BCBSOFATLANTA_1]",
    officeFees: "",
    insPaid: "×",
    deductible: "",
    patCharge: "×",
    patPaid: "$15.00",
    patAdj: "$0.00",
    patBal: "$0.00",
    lo: "×",
    user: "LIVEADMIN",
  },
];

const moneyKeys = ["officeFees", "insPaid", "deductible", "patCharge", "patPaid", "patAdj", "patBal", "lo"] as const;
type MoneyKey = (typeof moneyKeys)[number];

const columns: { key: ColumnKey; label: string; filter: ColumnFilterType; money?: boolean }[] = [
  { key: "procId", label: "Proc Id", filter: "text" },
  { key: "office", label: "Office", filter: "select" },
  { key: "createdDate", label: "Created Date", filter: "text" },
  { key: "startDate", label: "Start Date", filter: "text" },
  { key: "finishDate", label: "Finish Date", filter: "text" },
  { key: "productCode", label: "Product Code", filter: "text" },
  { key: "provider", label: "Provider", filter: "text" },
  { key: "insurance", label: "Insurance", filter: "text" },
  { key: "officeFees", label: "Office Fees", filter: "text", money: true },
  { key: "insPaid", label: "Ins Paid", filter: "text", money: true },
  { key: "deductible", label: "Deductible", filter: "text", money: true },
  { key: "patCharge", label: "Pat Charge", filter: "text", money: true },
  { key: "patPaid", label: "Pat Paid", filter: "text", money: true },
  { key: "patAdj", label: "Pat Adj", filter: "text", money: true },
  { key: "patBal", label: "Pat Bal", filter: "text", money: true },
  { key: "lo", label: "L/O", filter: "text", money: true },
  { key: "user", label: "User", filter: "select" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

function moneyValue(value: string) {
  if (!value || value === "×" || value === "x") return 0;
  const n = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function displayCell(row: AccountRow, key: ColumnKey) {
  if (key === "procId") {
    return (
      <div>
        <div className="font-semibold">{row.procId}</div>
        {row.procMeta ? (
          <div className="text-[10px] text-muted-foreground whitespace-pre-line">{row.procMeta}</div>
        ) : null}
      </div>
    );
  }
  const value = row[key];
  if (key === "provider" || key === "insurance") {
    return <span className="whitespace-pre-line">{value || "—"}</span>;
  }
  return value || "—";
}

export function PatientAccountsPanel() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      map[col.key] = Array.from(
        new Set(seedAccounts.map((row) => String(row[col.key] ?? "")).filter(Boolean))
      ).sort();
    });
    return map;
  }, []);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearColumnFilters = () => setFilters({});
  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  const filtered = useMemo(() => {
    void tick;
    return seedAccounts.filter((row) => {
      if (q.trim()) {
        const s = q.toLowerCase();
        const hit = [row.procId, row.procMeta, ...columns.map((col) => String(row[col.key] ?? ""))].some((value) =>
          value.toLowerCase().includes(s)
        );
        if (!hit) return false;
      }

      for (const col of columns) {
        const f = (filters[col.key] ?? "").trim();
        if (!f) continue;
        const text = col.key === "procId" ? `${row.procId} ${row.procMeta}` : String(row[col.key] ?? "");
        if (col.filter === "select") {
          if (text !== f) return false;
        } else if (!text.toLowerCase().includes(f.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [q, filters, tick]);

  const totals = useMemo(() => {
    const sums = Object.fromEntries(moneyKeys.map((key) => [key, 0])) as Record<MoneyKey, number>;
    filtered.forEach((row) => {
      moneyKeys.forEach((key) => {
        sums[key] += moneyValue(row[key]);
      });
    });
    sums.patBal = sums.patCharge - sums.patPaid - sums.patAdj;
    return sums;
  }, [filtered]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  const handleExport = () => {
    const headers = columns.map((c) => c.label);
    const rows = filtered.map((row) =>
      columns.map((col) => {
        if (col.key === "procId") return [row.procId, row.procMeta].filter(Boolean).join(" ");
        return row[col.key] ?? "";
      })
    );
    rows.push(
      columns.map((col) => {
        if (col.key === "procId") return "TOTAL";
        if (col.money) return formatMoney(totals[col.key as MoneyKey]);
        return "";
      })
    );
    const stamp = new Date().toISOString().slice(0, 10);
    exportToExcel(`patient-accounts-${stamp}`, headers, rows, "Patient Accounts");
  };

  const renderColumnFilter = (col: (typeof columns)[number]) => {
    if (col.filter === "select") {
      return (
        <select value={filters[col.key] ?? ""} onChange={(e) => setFilter(col.key, e.target.value)} className={filterInputClass}>
          <option value="">All</option>
          {(selectOptions[col.key] ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type="text"
        placeholder="Search…"
        value={filters[col.key] ?? ""}
        onChange={(e) => setFilter(col.key, e.target.value)}
        className={filterInputClass}
      />
    );
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search accounts..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onFiltersOpenChange={setFiltersOpen}
        showFilterPanel={false}
        defaultFiltersOpen
        onExport={handleExport}
        exportLabel="Export"
        actions={
          activeFilterCount > 0 ? (
            <button type="button" className="btn" onClick={clearColumnFilters} title="Clear column filters">
              <FilterX className="w-3 h-3" />
              Clear ({activeFilterCount})
            </button>
          ) : null
        }
      />

      <div className="table-wrap flex-1 min-h-0 bg-card">
        <table className="data-table min-w-[1280px] [&_tbody_td]:bg-card [&_tbody_tr:hover_td]:bg-card">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.money ? "text-right" : ""}>
                  {col.label}
                </th>
              ))}
            </tr>
            {filtersOpen && (
              <tr className="bg-secondary/80">
                {columns.map((col) => (
                  <th key={`f-${col.key}`} className="!normal-case !tracking-normal !font-medium !py-1.5">
                    {renderColumnFilter(col)}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted-foreground py-6">
                  No accounts match the current filters.
                </td>
              </tr>
            ) : (
              <>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${col.money ? "text-right tabular-nums whitespace-nowrap" : ""} ${
                          col.key === "procId" || col.key === "productCode" ? "font-semibold" : ""
                        } ${col.key === "office" || col.key === "user" ? "whitespace-nowrap" : ""} ${
                          col.key === "provider" || col.key === "insurance" ? "min-w-[180px]" : ""
                        }`}
                      >
                        {displayCell(row, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold">
                  {columns.map((col) => (
                    <td key={`t-${col.key}`} className={col.money ? "text-right tabular-nums whitespace-nowrap" : ""}>
                      {col.key === "procId" ? "TOTAL" : col.money ? formatMoney(totals[col.key as MoneyKey]) : ""}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground shrink-0">
        Showing {filtered.length} of {seedAccounts.length} records
        {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter(s) active` : ""}
      </p>
    </div>
  );
}
