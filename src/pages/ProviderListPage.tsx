import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, FilterX } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";
import { exportToExcel } from "@/lib/exportToExcel";
import { providers, type Provider } from "@/lib/providers";

type SortKey = keyof Pick<Provider, "no" | "type" | "name" | "npi" | "patientCount" | "status">;
type SortDir = "asc" | "desc";
type ColumnFilterType = "text" | "select";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: ColumnFilterType }[] = [
  { key: "no", label: "No", filter: "text" },
  { key: "type", label: "Type of Service Provider", filter: "select" },
  { key: "name", label: "Provider Name", filter: "text" },
  { key: "npi", label: "NPI", filter: "text" },
  { key: "patientCount", label: "Patients", filter: "text" },
  { key: "status", label: "Status", filter: "select" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

export default function ProviderListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      map[col.key] = Array.from(new Set(providers.map((row) => String(row[col.key])).filter(Boolean))).sort();
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
    let list = providers.filter((row) => {
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
        } else if (!text.toLowerCase().includes(f.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "no" || sortKey === "patientCount") {
        const av = Number(a[sortKey]);
        const bv = Number(b[sortKey]);
        return sortDir === "asc" ? av - bv : bv - av;
      }
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
    const rows = filtered.map((p) => columns.map((col) => String(p[col.key])));
    const stamp = new Date().toISOString().slice(0, 10);
    exportToExcel(`active-providers-${stamp}`, headers, rows, "Providers");
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
      <div>
        <h1 className="text-[16px] font-bold">Provider</h1>
        <p className="text-[11px] text-muted-foreground">
          List of active providers · Showing {filtered.length} of {providers.length} results
          {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter(s) active` : ""}
        </p>
      </div>

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search providers..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onFiltersOpenChange={setFiltersOpen}
        showFilterPanel={false}
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

      <div className="panel flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="table-wrap flex-1 border-0 rounded-none">
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
                    No providers match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/provider/${p.id}`)}
                  >
                    <td className="font-semibold text-muted-foreground">{p.no}</td>
                    <td>{p.type}</td>
                    <td className="font-semibold">{p.name}</td>
                    <td>{p.npi}</td>
                    <td>{p.patientCount}</td>
                    <td>
                      <StatusBadge status={p.status} />
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
