import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  FilterX,
  MessageSquare,
  Phone,
  Send,
  X,
} from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";
import { exportToExcel } from "@/lib/exportToExcel";

type EligibilityRow = {
  no: number;
  patientId: string;
  name: string;
  note?: string;
  office: string;
  dob: string;
  insurance: string;
  aptDate: string;
  aptTime: string;
  doctor: string;
  specialty: string;
  status: string;
  checkedBy?: string;
  checkedAt?: string;
  tab: "complete" | "temp" | "pending" | "done";
};

const offices = ["LORETTO AVE GD-OS-1044", "ALLENTOWN GD-OS-3000", "OLNEY AVENUE-GD", "DUNCAN", "ORTHO", "MI", "SAAS"];

const extraNames = [
  ["BRAKE ZOIEY", "17002"],
  ["MCNUTT PHEONIX", "17003"],
  ["DELGADO GENESIS", "17005"],
  ["BALSECA SAMUEL", "17006"],
  ["ESCOBAR TEJADA DARA", "17007"],
  ["GARCIA LUIS", "17008"],
  ["PATEL ANIKA", "17009"],
  ["WILLIAMS NOAH", "17010"],
  ["CHEN MEI", "17011"],
  ["BROWN KAYLA", "17012"],
  ["RIVERA SOFIA", "17013"],
  ["THOMAS JAYDEN", "17014"],
];

const extraOffices = offices;
const extraTimes = ["08:30 AM", "09:00 AM", "09:45 AM", "10:40 AM", "11:15 AM", "01:00 PM", "02:15 PM", "03:00 PM"];
const extraDoctors = ["Larber Kais", "Tario Anam", "Dr. Hart", "Dr. Patel", "Imofomasch"];
const extraIns = [
  "Aetna Dental Discount Plan [PRIMARY-AS SELF]",
  "Cigna (PPO) [PRIMARY-AS SELF]",
  "Delta Dental of PA (PPO) [PRIMARY-AS SELF]",
  "(CASH)",
  "Jefferson Health Plan Everwell [SECONDARY-AS SELF]",
];

const extraRows: EligibilityRow[] = extraNames.map(([name, patientId], index) => ({
  no: index + 9,
  patientId,
  name,
  office: extraOffices[index % extraOffices.length],
  dob: `${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}-20${10 + (index % 15)}`,
  insurance: extraIns[index % extraIns.length],
  aptDate: "10-10-2026",
  aptTime: extraTimes[index % extraTimes.length],
  doctor: extraDoctors[index % extraDoctors.length],
  specialty: index % 4 === 0 ? "Orthodontics" : "General Dentistry",
  status: index % 5 === 0 ? "Eligibility Done" : "Awaited",
  checkedBy: index % 5 === 0 ? "Staff" : undefined,
  checkedAt: index % 5 === 0 ? `10-10-2026 0${(index % 8) + 1}:10 AM` : undefined,
  tab: index % 5 === 0 ? "done" : index % 7 === 0 ? "temp" : "pending",
}));

