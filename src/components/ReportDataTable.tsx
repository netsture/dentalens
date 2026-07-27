import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FilterX } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";

export type ColumnFilterType = "text" | "select" | "date" | "number";

export type ReportColumn<T> = {
  key: keyof T & string;
  label: string;
  filter: ColumnFilterType;
  /** For select filters; auto-derived from data if omitted */
  options?: string[];
  /** Render cell value */
  render?: (row: T) => ReactNode;
  /** Value used for filtering/sorting (defaults to row[key]) */
  filterValue?: (row: T) => string | number | null | undefined;
  align?: "left" | "right" | "center";
  width?: string;
};

type FilterState = Record<string, string>;

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function parseLooseDate(value: string): number | null {
  if (!value.trim()) return null;
  // Support "Jul 18", "Nov 19, 2020", ISO, etc.
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.getTime();
  return null;
}

export function ReportDataTable<T extends object>({
  columns,
  data,
  searchPlaceholder = "Search all columns...",
  getRowKey,
}: {
  columns: ReportColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  getRowKey?: (row: T, index: number) => string | number;
}) {
  const [globalQ, setGlobalQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Reset column filters when dataset / columns change (e.g. section switch)
  useEffect(() => {
    setFilters({});
    setGlobalQ("");
  }, [columns, data]);

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      if (col.options?.length) {
        map[col.key] = col.options;
        return;
      }
      const set = new Set<string>();
      data.forEach((row) => {
        const raw = col.filterValue ? col.filterValue(row) : (row as Record<string, unknown>)[col.key];
        const t = cellText(raw).trim();
        if (t) set.add(t);
      });
      map[col.key] = Array.from(set).sort();
    });
    return map;
  }, [columns, data]);

  const filtered = useMemo(() => {
    void tick;
    return data.filter((row) => {
      // Global search across all filterable values
      if (globalQ.trim()) {
        const g = globalQ.toLowerCase();
        const hit = columns.some((col) => {
          const raw = col.filterValue ? col.filterValue(row) : (row as Record<string, unknown>)[col.key];
          return cellText(raw).toLowerCase().includes(g);
        });
        if (!hit) return false;
      }

      // Per-column filters
      for (const col of columns) {
        const f = (filters[col.key] ?? "").trim();
        if (!f) continue;
        const raw = col.filterValue ? col.filterValue(row) : (row as Record<string, unknown>)[col.key];
        const text = cellText(raw);

        if (col.filter === "text") {
          if (!text.toLowerCase().includes(f.toLowerCase())) return false;
        } else if (col.filter === "select") {
          if (text !== f) return false;
        } else if (col.filter === "number") {
          const n = Number(String(raw).replace(/[^0-9.-]/g, ""));
          const qn = Number(f);
          if (!isNaN(qn) && !isNaN(n)) {
            if (n !== qn && !text.toLowerCase().includes(f.toLowerCase())) return false;
          } else if (!text.toLowerCase().includes(f.toLowerCase())) {
            return false;
          }
        } else if (col.filter === "date") {
          // Exact day match when filter is a date input (yyyy-mm-dd),
          // otherwise text contains match for display dates.
          if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
            const filterTs = new Date(f).setHours(0, 0, 0, 0);
            const rowTs = parseLooseDate(text);
            if (rowTs == null) return false;
            const rowDay = new Date(rowTs).setHours(0, 0, 0, 0);
            if (rowDay !== filterTs) return false;
          } else if (!text.toLowerCase().includes(f.toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });
  }, [data, columns, filters, globalQ, tick]);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearColumnFilters = () => setFilters({});

  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <TableToolbar
        search={globalQ}
        onSearchChange={setGlobalQ}
        searchPlaceholder={searchPlaceholder}
        onFiltersOpenChange={setFiltersOpen}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setTick((t) => t + 1);
            setRefreshing(false);
          }, 400);
        }}
        refreshing={refreshing}
        filterContent={
          <div className="flex flex-wrap gap-3">
            {columns.map((col) => (
              <div key={col.key} className="field min-w-[140px] max-w-[200px]">
                <label>{col.label}</label>
                {col.filter === "select" ? (
                  <select
                    value={filters[col.key] ?? ""}
                    onChange={(e) => setFilter(col.key, e.target.value)}
                  >
                    <option value="">All</option>
                    {(selectOptions[col.key] ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : col.filter === "date" ? (
                  <input
                    type="date"
                    value={filters[col.key] ?? ""}
                    onChange={(e) => setFilter(col.key, e.target.value)}
                  />
                ) : col.filter === "number" ? (
                  <input
                    type="number"
                    placeholder={`Filter ${col.label.toLowerCase()}...`}
                    value={filters[col.key] ?? ""}
                    onChange={(e) => setFilter(col.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={`Filter ${col.label.toLowerCase()}...`}
                    value={filters[col.key] ?? ""}
                    onChange={(e) => setFilter(col.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        }
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
                  <th
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align ?? "left" }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
              {/* Column filters only when this page's Filter panel is open */}
              {filtersOpen && (
              <tr className="bg-secondary/80">
                {columns.map((col) => (
                  <th key={`f-${col.key}`} className="!normal-case !tracking-normal !font-medium !py-1.5">
                    {col.filter === "select" ? (
                      <select
                        value={filters[col.key] ?? ""}
                        onChange={(e) => setFilter(col.key, e.target.value)}
                        className="w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium"
                      >
                        <option value="">All</option>
                        {(selectOptions[col.key] ?? []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : col.filter === "date" ? (
                      <input
                        type="date"
                        value={filters[col.key] ?? ""}
                        onChange={(e) => setFilter(col.key, e.target.value)}
                        className="w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary"
                      />
                    ) : col.filter === "number" ? (
                      <input
                        type="number"
                        placeholder="…"
                        value={filters[col.key] ?? ""}
                        onChange={(e) => setFilter(col.key, e.target.value)}
                        className="w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Search…"
                        value={filters[col.key] ?? ""}
                        onChange={(e) => setFilter(col.key, e.target.value)}
                        className="w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary"
                      />
                    )}
                  </th>
                ))}
              </tr>
              )}
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No records match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={getRowKey ? getRowKey(row, i) : i}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align ?? "left" }}
                      >
                        {col.render
                          ? col.render(row)
                          : cellText((row as Record<string, unknown>)[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-2 py-1 border-t border-border text-[10px] text-muted-foreground shrink-0">
          Showing {filtered.length} of {data.length} rows
          {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter(s) active` : ""}
        </div>
      </div>
    </div>
  );
}
