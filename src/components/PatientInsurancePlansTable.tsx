import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, FilterX, Pencil, Phone, ScrollText } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";
import { exportToExcel } from "@/lib/exportToExcel";

type InsurancePlanRow = {
  srNo: number;
  company: string;
  phone: string;
  plan: string;
  relation: string;
  dob: string;
  policyHolderId: string;
  dependentId: string;
  lastName: string;
  firstName: string;
  policyType: string;
  addpCategory: string;
  eligibility: string;
  checkedBy: string;
  checkedAt: string;
  isActive: string;
  network: string;
};

const seedPlans: InsurancePlanRow[] = [
  {
    srNo: 1,
    company: "KEYSTONE HEALTH EAST (HMO DMO-DI-MO)",
    phone: "886-367-3504",
    plan: "STAND_G GENERAL DENTISTRY",
    relation: "SELF",
    dob: "12-13-1948",
    policyHolderId: "5M344651",
    dependentId: "5M344651",
    lastName: "MORELL",
    firstName: "ALBERTO",
    policyType: "PRIMARY",
    addpCategory: "",
    eligibility: "Not Eligible",
    checkedBy: "UMECHITA",
    checkedAt: "08-05-2026 · 06-09-2026 09:32 AM",
    isActive: "Yes",
    network: "OUT NETWORK",
  },
  {
    srNo: 2,
    company: "AETNA OPEN ACCESS BY DENTAL PLANS (DISCOUNT PLANS)",
    phone: "805-989-4408",
    plan: "DEFAULT_G ORAL SURGERY",
    relation: "SELF",
    dob: "12-13-1948",
    policyHolderId: "805298032",
    dependentId: "805298032",
    lastName: "MORELL",
    firstName: "ALBERTO",
    policyType: "PRIMARY",
    addpCategory: "",
    eligibility: "Eligible",
    checkedBy: "UMECHITA",
    checkedAt: "08-05-2026 · 06-09-2026 01:06 PM",
    isActive: "No",
    network: "IN NETWORK",
  },
  {
    srNo: 3,
    company: "KEYSTONE HEALTH EAST (HMO DMO-DI-MO)",
    phone: "886-367-3504",
    plan: "BASIC_G GENERAL DENTISTRY",
    relation: "SELF",
    dob: "12-13-1948",
    policyHolderId: "5M344651",
    dependentId: "5M344651",
    lastName: "MORELL",
    firstName: "ALBERTO",
    policyType: "SECONDARY",
    addpCategory: "",
    eligibility: "Not Eligible",
    checkedBy: "UMECHITA",
    checkedAt: "11-08-2026 · 08-09-2026 09:32 AM",
    isActive: "Yes",
    network: "OUT NETWORK",
  },
  {
    srNo: 4,
    company: "KEYSTONE FIRST (MEDICAID)",
    phone: "805-343-7491",
    plan: "DEFAULT_G GENERAL DENTISTRY",
    relation: "SELF",
    dob: "12-13-1948",
    policyHolderId: "5M344651",
    dependentId: "5M344651",
    lastName: "MORELL",
    firstName: "ALBERTO",
    policyType: "SECONDARY",
    addpCategory: "",
    eligibility: "Not Eligible",
    checkedBy: "NISHITA",
    checkedAt: "08-05-2020 · 06-09-2026 01:06 PM",
    isActive: "Yes",
    network: "IN NETWORK",
  },
];

type SortKey = keyof Pick<
  InsurancePlanRow,
  | "srNo"
  | "company"
  | "plan"
  | "relation"
  | "dob"
  | "policyHolderId"
  | "dependentId"
  | "lastName"
  | "firstName"
  | "policyType"
  | "addpCategory"
  | "eligibility"
  | "isActive"
  | "network"
