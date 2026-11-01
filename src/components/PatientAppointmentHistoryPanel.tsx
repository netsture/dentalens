import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, FilterX } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";
import { exportToExcel } from "@/lib/exportToExcel";
import { getAppointmentsByPatientId, type PatientAppointmentRow } from "@/lib/patientAppointments";

type AppointmentRow = PatientAppointmentRow;
type SortKey = keyof Omit<AppointmentRow, "id" | "patientId">;
type SortDir = "asc" | "desc";
type ColumnFilterType = "text" | "select";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: ColumnFilterType }[] = [
  { key: "office", label: "Office", filter: "select" },
  { key: "apptDate", label: "Appt. Date", filter: "text" },
  { key: "time", label: "Time of Apt", filter: "text" },
  { key: "provider", label: "Doctor/Provider", filter: "text" },
  { key: "speciality", label: "Speciality", filter: "select" },
  { key: "aptColumn", label: "Apt Column", filter: "text" },
  { key: "todaysTx", label: "Today's Tx", filter: "text" },
  { key: "remarks", label: "Apt Remarks", filter: "text" },
  { key: "status", label: "Status", filter: "select" },
  { key: "createdBy", label: "Created By", filter: "select" },
  { key: "updatedBy", label: "Updated By", filter: "select" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

function dateValue(value: string) {
  const match = /^(\d{2})-(\d{2})-(\d{4})/.exec(value.trim());
  if (!match) return 0;
  return Date.parse(`${match[3]}-${match[1]}-${match[2]}`);
}

function sortValue(row: AppointmentRow, key: SortKey) {
  if (key === "apptDate" || key === "createdAt" || key === "updatedAt") return dateValue(row[key]);
  if (key === "createdBy") return `${row.createdBy} ${row.createdAt}`.toLowerCase();
  if (key === "updatedBy") return `${row.updatedBy} ${row.updatedAt}`.toLowerCase();
  return String(row[key] ?? "").toLowerCase();
}

function userStamp(name: string, when: string) {
  return (
    <div>
      <div>{name}</div>
      <div className="text-[10px] text-muted-foreground">({when})</div>
    </div>
  );
}

export function PatientAppointmentHistoryPanel({ patientId }: { patientId: string }) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("apptDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const appointments = useMemo(() => getAppointmentsByPatientId(patientId), [patientId]);

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      map[col.key] = Array.from(new Set(appointments.map((row) => String(row[col.key] ?? "")).filter(Boolean))).sort();
    });
    return map;
  }, [appointments]);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearColumnFilters = () => setFilters({});
  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  const filtered = useMemo(() => {
    void tick;
    let list = appointments.filter((row) => {
      if (q.trim()) {
        const s = q.toLowerCase();
        const hay = [
          row.office,
          row.apptDate,
          row.time,
          row.provider,
          row.speciality,
          row.aptColumn,
          row.todaysTx,
          row.remarks,
          row.status,
          row.createdBy,
          row.createdAt,
          row.updatedBy,
          row.updatedAt,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(s)) return false;
      }
      for (const col of columns) {
        const f = (filters[col.key] ?? "").trim();
        if (!f) continue;
        const text =
          col.key === "createdBy"
            ? `${row.createdBy} ${row.createdAt}`
            : col.key === "updatedBy"
              ? `${row.updatedBy} ${row.updatedAt}`
              : String(row[col.key] ?? "");
        if (col.filter === "select") {
          if (String(row[col.key] ?? "") !== f) return false;
        } else if (!text.toLowerCase().includes(f.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [appointments, q, filters, sortKey, sortDir, tick]);

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
    const headers = columns.map((c) => c.label);
    const rows = filtered.map((row) =>
      columns.map((col) => {
        if (col.key === "createdBy") return `${row.createdBy} (${row.createdAt})`;
        if (col.key === "updatedBy") return `${row.updatedBy} (${row.updatedAt})`;
        return row[col.key] ?? "";
      })
    );
    exportToExcel(`appointment-history-${patientId}-${new Date().toISOString().slice(0, 10)}`, headers, rows, "Appointment History");
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

  const cell = (row: AppointmentRow, key: SortKey) => {
    if (key === "status") return <StatusBadge status={row.status} />;
    if (key === "createdBy") return userStamp(row.createdBy, row.createdAt);
    if (key === "updatedBy") return userStamp(row.updatedBy, row.updatedAt);
    return row[key] || "—";
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search appointments..."
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

      <div className="table-wrap flex-1 min-h-0 bg-card">
        <table className="data-table min-w-[1280px] [&_tbody_td]:bg-card [&_tbody_tr:hover_td]:bg-card">
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
                  {appointments.length === 0
                    ? "No appointment history for this patient."
                    : "No appointments match the current filters."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.key === "office" || col.key === "provider" ? "whitespace-nowrap font-semibold" : ""} ${
                        col.key === "remarks" ? "min-w-[140px]" : ""
                      }`}
                    >
                      {cell(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground shrink-0">
        Total {filtered.length} result{filtered.length === 1 ? "" : "s"}
        {filtered.length !== appointments.length ? ` · ${appointments.length} total` : ""}
        {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter(s) active` : ""}
      </p>
    </div>
  );
}
