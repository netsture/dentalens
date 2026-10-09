import { Fragment, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Banknote,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Columns3,
  FilterX,
  FolderOpen,
  NotebookPen,
  Phone,
  Pill,
  Printer,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";
import { exportToExcel } from "@/lib/exportToExcel";
import { getProvider, getProviderSchedule, type DoctorScheduleRow } from "@/lib/providers";

type SortKey = keyof Pick<
  DoctorScheduleRow,
  "no" | "patientId" | "patientName" | "checkIn" | "chair" | "status" | "realtimeAction" | "examTx" | "eodVerify" | "insurance"
>;
type SortDir = "asc" | "desc";
type FilterState = Record<string, string>;

type DataColumn = { kind: "data"; key: SortKey; label: string; filter: "text" | "select" };
type ActionColumn = { kind: "action"; key: string; label: string; links?: string[] };
type TableColumn = DataColumn | ActionColumn;

const tableColumns: TableColumn[] = [
  { kind: "data", key: "no", label: "No", filter: "text" },
  { kind: "data", key: "patientId", label: "Pt ID / Change Doc", filter: "text" },
  { kind: "data", key: "patientName", label: "Patient Name", filter: "text" },
  { kind: "data", key: "checkIn", label: "Time Of Check-In", filter: "text" },
  { kind: "data", key: "chair", label: "Chair No", filter: "text" },
  { kind: "data", key: "status", label: "Status", filter: "select" },
  { kind: "data", key: "realtimeAction", label: "Real Time Action Entry", filter: "text" },
  { kind: "data", key: "examTx", label: "New Ex/Tx", filter: "text" },
  { kind: "action", key: "txNote", label: "Write Tx Note", links: ["Create/View Tx Notes"] },
  { kind: "data", key: "eodVerify", label: "End Of Day Verify", filter: "text" },
  { kind: "data", key: "insurance", label: "Insurance", filter: "text" },
  { kind: "action", key: "consent", label: "Patient Consent Form", links: ["Print Form", "eForm", "Assign Form"] },
  { kind: "action", key: "rx", label: "Create RX (Print)", links: ["Create RX", "View RX"] },
  { kind: "action", key: "perio", label: "Perio Chart", links: ["Create", "View", "Print"] },
  { kind: "action", key: "newTxPlan", label: "View New Tx Plan", links: ["View"] },
  { kind: "action", key: "oldTxPlan", label: "View Old Tx Plan", links: ["View", "View Old Notes"] },
  { kind: "action", key: "insHistory", label: "View Ins/Prev History", links: ["View"] },
  { kind: "action", key: "dentalChart", label: "Dental Chart", links: ["Create", "View"] },
  { kind: "action", key: "caries", label: "Caries Risk", links: ["Create", "View"] },
  { kind: "action", key: "referrals", label: "Enter Referrals", links: ["Enter", "View"] },
  { kind: "action", key: "specialNote", label: "View Special Note", links: ["View/Enter"] },
  { kind: "action", key: "oralPreauth", label: "Oral Surgery Preauth Note", links: ["Create", "View"] },
  { kind: "action", key: "oralIns", label: "Oral Surgery Ins/Ext Note" },
  { kind: "action", key: "behavior", label: "Behavior Mgmt", links: ["Create", "View"] },
  { kind: "action", key: "rowAction", label: "Action", links: ["••"] },
];

const dataColumns = tableColumns.filter((col): col is DataColumn => col.kind === "data");

function columnFilterText(row: DoctorScheduleRow, col: TableColumn): string {
  if (col.kind === "data") {
    const extra =
      col.key === "patientName"
        ? ` ${row.gender} ${row.dob} ${row.age}`
        : col.key === "insurance" && row.insuranceDetail
          ? ` ${row.insuranceDetail}`
          : "";
    return `${row[col.key] ?? ""}${extra}`;
  }
  if (col.key === "oralIns") return row.oralSurgeryIns || "NA";
  if (col.key === "rowAction") return "action more";
  return (col.links ?? []).join(" ");
}

type MenuAction = {
  id: string;
  label: string;
  href?: string;
  danger?: boolean;
};

type MenuSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "green" | "purple" | "orange";
  actions: MenuAction[];
};

