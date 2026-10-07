import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  FilterX,
  FolderOpen,
  KeyRound,
  LayoutTemplate,
  ListChecks,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Snowflake,
  Stethoscope,
} from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";
import { exportToExcel } from "@/lib/exportToExcel";
import { getProvider, getProviderSchedule, type DoctorScheduleRow } from "@/lib/providers";

type SortKey = keyof Pick<DoctorScheduleRow, "patientId" | "patientName" | "checkIn" | "chair" | "status">;
type SortDir = "asc" | "desc";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: "text" | "select" }[] = [
  { key: "patientId", label: "Patient ID", filter: "text" },
  { key: "patientName", label: "Patient Name", filter: "text" },
  { key: "checkIn", label: "Time of Check In", filter: "text" },
  { key: "chair", label: "Chair No", filter: "text" },
  { key: "status", label: "Status", filter: "select" },
];

const reportActions = [
  { id: "pending-claims", label: "Office Side Pending Claims", icon: ClipboardList },
  { id: "compliance", label: "Compliance Module", icon: ShieldCheck },
  { id: "compliance-manual", label: "Compliance Manual", icon: BookOpen },
  { id: "implant-report", label: "Implant Patient Report", icon: FileSpreadsheet },
  { id: "recall-list", label: "6 Month Recall List", icon: ListChecks },
  { id: "cold-contact", label: "Cold Contact List", icon: Snowflake },
  { id: "new-layout", label: "New Layout", icon: LayoutTemplate },
];

const officeActions = [
  { id: "search-patient", label: "Search Patient", icon: Search, href: "/patient" },
  { id: "file-closure", label: "File Closure", icon: FolderOpen },
  { id: "password-expected", label: "Password Expected", icon: KeyRound },
  { id: "office-fee", label: "Office Fee Scheduler", icon: FileText },
  { id: "ins-fee", label: "Ins Fee Scheduler", icon: FileSpreadsheet },
  { id: "incomplete-forms", label: "Incomplete Patient Management Forms", icon: ClipboardList },
  { id: "incomplete-psr", label: "Incomplete PSR List", icon: ListChecks },
  { id: "comprehensive", label: "Comprehensive Report", icon: FileSpreadsheet },
];

const viewActions = [
  { id: "odontology", label: "View Odontology" },
  { id: "management", label: "View Management" },
  { id: "preauth-report", label: "View Preauth Report" },
  { id: "ins-claim", label: "View INS Claim Report" },
  { id: "change-password", label: "View Change Password" },
  { id: "expected", label: "View Expected" },
  { id: "daily-ledger", label: "View Daily Ledger" },
  { id: "internal-referral", label: "View Internal Referral" },
  { id: "xray", label: "View XRAY" },
  { id: "back-patient", label: "Back To Patient", href: "/patient" },
];

