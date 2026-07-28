import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, FilterX, Pencil } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { exportToExcel } from "@/lib/exportToExcel";

export type CorporationRow = {
  id: string;
  displayName: string;
  dba: string;
  npi: string;
  city: string;
  state: string;
  phone: string;
  effectiveDate: string;
  status: "Active" | "Inactive" | "Draft";
};

const seedCorporations: CorporationRow[] = [
  {
    id: "C-1001",
    displayName: "Bright Smiles Dental Group",
    dba: "Bright Smiles",
    npi: "1234567890",
    city: "Philadelphia",
    state: "Pennsylvania",
    phone: "215-555-0100",
    effectiveDate: "2020-01-15",
    status: "Active",
  },
  {
    id: "C-1002",
    displayName: "City Center Oral Health LLC",
    dba: "City Center Dental",
    npi: "1987654321",
    city: "Camden",
    state: "New Jersey",
    phone: "856-555-0142",
    effectiveDate: "2021-06-01",
    status: "Active",
  },
  {
    id: "C-1003",
    displayName: "Main Street Dentistry PC",
    dba: "Main Street Dental",
    npi: "1122334455",
    city: "Wilmington",
    state: "Delaware",
    phone: "302-555-0199",
    effectiveDate: "2019-03-20",
    status: "Inactive",
  },
  {
    id: "C-1004",
    displayName: "Hart Family Dental Corp",
    dba: "Hart Dental",
    npi: "5566778899",
    city: "Trenton",
    state: "New Jersey",
    phone: "609-555-0111",
    effectiveDate: "2024-09-01",
    status: "Draft",
  },
  {
    id: "C-1005",
    displayName: "Southside Smiles Inc",
    dba: "Southside Smiles",
    npi: "6677889900",
    city: "Philadelphia",
    state: "Pennsylvania",
    phone: "215-555-0177",
    effectiveDate: "2022-11-12",
    status: "Active",
  },
];

type SortKey = keyof Pick<
  CorporationRow,
  "displayName" | "dba" | "npi" | "city" | "state" | "phone" | "effectiveDate" | "status" | "id"
>;

type SortDir = "asc" | "desc";
type ColumnFilterType = "text" | "select" | "date";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: ColumnFilterType }[] = [
  { key: "id", label: "ID", filter: "text" },
  { key: "displayName", label: "Display Name", filter: "text" },
  { key: "dba", label: "DBA / Brand", filter: "text" },
  { key: "npi", label: "NPI", filter: "text" },
  { key: "city", label: "City", filter: "text" },
  { key: "state", label: "State", filter: "select" },
  { key: "phone", label: "Phone", filter: "text" },
  { key: "effectiveDate", label: "Effective Date", filter: "date" },
  { key: "status", label: "Status", filter: "select" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ManageCorporationPanel({ onAdd }: { onAdd?: () => void }) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("displayName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      map[col.key] = Array.from(
        new Set(seedCorporations.map((row) => String(row[col.key])).filter(Boolean))
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
    let list = seedCorporations.filter((row) => {
      if (q.trim()) {
        const s = q.toLowerCase();
        const hit = columns.some((col) => String(row[col.key]).toLowerCase().includes(s));
        if (!hit) return false;
      }

      for (const col of columns) {
        const f = (filters[col.key] ?? "").trim();
        if (!f) continue;
        const text = String(row[col.key] ?? "");

        if (col.filter === "select") {
          if (text !== f) return false;
        } else if (col.filter === "date") {
          if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
            if (text !== f) return false;
          } else if (!text.toLowerCase().includes(f.toLowerCase())) {
            return false;
          }
        } else if (!text.toLowerCase().includes(f.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [q, filters, sortKey, sortDir, tick]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" />
    );
  };

  const handleExport = () => {
    const headers = columns.map((c) => c.label);
    const rows = filtered.map((c) =>
      columns.map((col) => {
        if (col.key === "effectiveDate") return formatDate(c.effectiveDate);
        return c[col.key];
      })
    );
    const stamp = new Date().toISOString().slice(0, 10);
    exportToExcel(`corporations-${stamp}`, headers, rows, "Corporations");
  };

  const renderColumnFilter = (col: (typeof columns)[number]) => {
    if (col.filter === "select") {
      return (
        <select
          value={filters[col.key] ?? ""}
          onChange={(e) => setFilter(col.key, e.target.value)}
          className={filterInputClass}
        >
          <option value="">All</option>
          {(selectOptions[col.key] ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (col.filter === "date") {
      return (
        <input
          type="date"
          value={filters[col.key] ?? ""}
          onChange={(e) => setFilter(col.key, e.target.value)}
          className={filterInputClass}
        />
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
        searchPlaceholder="Search corporations..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onFiltersOpenChange={setFiltersOpen}
        showFilterPanel={false}
        onExport={handleExport}
        exportLabel="Export"
        actions={
          <>
            {activeFilterCount > 0 ? (
              <button type="button" className="btn" onClick={clearColumnFilters} title="Clear column filters">
                <FilterX className="w-3 h-3" />
                Clear ({activeFilterCount})
              </button>
            ) : null}
            {onAdd ? (
              <button type="button" className="btn btn-primary" onClick={onAdd}>
                Add Corporation
              </button>
            ) : null}
          </>
        }
      />

      <div className="table-wrap flex-1 min-h-0">
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
              <th></th>
            </tr>
            {filtersOpen && (
              <tr className="bg-secondary/80">
                {columns.map((col) => (
                  <th key={`f-${col.key}`} className="!normal-case !tracking-normal !font-medium !py-1.5">
                    {renderColumnFilter(col)}
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
                  No corporations match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-muted-foreground">{c.id}</td>
                  <td className="font-semibold">{c.displayName}</td>
                  <td>{c.dba}</td>
                  <td>{c.npi}</td>
                  <td>{c.city}</td>
                  <td>{c.state}</td>
                  <td>{c.phone}</td>
                  <td>{formatDate(c.effectiveDate)}</td>
                  <td>
                    <span
                      className={`badge ${
                        c.status === "Active"
                          ? "bg-accent text-accent-foreground"
                          : c.status === "Draft"
                            ? "bg-secondary text-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn h-6 px-2" title="Edit">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground shrink-0">
        Showing {filtered.length} of {seedCorporations.length} corporations
        {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter(s) active` : ""}
      </p>
    </div>
  );
}