const menuSections: MenuSection[] = [
  {
    id: "clinical",
    title: "Clinical",
    subtitle: "Patient Care, Clinical Records & Treatment",
    icon: Stethoscope,
    tone: "blue",
    actions: [
      { id: "odontology", label: "View Odontogram" },
      { id: "ins-claim", label: "INS Claim Report" },
      { id: "preauth-report", label: "Preauth Report" },
      { id: "view-appointment", label: "View Appointment", href: "/appointment/book" },
      { id: "internal-referral", label: "View Internal Referrals" },
      { id: "search-patient", label: "Search Patient", href: "/patient" },
      { id: "upload-xray", label: "Upload XRAY" },
    ],
  },
  {
    id: "financial",
    title: "Financial",
    subtitle: "Payments, Fees, Insurance & Ledger",
    icon: Banknote,
    tone: "green",
    actions: [
      { id: "view-insurance", label: "View Insurance", href: "/patient/insurance" },
      { id: "office-fee", label: "Office Fees Scheduler" },
      { id: "ins-fee", label: "Ins Fees Scheduler" },
      { id: "estimates-expected", label: "Estimates Expected" },
      { id: "pending-claims", label: "Office Side Pending Claims", danger: true },
    ],
  },
  {
    id: "doc-activity",
    title: "Doc. Activity",
    subtitle: "Doctor Tasks, Follow-up & Pending Items",
    icon: ClipboardList,
    tone: "purple",
    actions: [
      { id: "daily-procedure", label: "DAILY PROCEDURE / CODING" },
      { id: "recall-list", label: "6 Month Recall List" },
      { id: "cold-contact", label: "Cold Contact List" },
      { id: "incomplete-forms", label: "Incomplete Patient Behavior Management Forms" },
      { id: "incomplete-psr", label: "Incomplete PSR List" },
      { id: "legal-review", label: "Legal Document Review & Approve", danger: true },
    ],
  },
  {
    id: "misc",
    title: "Miscellaneous",
    subtitle: "Admin, Compliance & Support Tools",
    icon: ShieldCheck,
    tone: "orange",
    actions: [
      { id: "change-password", label: "Change Password" },
      { id: "compliance", label: "Compliance Module" },
      { id: "compliance-manual", label: "Compliance Manual" },
      { id: "implant-report", label: "Implant Patient Report" },
      { id: "comprehensive", label: "Comprehensive Report" },
    ],
  },
];

const allMenuActions = menuSections.flatMap((section) => section.actions);

const sectionTone: Record<MenuSection["tone"], { card: string; title: string; icon: string; chip: string }> = {
  blue: {
    card: "border-sky-300 bg-sky-50/70",
    title: "text-sky-700",
    icon: "text-sky-600",
    chip: "border-sky-200 bg-white text-sky-800 hover:bg-sky-100",
  },
  green: {
    card: "border-emerald-300 bg-emerald-50/70",
    title: "text-emerald-700",
    icon: "text-emerald-600",
    chip: "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100",
  },
  purple: {
    card: "border-violet-300 bg-violet-50/70",
    title: "text-violet-700",
    icon: "text-violet-600",
    chip: "border-violet-200 bg-white text-violet-800 hover:bg-violet-100",
  },
  orange: {
    card: "border-orange-300 bg-orange-50/70",
    title: "text-orange-700",
    icon: "text-orange-600",
    chip: "border-orange-200 bg-white text-orange-800 hover:bg-orange-100",
  },
};

const rowActionIcons = [
  { id: "call", label: "Call Patient", icon: Phone },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "print", label: "Print", icon: Printer },
  { id: "chart", label: "Patient Chart", icon: UserRound },
  { id: "erx", label: "eRx", icon: Pill },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "diary", label: "Diary", icon: NotebookPen },
];