const seedRows: EligibilityRow[] = [
  { no: 1, patientId: "375000", name: "MORELL ALBERTO", note: "1 X INCIDENCE FOOT", office: "LORETTO AVE GD-OS-1044", dob: "12-13-1949", insurance: "Aetna Open Access by Dental Plans (Discount) [PRIMARY-AS SELF]", aptDate: "10-10-2026", aptTime: "10:20 AM", doctor: "Larber Kais", specialty: "General Dentistry", status: "Awaited", tab: "pending" },
  { no: 2, patientId: "854666", name: "TEJADA RODRIGUEZ MAURICIO", note: "M-ANESTH", office: "LORETTO AVE GD-OS-1044", dob: "12-30-2001", insurance: "Aetna Dental Discount Plan / AVS Dental [PRIMARY-AS SELF]", aptDate: "10-10-2026", aptTime: "11:00 AM", doctor: "Larber Kais", specialty: "General Dentistry", status: "Awaited", tab: "pending" },
  { no: 3, patientId: "855107", name: "VASQUEZ LOUITES", office: "ALLENTOWN GD-OS-3000", dob: "06-08-1964", insurance: "(CASH)", aptDate: "10-10-2026", aptTime: "12:00 PM", doctor: "Tario Anam", specialty: "General Dentistry", status: "Awaited", tab: "pending" },
  { no: 4, patientId: "900889", name: "REESE TERRY", office: "LORETTO AVE GD-OS-1044", dob: "01-08-1974", insurance: "Jefferson Health Plan Everwell (Medicaid) [SECONDARY-AS SELF]", aptDate: "10-10-2026", aptTime: "10:20 AM", doctor: "Larber Kais", specialty: "General Dentistry", status: "Awaited", checkedBy: "Nishita", checkedAt: "10-10-2026 10:07 AM", tab: "pending" },
  { no: 5, patientId: "100500", name: "SMITH ZEFFELI", office: "OLNEY AVENUE-GD", dob: "03-04-1980", insurance: "Delta Dental of PA (PPO) [PRIMARY-AS SELF]", aptDate: "10-10-2026", aptTime: "09:15 AM", doctor: "Imofomasch", specialty: "General Dentistry", status: "Awaited", checkedBy: "Nikita", checkedAt: "10-09-2026 09:26 PM", tab: "pending" },
  { no: 6, patientId: "17001", name: "JOHNSONN ELLA", office: "DUNCAN", dob: "02-27-2012", insurance: "Cigna (PPO) [PRIMARY-AS SELF]", aptDate: "10-10-2026", aptTime: "09:00 AM", doctor: "Dr. Rollins Thomas", specialty: "Orthodontics", status: "Eligibility Done", checkedBy: "Samir", checkedAt: "10-10-2026 08:12 AM", tab: "done" },
  { no: 7, patientId: "17004", name: "CURRY NEVAEH", office: "ORTHO", dob: "02-15-2005", insurance: "(CASH)", aptDate: "10-10-2026", aptTime: "02:00 PM", doctor: "Dr. Patel", specialty: "General Dentistry", status: "Awaited", tab: "temp" },
  { no: 8, patientId: "16665", name: "Denise Wingard", office: "SAAS", dob: "03-12-1984", insurance: "Cigna Silver Plan [PRIMARY-AS SELF]", aptDate: "10-10-2026", aptTime: "01:30 PM", doctor: "Dr. Hart", specialty: "General Dentistry", status: "Awaited", tab: "complete" },
  ...extraRows,
];

function toDisplayDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}-${year} (${weekday})`;
}

function toRowDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${month}-${day}-${year}`;
}

type SortKey = keyof Pick<EligibilityRow, "no" | "patientId" | "name" | "office" | "dob" | "insurance" | "aptDate" | "aptTime" | "doctor" | "specialty" | "status">;
type SortDir = "asc" | "desc";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: "text" | "select" }[] = [
  { key: "no", label: "No", filter: "text" },
  { key: "patientId", label: "Patient ID", filter: "text" },
  { key: "name", label: "Patient Name", filter: "text" },
  { key: "office", label: "Office", filter: "select" },
  { key: "dob", label: "DOB", filter: "text" },
  { key: "insurance", label: "Insurance", filter: "text" },
  { key: "aptDate", label: "Apt Date", filter: "text" },
  { key: "aptTime", label: "Apt Time", filter: "text" },
  { key: "doctor", label: "Doctor / Provider", filter: "select" },
  { key: "specialty", label: "Specialty", filter: "select" },
  { key: "status", label: "Status", filter: "select" },
];

const legend: { id: EligibilityRow["tab"]; label: string; chip: string; row: string }[] = [
  { id: "complete", label: "Registration Complete Today", chip: "bg-emerald-100 border-l-[3px] border-emerald-600 text-foreground", row: "bg-emerald-100" },
  { id: "temp", label: "Temp / Quick Registration", chip: "bg-amber-100 border-l-[3px] border-amber-500 text-foreground", row: "bg-amber-100" },
  { id: "pending", label: "Pending Eligibility", chip: "bg-rose-100 border-l-[3px] border-rose-500 text-foreground", row: "bg-rose-50" },
  { id: "done", label: "Eligibility Done", chip: "bg-lime-100 border-l-[3px] border-lime-600 text-foreground", row: "bg-lime-100" },
];

const rowTone = Object.fromEntries(legend.map((item) => [item.id, item.row])) as Record<EligibilityRow["tab"], string>;

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

type MessageReply = { from: string; body: string; time: string };
type EligibilityMessage = {
  id: string;
  from: string;
  patient: string;
  patientId: string;
  office: string;
  subject: string;
  body: string;
  time: string;
  unread: boolean;
  replies: MessageReply[];
};

