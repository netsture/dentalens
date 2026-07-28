import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FilterX,
  Phone,
  Plus,
  UserPlus,
  Wallet,
} from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { AddPatientModal } from "@/components/AddPatientModal";
import { AddInsuranceModal } from "@/components/AddInsuranceModal";
import { exportToExcel } from "@/lib/exportToExcel";

const seedPatients = [
  { id: "16665", name: "Denise Wingard", phone: "215-555-0142", dob: "03-12-1984", balance: "$948.80", lastVisit: "Dec 10, 2020", status: "Active" },
  { id: "17001", name: "JOHNSONN ELLA", phone: "484-903-7236", dob: "02-27-2012", balance: "$0.00", lastVisit: "Today", status: "Active" },
  { id: "17002", name: "BRAKE ZOIEY", phone: "201-616-6586", dob: "08-28-2012", balance: "$120.00", lastVisit: "Today", status: "Active" },
  { id: "17003", name: "MCNUTT PHEONIX", phone: "484-597-1934", dob: "02-19-2012", balance: "$45.00", lastVisit: "Today", status: "Active" },
  { id: "17004", name: "CURRY NEVAEH", phone: "484-554-6555", dob: "02-15-2005", balance: "$0.00", lastVisit: "Yesterday", status: "New" },
  { id: "17005", name: "DELGADO GENESIS", phone: "862-247-7212", dob: "03-03-2010", balance: "$210.00", lastVisit: "Today", status: "Active" },
  { id: "17006", name: "BALSECA SAMUEL", phone: "201-552-0729", dob: "05-12-2009", balance: "$0.00", lastVisit: "Today", status: "New" },
  { id: "17007", name: "ESCOBAR TEJADA DARA", phone: "484-375-5283", dob: "02-01-2013", balance: "$75.00", lastVisit: "Today", status: "Active" },
];

type PatientRow = (typeof seedPatients)[number];
type SortKey = keyof Pick<PatientRow, "id" | "name" | "phone" | "dob" | "lastVisit" | "balance" | "status">;
type SortDir = "asc" | "desc";
type ColumnFilterType = "text" | "select";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: ColumnFilterType }[] = [
  { key: "id", label: "ID", filter: "text" },
  { key: "name", label: "Patient", filter: "text" },
  { key: "phone", label: "Phone", filter: "text" },
  { key: "dob", label: "DOB", filter: "text" },
  { key: "lastVisit", label: "Last Visit", filter: "text" },
  { key: "balance", label: "Balance", filter: "text" },
  { key: "status", label: "Status", filter: "select" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

export default function PatientPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [rows, setRows] = useState<PatientRow[]>(seedPatients);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [insuranceRp, setInsuranceRp] = useState({ id: "1590", name: "Green, Craig" });

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setShowAddPatient(true);
      const next = new URLSearchParams(searchParams);
      next.delete("add");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      map[col.key] = Array.from(new Set(rows.map((row) => String(row[col.key])).filter(Boolean))).sort();
    });
    return map;
  }, [rows]);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearColumnFilters = () => setFilters({});

  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  const filtered = useMemo(() => {
    void tick;
    let list = rows.filter((row) => {
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
    const exportRows = filtered.map((p) => columns.map((col) => p[col.key]));
    const stamp = new Date().toISOString().slice(0, 10);
    exportToExcel(`patients-${stamp}`, headers, exportRows, "Patients");
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

  const openInsurance = (patient: { id: string; name: string }) => {
    setInsuranceRp(patient);
    setShowAddPatient(false);
    setShowAddInsurance(true);
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div>
        <h1 className="text-[16px] font-bold">Patients</h1>
        <p className="text-[11px] text-muted-foreground">
          Showing {filtered.length} of {rows.length} records
          {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter(s) active` : ""}
        </p>
      </div>

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search patients..."
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
            <button type="button" className="btn btn-primary" onClick={() => setShowAddPatient(true)}>
              <UserPlus className="w-3.5 h-3.5" /> Add Patient
            </button>
          </>
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
                    No patients match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-muted-foreground">#{p.id}</td>
                    <td className="font-semibold">{p.name}</td>
                    <td>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {p.phone}
                      </span>
                    </td>
                    <td>{p.dob}</td>
                    <td>{p.lastVisit}</td>
                    <td className={p.balance !== "$0.00" ? "text-destructive font-bold" : ""}>
                      {p.balance}
                    </td>
                    <td>
                      <span className="badge bg-accent text-accent-foreground">{p.status}</span>
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <Link to="/patient/billing" className="btn h-6 px-2">
                          <Wallet className="w-3 h-3" /> Billing
                        </Link>
                        <button type="button" className="btn h-6 px-2">
                          <Plus className="w-3 h-3" /> Appt
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

      <AddPatientModal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onSaved={(patient) => {
          const displayName = patient.name.includes(",")
            ? patient.name.split(",").map((p) => p.trim()).reverse().join(" ")
            : patient.name;
          setRows((prev) => [
            {
              id: patient.id,
              name: displayName,
              phone: "—",
              dob: "01-01-1979",
              balance: "$0.00",
              lastVisit: "—",
              status: "New",
            },
            ...prev,
          ]);
        }}
        onAddInsurance={openInsurance}
      />

      <AddInsuranceModal
        open={showAddInsurance}
        onClose={() => setShowAddInsurance(false)}
        responsibleParty={insuranceRp}
      />
    </div>
  );
}