function ActionLinks({
  items,
  onPick,
}: {
  items: string[];
  onPick: (label: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          title={item}
          className={`bg-transparent border-none cursor-pointer px-0 text-[10px] leading-tight whitespace-nowrap ${
            item === "View Old Notes"
              ? "text-orange-600 font-semibold hover:underline"
              : item === "eForm"
                ? "text-emerald-700 font-semibold hover:underline"
                : "text-primary hover:underline"
          }`}
          onClick={() => onPick(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

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
  const [actionTray, setActionTray] = useState<{ id: string; side: "left" | "right" } | null>(null);
  const [hiddenCols, setHiddenCols] = useState<string[]>([
    "caries",
    "referrals",
    "specialNote",
    "oralPreauth",
    "oralIns",
    "behavior",
  ]);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const schedule = useMemo(() => (provider ? getProviderSchedule(provider.id) : []), [provider]);

  const visibleColumns = useMemo(
    () => tableColumns.filter((col) => !hiddenCols.includes(col.key)),
    [hiddenCols]
  );

  useEffect(() => {
    if (!columnsOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!columnsMenuRef.current?.contains(event.target as Node)) setColumnsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [columnsOpen]);

  const toggleColumn = (key: string) => {
    setHiddenCols((prev) => {
      if (prev.includes(key)) return prev.filter((item) => item !== key);
      if (prev.length >= tableColumns.length - 1) return prev;
      return [...prev, key];
    });
  };

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    dataColumns.forEach((col) => {
      if (col.filter !== "select") return;
      map[col.key] = Array.from(new Set(schedule.map((row) => String(row[col.key] ?? "")).filter(Boolean))).sort();
    });
    return map;
  }, [schedule]);

  const filtered = useMemo(() => {
    void tick;
    let list = schedule.filter((row) => {
      if (q.trim()) {
        const s = q.toLowerCase();
        const hit = tableColumns.some((col) => columnFilterText(row, col).toLowerCase().includes(s));
        if (!hit) return false;
      }
      for (const col of tableColumns) {
        const f = (filters[col.key] ?? "").trim();
        if (!f) continue;
        const text = columnFilterText(row, col);
        if (col.kind === "data" && col.filter === "select") {
          if (text !== f) return false;
        } else if (!text.toLowerCase().includes(f.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "no") {
        return sortDir === "asc" ? a.no - b.no : b.no - a.no;
      }
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
    const exportCols = visibleColumns.filter((col): col is DataColumn => col.kind === "data");
    const headers = exportCols.map((c) => c.label);
    const rows = filtered.map((r) => exportCols.map((col) => String(r[col.key])));
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
      <div className="flex items-center gap-4 flex-wrap">
        <div className="shrink-0">
          <Link to="/provider" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary mb-0.5">
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

        <div className="flex-1 flex justify-center min-w-[280px]">
          <div className="panel px-4 py-2 inline-flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-primary shrink-0" />
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Appointment Date
            </label>
            <input
              type="date"
              className="h-8 px-2 text-[12px] border border-border rounded-[3px] bg-background outline-none focus:border-primary"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
            <span className="text-[12px] text-foreground font-medium whitespace-nowrap">
              {formatAppointmentDate(appointmentDate)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`btn shrink-0 ${menuOpen ? "btn-primary" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          title={menuOpen ? "Hide menu sections" : "Show menu sections"}
        >
          {menuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {menuOpen ? "Hide menus" : "Show menus"}
        </button>
      </div>

      {menuOpen ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
        {menuSections.map((section) => {
          const Icon = section.icon;
          const tone = sectionTone[section.tone];
          return (
            <div key={section.id} className={`rounded-[6px] border p-2.5 flex flex-col gap-2 min-h-0 ${tone.card}`}>
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone.icon}`} />
                <div className="min-w-0">
                  <div className={`text-[13px] font-bold leading-tight ${tone.title}`}>{section.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug">{section.subtitle}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {section.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`h-7 px-2 rounded-full border text-[10px] font-medium cursor-pointer inline-flex items-center ${
                      action.danger
                        ? "border-red-400 bg-white text-red-600 hover:bg-red-50"
                        : activeTool === action.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : tone.chip
                    }`}
                    onClick={() => runTool(action.id, action.href)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      ) : null}

      {activeTool && (
        <div className="panel px-3 py-2 text-[12px] flex items-center justify-between gap-2">
          <span>
            Opened{" "}
            <span className="font-semibold">
              {allMenuActions.find((a) => a.id === activeTool)?.label ??
                rowActionIcons.find((a) => `row-action:${a.id}` === activeTool)?.label ??
                activeTool}
            </span>
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
          <>
            <div className="relative" ref={columnsMenuRef}>
              <button
                type="button"
                className={`btn ${columnsOpen ? "btn-primary" : ""}`}
                onClick={() => setColumnsOpen((open) => !open)}
                title="Show or hide columns"
              >
                <Columns3 className="w-3 h-3" />
                Columns
                {hiddenCols.length > 0 ? ` (${hiddenCols.length} hidden)` : ""}
              </button>
              {columnsOpen ? (
                <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-[260px] max-h-[320px] overflow-auto panel p-2 shadow-sm bg-card">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Show / hide</div>
                    <div className="flex gap-1">
                      <button type="button" className="btn h-6 px-2" onClick={() => setHiddenCols([])}>
                        Show all
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {tableColumns.map((col) => {
                      const checked = !hiddenCols.includes(col.key);
                      const lastVisible = checked && visibleColumns.length === 1;
                      return (
                        <label
                          key={col.key}
                          className="flex items-center gap-2 px-1.5 py-1 rounded-[3px] hover:bg-secondary cursor-pointer text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={lastVisible}
                            onChange={() => toggleColumn(col.key)}
                          />
                          <span className="leading-snug">{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            {activeFilterCount > 0 ? (
              <button type="button" className="btn" onClick={() => setFilters({})} title="Clear column filters">
                <FilterX className="w-3 h-3" />
                Clear ({activeFilterCount})
              </button>
            ) : null}
          </>
        }
      />

      <div className="panel flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="table-wrap flex-1 border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`!whitespace-normal leading-tight max-w-[90px] ${col.kind === "action" ? "text-center" : ""}`}
                  >
                    {col.kind === "data" ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer font-inherit text-inherit hover:text-primary text-left"
                        onClick={() => toggleSort(col.key)}
                      >
                        {col.label}
                        <SortIcon col={col.key} />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
              {filtersOpen && (
                <tr className="bg-secondary/80">
                  {visibleColumns.map((col) => (
                    <th key={`f-${col.key}`} className="!normal-case !tracking-normal !font-medium !py-1.5">
                      {col.kind === "data" && col.filter === "select" ? (
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
                </tr>
              )}
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="text-center text-muted-foreground py-6">
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <Fragment key={row.id}>
                  <tr>
                    {visibleColumns.map((col) => {
                      if (col.kind === "action") {
                        if (col.key === "rowAction") {
                          const open = actionTray?.id === row.id && actionTray.side === "right";
                          return (
                            <td key={col.key} className="text-center align-top">
                              <button
                                type="button"
                                title="More actions"
                                className={`bg-transparent border-none cursor-pointer font-bold text-[14px] tracking-[0.2em] px-1 ${
                                  open ? "text-primary" : "text-muted-foreground hover:text-primary"
                                }`}
                                onClick={() =>
                                  setActionTray((current) =>
                                    current?.id === row.id && current.side === "right"
                                      ? null
                                      : { id: row.id, side: "right" }
                                  )
                                }
                              >
                                ••
                              </button>
                            </td>
                          );
                        }
                        const links =
                          col.key === "oralIns"
                            ? [row.oralSurgeryIns || "NA"]
                            : col.links ?? [];
                        return (
                          <td key={col.key} className="text-center align-top">
                            <ActionLinks items={links} onPick={(label) => setActiveTool(`${col.key}:${label}`)} />
                          </td>
                        );
                      }

                      if (col.key === "no") {
                        const open = actionTray?.id === row.id && actionTray.side === "left";
                        return (
                          <td key={col.key} className="font-semibold text-muted-foreground align-top">
                            <div>{row.no}</div>
                            <button
                              type="button"
                              title="More actions"
                              className={`bg-transparent border-none cursor-pointer font-bold text-[14px] tracking-[0.2em] px-1 ${
                                open ? "text-primary" : "text-muted-foreground hover:text-primary"
                              }`}
                              onClick={() =>
                                setActionTray((current) =>
                                  current?.id === row.id && current.side === "left"
                                    ? null
                                    : { id: row.id, side: "left" }
                                )
                              }
                            >
                              ••
                            </button>
                          </td>
                        );
                      }

                      if (col.key === "patientId") {
                        return (
                          <td key={col.key} className="align-top">
                            <div className="font-semibold text-primary">{row.patientId}</div>
                            <button
                              type="button"
                              className="mt-1 text-[10px] text-primary bg-transparent border-none p-0 cursor-pointer hover:underline"
                              onClick={() => setActiveTool("todays-procedures")}
                            >
                              Today's Procedures
                            </button>
                          </td>
                        );
                      }

                      if (col.key === "patientName") {
                        return (
                          <td key={col.key} className="align-top min-w-[140px]">
                            <div className="flex items-start gap-1">
                              {row.alert ? <TriangleAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> : null}
                              <div>
                                <div className="font-semibold leading-tight">{row.patientName}</div>
                                <div className="text-[10px] text-muted-foreground uppercase">{row.gender}</div>
                                <div className="text-[10px] text-muted-foreground">{row.dob}</div>
                                <div className="text-[10px] text-muted-foreground">[{row.age}]</div>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      if (col.key === "status") {
                        return (
                          <td key={col.key} className="align-top">
                            <StatusBadge status={row.status} />
                          </td>
                        );
                      }

                      if (col.key === "insurance") {
                        return (
                          <td key={col.key} className="align-top min-w-[130px]">
                            <div className="text-[11px] leading-snug">{row.insurance}</div>
                            {row.insuranceDetail ? (
                              <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{row.insuranceDetail}</div>
                            ) : null}
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="align-top text-[11px]">
                          {String(row[col.key] ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                  {actionTray?.id === row.id ? (
                    <tr>
                      <td colSpan={visibleColumns.length} className="bg-secondary/50">
                        <div
                          className={`flex items-center gap-1.5 py-1 ${
                            actionTray.side === "right" ? "justify-end pr-1" : "pl-1"
                          }`}
                        >
                          {rowActionIcons.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.id}
                                type="button"
                                title={action.label}
                                className="w-7 h-7 rounded-full border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 cursor-pointer inline-flex items-center justify-center"
                                onClick={() => setActiveTool(`row-action:${action.id}`)}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