const seedMessages: EligibilityMessage[] = [
  {
    id: "m1",
    from: "Nishita",
    patient: "MORELL ALBERTO",
    patientId: "375000",
    office: "LORETTO AVE GD-OS-1044",
    subject: "Need eligibility recheck",
    body: "Aetna Open Access is showing pending. Please recheck and reply with the status.",
    time: "10-10-2026 10:08 AM",
    unread: true,
    replies: [],
  },
  {
    id: "m2",
    from: "Front Desk",
    patient: "REESE TERRY",
    patientId: "900889",
    office: "LORETTO AVE GD-OS-1044",
    subject: "Secondary insurance missing",
    body: "Jefferson secondary is not on file. Can you add it before the 10:20 appointment?",
    time: "10-10-2026 09:42 AM",
    unread: true,
    replies: [],
  },
  {
    id: "m3",
    from: "Nikita",
    patient: "SMITH ZEFFELI",
    patientId: "100500",
    office: "OLNEY AVENUE-GD",
    subject: "Eligibility done",
    body: "Delta Dental PPO verified last night. Ready for check-in.",
    time: "10-09-2026 09:26 PM",
    unread: false,
    replies: [{ from: "You", body: "Noted, marked checked.", time: "10-09-2026 09:40 PM" }],
  },
];