const rowActions = [
  { id: "realtime", label: "Real Time Action" },
  { id: "tx-comment", label: "Write Tx Comment" },
  { id: "note-day", label: "Note of Day" },
  { id: "msg-verify", label: "Msg from Verify" },
  { id: "find-ins", label: "Find from Insurance" },
  { id: "consent", label: "Consent Form" },
  { id: "checkout", label: "Check Out" },
  { id: "ledger", label: "Account Ledger" },
  { id: "preauth", label: "Preauth" },
  { id: "coding-xr", label: "Coding XR" },
  { id: "perio", label: "Perio Chart" },
  { id: "tx-plan", label: "Tx Plan" },
  { id: "inspire", label: "Inspire" },
  { id: "price", label: "Price Adjust" },
  { id: "chart", label: "Dental Chart" },
  { id: "referrals", label: "Referrals" },
  { id: "special-note", label: "Special Note" },
  { id: "oral-surgery", label: "Oral Surgery" },
  { id: "psr", label: "Incomplete PSR" },
  { id: "behavior", label: "Behavior Mgmt" },
  { id: "erx", label: "DoseSpot eRx" },
  { id: "message", label: "New Message" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

function formatAppointmentDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const [year, month, day] = value.split("-");
  return `${month}-${day}-${year} (${weekday})`;
}

export default function DoctorScreenPage() {
  const { providerId = "" } = useParams();
  const navigate = useNavigate();
  const provider = getProvider(providerId);

  const [appointmentDate, setAppointmentDate] = useState("2026-10-06");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("checkIn");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const schedule = useMemo(() => (provider ? getProviderSchedule(provider.id) : []), [provider]);

  const selectOptions = useMemo(() => {
    return Array.from(new Set(schedule.map((row) => row.status))).sort();
  }, [schedule]);

  const filtered = useMemo(() => {
    void tick;
    let list = schedule.filter((row) => {
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
  }, [q, filters, sortKey, sortDir, tick, schedule]);

  if (!provider) return <Navigate to="/provider" replace />;

  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

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
    const rows = filtered.map((r) => columns.map((col) => String(r[col.key])));
    exportToExcel(`doctor-schedule-${provider.id}`, headers, rows, "Schedule");
  };

  const runTool = (id: string, href?: string) => {
    if (href) {
      navigate(href);
      return;
    }
    setActiveTool(id);
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link to="/provider" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary mb-1">
            <ArrowLeft className="w-3 h-3" /> Active providers
          </Link>
          <h1 className="text-[16px] font-bold flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            Welcome {provider.name}
          </h1>
          <p className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
            <span>{provider.type}</span>
            <span>·</span>
            <span>Number of patients: {provider.patientCount}</span>
            <span>·</span>
            <span>NPI: {provider.npi}</span>
            <StatusBadge status={provider.status} />
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Reports and compliance</div>
        </div>
        <div className="p-2 flex flex-wrap gap-1.5">
          {reportActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className={`btn ${activeTool === action.id ? "btn-primary" : ""}`}
                onClick={() => runTool(action.id)}
              >
                <Icon className="w-3.5 h-3.5" /> {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Office tools</div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Appointment date</label>
            <input
              type="date"
              className="h-7 px-2 text-[11px] border border-border rounded-[3px] bg-background outline-none focus:border-primary"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
            <span className="text-[11px] text-muted-foreground">{formatAppointmentDate(appointmentDate)}</span>
          </div>
        </div>
        <div className="p-2 flex flex-wrap gap-1.5">
          {officeActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className={`btn ${activeTool === action.id ? "btn-primary" : ""}`}
                onClick={() => runTool(action.id, action.href)}
              >
                <Icon className="w-3.5 h-3.5" /> {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Quick views</div>
        </div>
        <div className="p-2 flex flex-wrap gap-1.5">
          {viewActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`btn ${activeTool === action.id ? "btn-primary" : ""}`}
              onClick={() => runTool(action.id, action.href)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {activeTool && (
        <div className="panel px-3 py-2 text-[12px] flex items-center justify-between gap-2">
          <span>
            Opened <span className="font-semibold">{[...reportActions, ...officeActions, ...viewActions].find((a) => a.id === activeTool)?.label}</span>
            {" "}for {provider.name}.
          </span>
          <button type="button" className="btn" onClick={() => setActiveTool(null)}>
            Close
          </button>
        </div>
      )}

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search today's patients..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onFiltersOpenChange={setFiltersOpen}
        showFilterPanel={false}
        onExport={handleExport}
        exportLabel="Export"
        actions={
          activeFilterCount > 0 ? (
            <button type="button" className="btn" onClick={() => setFilters({})} title="Clear column filters">
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
                {rowActions.map((action) => (
                  <th key={action.id} className="text-center">{action.label}</th>
                ))}
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
                          {selectOptions.map((opt) => (
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
                  <th colSpan={rowActions.length} />
                </tr>
              )}
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + rowActions.length} className="text-center text-muted-foreground py-6">
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold text-muted-foreground">#{row.patientId}</td>
                    <td className="font-semibold">{row.patientName}</td>
                    <td>{row.checkIn}</td>
                    <td>{row.chair}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    {rowActions.map((action) => (
                      <td key={action.id} className="text-center">
                        <button
                          type="button"
                          className="btn h-6 px-1.5"
                          title={action.label}
                          onClick={() => setActiveTool(action.id)}
                        >
                          {action.id === "message" ? (
                            <MessageSquare className="w-3 h-3" />
                          ) : action.id === "find-ins" ? (
                            <Phone className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                    ))}
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