>;
type SortDir = "asc" | "desc";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: "text" | "select" }[] = [
  { key: "srNo", label: "Sr No", filter: "text" },
  { key: "company", label: "Insurance Company", filter: "text" },
  { key: "plan", label: "Insurance Plan", filter: "text" },
  { key: "relation", label: "Patient Relation With Policy Holder", filter: "select" },
  { key: "dob", label: "DOB", filter: "text" },
  { key: "policyHolderId", label: "Policy Holder Member Id", filter: "text" },
  { key: "dependentId", label: "Dependent Member Id", filter: "text" },
  { key: "lastName", label: "Policy Holder Last Name", filter: "text" },
  { key: "firstName", label: "Policy Holder First Name", filter: "text" },
  { key: "policyType", label: "Policy Type", filter: "select" },
  { key: "addpCategory", label: "ADDP Plan Category", filter: "text" },
  { key: "eligibility", label: "Eligibility Status", filter: "select" },
  { key: "isActive", label: "Is Active?", filter: "select" },
  { key: "network", label: "In/Out Network Status", filter: "select" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

export function PatientInsurancePlansTable() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("srNo");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [rows] = useState(seedPlans);

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      map[col.key] = Array.from(new Set(rows.map((row) => String(row[col.key])).filter(Boolean))).sort();
    });
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    void tick;
    let list = rows.filter((row) => {
      if (q.trim()) {
        const s = q.toLowerCase();
        const hit =
          columns.some((col) => String(row[col.key]).toLowerCase().includes(s)) ||
          row.phone.toLowerCase().includes(s) ||
          row.checkedBy.toLowerCase().includes(s) ||
          row.checkedAt.toLowerCase().includes(s);
        if (!hit) return false;
      }
      for (const col of columns) {
        const f = (filters[col.key] ?? "").trim();
        if (!f) continue;
        const text = String(row[col.key] ?? "");
        if (col.filter === "select") {
          if (text !== f) return false;
        } else if (!text.toLowerCase().includes(f.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "srNo") return sortDir === "asc" ? a.srNo - b.srNo : b.srNo - a.srNo;
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [q, filters, sortKey, sortDir, tick, rows]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const handleExport = () => {
    const headers = [...columns.map((c) => c.label), "Checked By", "Checked At"];
    const exportRows = filtered.map((r) => [
      ...columns.map((col) => String(r[col.key])),
      r.checkedBy,
      r.checkedAt,
    ]);
    exportToExcel("patient-insurance-plans", headers, exportRows, "Insurance Plans");
  };

  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  return (
    <div className="space-y-2">
      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search insurance plans..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onFiltersOpenChange={setFiltersOpen}
        showFilterPanel={false}
        onExport={handleExport}
        exportLabel="Export"
        actions={
          activeFilterCount > 0 ? (
            <button type="button" className="btn" onClick={() => setFilters({})}>
              <FilterX className="w-3 h-3" />
              Clear ({activeFilterCount})
            </button>
          ) : null
        }
      />
      <div className="panel overflow-hidden">
        <div className="table-wrap border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer font-inherit text-inherit hover:text-primary"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      <SortIcon col={col.key} />
                    </button>
                  </th>
                ))}
                <th>Action</th>
              </tr>
              {filtersOpen && (
                <tr className="bg-secondary/80">
                  {columns.map((col) => (
                    <th key={`f-${col.key}`} className="!normal-case !tracking-normal !font-medium !py-1.5">
                      {col.filter === "select" ? (
                        <select
                          value={filters[col.key] ?? ""}
                          onChange={(e) => setFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
                          className={filterInputClass}
                        >
                          <option value="">All</option>
                          {(selectOptions[col.key] ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Search…"
                          value={filters[col.key] ?? ""}
                          onChange={(e) => setFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
                          className={filterInputClass}
                        />
                      )}
                    </th>
                  ))}
                  <th />
                </tr>
              )}
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center text-muted-foreground py-6">
                    No insurance plans found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={`${row.srNo}-${row.policyHolderId}-${row.plan}`}
                    className={row.isActive === "No" ? "bg-rose-50" : undefined}
                  >
                    <td className="text-muted-foreground">{row.srNo}</td>
                    <td className="min-w-[180px]">
                      <div className="font-semibold leading-snug">{row.company}</div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <Phone className="w-3 h-3" /> {row.phone}
                      </span>
                    </td>
                    <td className="min-w-[140px]">{row.plan}</td>
                    <td>{row.relation}</td>
                    <td>{row.dob}</td>
                    <td>{row.policyHolderId}</td>
                    <td>{row.dependentId}</td>
                    <td className="font-semibold">{row.lastName}</td>
                    <td className="font-semibold">{row.firstName}</td>
                    <td>{row.policyType}</td>
                    <td>{row.addpCategory || "—"}</td>
                    <td className="min-w-[160px]">
                      <StatusBadge status={row.eligibility} />
                      <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
                        {row.checkedBy}, {row.checkedAt}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={row.isActive === "Yes" ? "Active" : "Inactive"}>{row.isActive}</StatusBadge>
                    </td>
                    <td>{row.network}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button type="button" className="btn h-6 px-1.5" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="btn h-6 px-1.5" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="btn h-6 px-1.5" title="Rundown Benefit">
                          <ScrollText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