export default function EligibilityPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [rows, setRows] = useState(seedRows);
  const [office, setOffice] = useState("all");
  const [location, setLocation] = useState("all");
  const [legendFilter, setLegendFilter] = useState<EligibilityRow["tab"] | "all">("all");
  const [aptDate, setAptDate] = useState("2026-10-10");
  const [sortByAptTime, setSortByAptTime] = useState(false);
  const [dmoNotEligible, setDmoNotEligible] = useState(false);
  const [dmoEarly, setDmoEarly] = useState(false);
  const [viewOnlyUc, setViewOnlyUc] = useState(false);
  const [ucCheck, setUcCheck] = useState(false);
  const [messages, setMessages] = useState(seedMessages);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxPos, setInboxPos] = useState({ top: 0, left: 0 });
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const inboxBtnRef = useRef<HTMLButtonElement>(null);
  const inboxPanelRef = useRef<HTMLDivElement>(null);
  const unreadCount = messages.filter((msg) => msg.unread).length;
  const replyMessage = messages.find((msg) => msg.id === replyId) ?? null;

  const placeInbox = () => {
    const el = inboxBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 400;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    setInboxPos({ top: rect.bottom + 8, left });
  };

  const toggleInbox = () => {
    setInboxOpen((open) => {
      if (!open) placeInbox();
      return !open;
    });
  };

  useEffect(() => {
    if (!inboxOpen) return;
    placeInbox();
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inboxBtnRef.current?.contains(target) || inboxPanelRef.current?.contains(target)) return;
      setInboxOpen(false);
    };
    const onReposition = () => placeInbox();
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [inboxOpen]);

  const openReply = (id: string) => {
    setReplyId(id);
    setReplyText("");
    setInboxOpen(false);
    setMessages((current) => current.map((msg) => (msg.id === id ? { ...msg, unread: false } : msg)));
  };

  const sendReply = () => {
    const text = replyText.trim();
    if (!replyId || !text) return;
    setMessages((current) =>
      current.map((msg) =>
        msg.id === replyId
          ? {
              ...msg,
              unread: false,
              replies: [...msg.replies, { from: "You", body: text, time: "Just now" }],
            }
          : msg
      )
    );
    setReplyText("");
    setReplyId(null);
  };

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
      if (legendFilter !== "all" && row.tab !== legendFilter) return false;
      if (office !== "all" && row.office !== office) return false;
      if (location !== "all" && !row.office.toLowerCase().includes(location.toLowerCase())) return false;
      if (aptDate && row.aptDate !== toRowDate(aptDate)) return false;
      if (dmoNotEligible && !row.insurance.toLowerCase().includes("dmo") && !row.insurance.toLowerCase().includes("discount")) return false;
      if (viewOnlyUc && !["ORTHO", "MI", "DUNCAN", "SAAS"].some((code) => row.office.toUpperCase().includes(code))) return false;
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

    const key = sortByAptTime ? "aptTime" : sortKey;
    list = [...list].sort((a, b) => {
      if (key === "no") return sortDir === "asc" ? a.no - b.no : b.no - a.no;
      const av = String(a[key] ?? "").toLowerCase();
      const bv = String(b[key] ?? "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [q, filters, sortKey, sortDir, tick, rows, office, location, sortByAptTime, aptDate, dmoNotEligible, viewOnlyUc, legendFilter]);

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
    if (sortKey !== col && !(sortByAptTime && col === "aptTime")) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const handleExport = () => {
    const headers = [...columns.map((c) => c.label), "Checked By", "Date & Time", "Add Ins"];
    const exportRows = filtered.map((r) => [
      ...columns.map((col) => String(r[col.key])),
      r.checkedBy ?? "",
      r.checkedAt ?? "",
      "View/Add",
    ]);
    exportToExcel(`eligibility-${aptDate}`, headers, exportRows, "Eligibility");
  };

  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[16px] font-bold">Patient Eligibility Check Status</h1>
        </div>
        <button type="button" className="btn" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
      </div>

      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div className="flex items-end gap-2 flex-wrap">
          <div className="field min-w-[220px]">
            <label>Selected Office</label>
            <select value={office} onChange={(e) => setOffice(e.target.value)}>
              <option value="all">Search office</option>
              {offices.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field min-w-[180px]">
            <label>Appointment Date · {toDisplayDate(aptDate)}</label>
            <input type="date" value={aptDate} onChange={(e) => setAptDate(e.target.value)} />
          </div>
          <div className="relative">
            <button
              type="button"
              ref={inboxBtnRef}
              className={`btn ${unreadCount > 0 ? "btn-alert-blink" : ""}`}
              onClick={toggleInbox}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              New Message
              {unreadCount > 0 ? (
                <span className="min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] leading-4 text-center">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {inboxOpen
              ? createPortal(
                  <div
                    ref={inboxPanelRef}
                    className="fixed w-[400px] max-w-[calc(100vw-16px)] bg-card border border-border rounded-[3px] shadow-xl overflow-hidden"
                    style={{ top: inboxPos.top, left: inboxPos.left, zIndex: 3200 }}
                  >
                    <div className="px-2.5 py-1.5 border-b border-border flex items-center justify-between bg-secondary/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Messages</span>
                      <span className="text-[10px] text-muted-foreground">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-[320px] overflow-auto">
                      {messages.length === 0 ? (
                        <div className="px-3 py-6 text-[11px] text-muted-foreground text-center">No messages.</div>
                      ) : (
                        messages.map((msg) => (
                          <button
                            key={msg.id}
                            type="button"
                            className={`w-full text-left px-2.5 py-2.5 border-b border-border last:border-b-0 cursor-pointer hover:bg-secondary ${
                              msg.unread ? "bg-rose-50" : "bg-card"
                            }`}
                            onClick={() => openReply(msg.id)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[12px] ${msg.unread ? "font-bold text-rose-700" : "font-semibold"}`}>
                                {msg.from}
                              </span>
                              <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
                            </div>
                            <div className="text-[12px] font-medium mt-0.5">{msg.subject}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {msg.patient} · {msg.patientId} · {msg.office}
                            </div>
                            <p className="text-[11px] leading-snug mt-1">{msg.body}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>,
                  document.body
                )
              : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["ORTHO", "MI", "DUNCAN", "SAAS"].map((item) => (
            <button
              key={item}
              type="button"
              className={`btn ${location === item ? "btn-primary" : ""}`}
              onClick={() => setLocation((current) => (current === item ? "all" : item))}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="btn h-7">
            <input type="checkbox" checked={dmoNotEligible} onChange={(e) => setDmoNotEligible(e.target.checked)} />
            DMO Not Eligible
          </label>
          <label className="btn h-7">
            <input type="checkbox" checked={sortByAptTime} onChange={(e) => setSortByAptTime(e.target.checked)} />
            Sort by Apt Time
          </label>
          <label className="btn h-7">
            <input type="checkbox" checked={dmoEarly} onChange={(e) => setDmoEarly(e.target.checked)} />
            DMO (3 Days Early)
          </label>
          <label className="btn h-7">
            <input type="checkbox" checked={viewOnlyUc} onChange={(e) => setViewOnlyUc(e.target.checked)} />
            View Only UC
          </label>
          <label className="btn h-7">
            <input type="checkbox" checked={ucCheck} onChange={(e) => setUcCheck(e.target.checked)} />
            UC Eligibility Check
          </label>
        </div>
        <div className="px-2 py-1.5 border border-border bg-secondary/30 flex items-center gap-2 flex-wrap rounded-[3px]" aria-label="Eligibility status legend">
          <button
            type="button"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 bg-transparent border-none p-0 cursor-pointer hover:text-foreground"
            onClick={() => setLegendFilter("all")}
          >
            Legend
          </button>
          {legend.map((item) => {
            const active = legendFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`px-2 py-1 rounded-[2px] text-[10px] font-semibold cursor-pointer ${item.chip} ${
                  active ? "ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"
                }`}
                onClick={() => setLegendFilter((current) => (current === item.id ? "all" : item.id))}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search eligibility..."
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

      <div className="flex items-center justify-end text-[11px] text-muted-foreground">
        Showing {filtered.length} of {rows.length} results
      </div>

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
                <th>Action</th>
                <th>View/Add</th>
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
                  <th />
                </tr>
              )}
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center text-muted-foreground py-6">
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.patientId} className={rowTone[row.tab]}>
                    <td className="text-muted-foreground">{row.no}</td>
                    <td className="font-semibold text-primary">{row.patientId}</td>
                    <td className="min-w-[160px]">
                      <div className="font-semibold">{row.name}</div>
                      {row.note ? <div className="text-[10px] text-muted-foreground">[{row.note}]</div> : null}
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <Phone className="w-3 h-3" /> Call
                      </span>
                    </td>
                    <td>{row.office}</td>
                    <td>{row.dob}</td>
                    <td className="min-w-[180px] text-[11px] leading-snug">{row.insurance}</td>
                    <td>{row.aptDate}</td>
                    <td>{row.aptTime}</td>
                    <td>{row.doctor}</td>
                    <td>{row.specialty}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="min-w-[140px] text-[10px] leading-snug">
                      {row.checkedBy || row.checkedAt ? (
                        <>
                          <div>
                            <span className="text-muted-foreground">Checked By</span>
                            <div className="font-semibold text-[11px]">{row.checkedBy || "—"}</div>
                          </div>
                          <div className="mt-1">
                            <span className="text-muted-foreground">Date & Time</span>
                            <div className="font-semibold text-[11px]">{row.checkedAt || "—"}</div>
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="btn h-6 px-2" onClick={() => navigate("/patient/insurance")}>
                        View/Add
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {replyMessage ? (
        <div
          className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
          onClick={() => setReplyId(null)}
        >
          <div
            className="panel bg-card w-full max-w-lg shadow-xl flex flex-col max-h-[calc(100vh-48px)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="eligibility-reply-title"
          >
            <div className="panel-header shrink-0">
              <div id="eligibility-reply-title" className="panel-title flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Reply to {replyMessage.from}
              </div>
              <button type="button" className="btn h-7 px-2" onClick={() => setReplyId(null)} aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 flex flex-col gap-2 overflow-auto">
              <div className="text-[11px] text-muted-foreground">
                {replyMessage.patient} · {replyMessage.patientId} · {replyMessage.office}
              </div>
              <div className="border border-border rounded-[3px] bg-secondary/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold">{replyMessage.subject}</span>
                  <span className="text-[10px] text-muted-foreground">{replyMessage.time}</span>
                </div>
                <p className="text-[12px] mt-1 leading-snug">{replyMessage.body}</p>
              </div>
              {replyMessage.replies.map((reply, index) => (
                <div key={`${reply.time}-${index}`} className="border border-border rounded-[3px] bg-card p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold">{reply.from}</span>
                    <span className="text-[10px] text-muted-foreground">{reply.time}</span>
                  </div>
                  <p className="text-[12px] mt-1 leading-snug">{reply.body}</p>
                </div>
              ))}
              <div className="field">
                <label>Your reply</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply for this eligibility message..."
                />
              </div>
            </div>
            <div className="px-3 py-2 border-t border-border flex justify-end gap-1.5">
              <button type="button" className="btn" onClick={() => setReplyId(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={sendReply} disabled={!replyText.trim()}>
                <Send className="w-3.5 h-3.5" /> Send Reply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
