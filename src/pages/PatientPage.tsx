import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
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
import { StatusBadge } from "@/components/StatusBadge";

const seedPatients = [
  { id: "16665", name: "Denise Wingard", firstName: "Denise", lastName: "Wingard", phone: "215-555-0142", dob: "03-12-1984", insuranceId: "INS16665", ssNo: "SS-16665", balance: "$948.80", lastVisit: "Dec 10, 2020", status: "Active" },
  { id: "17001", name: "JOHNSONN ELLA", firstName: "ELLA", lastName: "JOHNSONN", phone: "484-903-7236", dob: "02-27-2012", insuranceId: "", ssNo: "", balance: "$0.00", lastVisit: "Today", status: "Active" },
  { id: "17002", name: "BRAKE ZOIEY", firstName: "ZOIEY", lastName: "BRAKE", phone: "201-616-6586", dob: "08-28-2012", insuranceId: "", ssNo: "", balance: "$120.00", lastVisit: "Today", status: "Active" },
  { id: "17003", name: "MCNUTT PHEONIX", firstName: "PHEONIX", lastName: "MCNUTT", phone: "484-597-1934", dob: "02-19-2012", insuranceId: "", ssNo: "", balance: "$45.00", lastVisit: "Today", status: "Active" },
  { id: "17004", name: "CURRY NEVAEH", firstName: "NEVAEH", lastName: "CURRY", phone: "484-554-6555", dob: "02-15-2005", insuranceId: "", ssNo: "", balance: "$0.00", lastVisit: "Yesterday", status: "New" },
  { id: "17005", name: "DELGADO GENESIS", firstName: "GENESIS", lastName: "DELGADO", phone: "862-247-7212", dob: "03-03-2010", insuranceId: "", ssNo: "", balance: "$210.00", lastVisit: "Today", status: "Active" },
  { id: "17006", name: "BALSECA SAMUEL", firstName: "SAMUEL", lastName: "BALSECA", phone: "201-552-0729", dob: "05-12-2009", insuranceId: "INS17006", ssNo: "SS-17006", balance: "$0.00", lastVisit: "Today", status: "New" },
  { id: "17007", name: "ESCOBAR TEJADA DARA", firstName: "DARA", lastName: "ESCOBAR TEJADA", phone: "484-375-5283", dob: "02-01-2013", insuranceId: "", ssNo: "", balance: "$75.00", lastVisit: "Today", status: "Inactive" },
];

type AdvancedSearch = {
  patientId: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  insuranceId: string;
  ssNo: string;
};

const emptyAdvancedSearch: AdvancedSearch = {
  patientId: "",
  firstName: "",
  lastName: "",
  phone: "",
  dob: "",
  insuranceId: "",
  ssNo: "",
};

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function SearchField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex items-center gap-2 min-w-0">
      <span className="w-[104px] shrink-0 text-[11px] font-medium text-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 h-7 px-2 border border-border rounded-[3px] bg-background text-foreground text-[12px] outline-none focus:border-primary"
      />
    </label>
  );
}

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
  const [searchForm, setSearchForm] = useState<AdvancedSearch>(emptyAdvancedSearch);
  const [appliedSearch, setAppliedSearch] = useState<AdvancedSearch>(emptyAdvancedSearch);

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

      const adv = appliedSearch;
      if (adv.patientId.trim() && !row.id.toLowerCase().includes(adv.patientId.trim().toLowerCase())) return false;
      if (adv.firstName.trim() && !row.firstName.toLowerCase().includes(adv.firstName.trim().toLowerCase())) return false;
      if (adv.lastName.trim() && !row.lastName.toLowerCase().includes(adv.lastName.trim().toLowerCase())) return false;
      if (adv.phone.trim()) {
        const needle = digits(adv.phone);
        if (!needle || !digits(row.phone).includes(needle)) return false;
      }
      if (adv.dob.trim() && !row.dob.toLowerCase().includes(adv.dob.trim().toLowerCase())) return false;
      if (adv.insuranceId.trim() && !row.insuranceId.toLowerCase().includes(adv.insuranceId.trim().toLowerCase())) return false;
      if (adv.ssNo.trim() && !row.ssNo.toLowerCase().includes(adv.ssNo.trim().toLowerCase())) return false;

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
  }, [q, filters, sortKey, sortDir, tick, rows, appliedSearch]);

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

  const setSearchField = (key: keyof AdvancedSearch, value: string) => {
    setSearchForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdvancedSearch = (event: FormEvent) => {
    event.preventDefault();
    setAppliedSearch(searchForm);
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
      </div>

      <form className="panel p-3 shrink-0" onSubmit={handleAdvancedSearch}>
        <div className="text-[13px] font-bold text-primary mb-3">Search Patient</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 items-center">
          <SearchField
            label="Patient ID"
            value={searchForm.patientId}
            onChange={(v) => setSearchField("patientId", v)}
            placeholder="Enter Number"
          />
          <SearchField
            label="Phone Number"
            value={searchForm.phone}
            onChange={(v) => setSearchField("phone", v)}
          />
          <SearchField
            label="S# S# No-"
            value={searchForm.ssNo}
            onChange={(v) => setSearchField("ssNo", v)}
            placeholder="Member Id2 (S#S# NO.)"
          />
          <SearchField
            label="First Name"
            value={searchForm.firstName}
            onChange={(v) => setSearchField("firstName", v)}
          />
          <SearchField
            label="DOB"
            value={searchForm.dob}
            onChange={(v) => setSearchField("dob", v)}
          />
          <div className="flex items-center gap-2 min-w-0 md:pl-[112px]">
            <button type="submit" className="btn btn-primary min-w-[88px]">
              Search
            </button>
          </div>
          <SearchField
            label="Last Name"
            value={searchForm.lastName}
            onChange={(v) => setSearchField("lastName", v)}
          />
          <SearchField
            label="Insurance Id"
            value={searchForm.insuranceId}
            onChange={(v) => setSearchField("insuranceId", v)}
            placeholder="Member Id1 (INS ID)"
          />
        </div>
      </form>

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
        <div className="flex justify-end px-2 py-1.5 text-[11px] text-muted-foreground shrink-0 border-b border-border">
          Showing {filtered.length} of {rows.length} records
          {activeFilterCount > 0 ? ` · ${activeFilterCount} column filter(s) active` : ""}
        </div>
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
                <th>Actions</th>
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
                    <td className="font-semibold">
                      <Link
                        to={`/patient/overview?id=${p.id}`}
                        className="text-primary hover:underline"
                        title={`View ${p.name}`}
                      >
                        #{p.id}
                      </Link>
                    </td>
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
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <Link to={`/patient/overview?id=${p.id}`} className="btn h-6 px-2" title={`View ${p.name}`}>
                          <Eye className="w-3 h-3" /> View
                        </Link>
                        <Link to={`/patient/billing?id=${p.id}`} className="btn h-6 px-2">
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
          const parts = displayName.split(/\s+/).filter(Boolean);
          setRows((prev) => [
            {
              id: patient.id,
              name: displayName,
              firstName: parts.length > 1 ? parts[parts.length - 1] : displayName,
              lastName: parts.length > 1 ? parts.slice(0, -1).join(" ") : "",
              phone: "—",
              dob: "01-01-1979",
              insuranceId: "",
              ssNo: "",
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
