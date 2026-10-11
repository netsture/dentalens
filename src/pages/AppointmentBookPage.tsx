import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  LayoutGrid,
  List as ListIcon,
  Mail,
  Phone,
  Plus,
  Printer,
  Receipt,
  Settings2,
  Stethoscope,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";

type Appointment = {
  id: string;
  sideId: string;
  start: string;
  end: string;
  patient: string;
  type: string;
  status: "confirmed" | "allocated" | "message" | "blocked";
  plan?: string;
  phone?: string;
};

const doctors = [
  { id: "d1", name: "Dr. Rollins Thomas" },
  { id: "d2", name: "Dr. Smith" },
  { id: "d3", name: "Dr. Patel" },
];

const sides = [
  { id: "s1", label: "Side 1", doctorId: "d1" },
  { id: "s2", label: "Side 2", doctorId: "d1" },
  { id: "s3", label: "Side 3", doctorId: "d1" },
  { id: "s4", label: "Side 4", doctorId: "d2" },
  { id: "s5", label: "Side 5", doctorId: "d2" },
  { id: "s6", label: "Side 6", doctorId: "d3" },
];

const seed: Appointment[] = [
  { id: "a1", sideId: "s1", start: "09:00", end: "09:30", patient: "JOHNSONN ELLA", type: "AWC 16X22", status: "confirmed", plan: "D", phone: "484-903-7236" },
  { id: "a2", sideId: "s2", start: "09:00", end: "09:30", patient: "BRAKE ZOIEY", type: "EVAL SPAC", status: "confirmed", plan: "M", phone: "201-616-6586" },
  { id: "a3", sideId: "s3", start: "09:00", end: "09:30", patient: "BRAKE ZAKAI", type: "EVAL SPAC", status: "confirmed", plan: "M", phone: "201-616-6586" },
  { id: "a4", sideId: "s1", start: "09:30", end: "10:00", patient: "MCNUTT PHEONIX", type: "AWC .018", status: "allocated", plan: "M", phone: "484-597-1934" },
  { id: "a5", sideId: "s2", start: "09:30", end: "10:00", patient: "HOLLENBACH OLIVIA", type: "EVAL BITE", status: "allocated", plan: "M", phone: "272-879-9001" },
  { id: "a6", sideId: "s4", start: "09:30", end: "10:00", patient: "CURRY NEVAEH", type: "NEW PATIENT", status: "message", plan: "L.M", phone: "484-554-6555" },
  { id: "a7", sideId: "s1", start: "10:00", end: "10:30", patient: "DELGADO GENESIS", type: "AWC", status: "confirmed", plan: "M", phone: "862-247-7212" },
  { id: "a8", sideId: "s2", start: "10:00", end: "10:30", patient: "BALSECA SAMUEL", type: "NEW PATIENT", status: "confirmed", plan: "M", phone: "201-552-0729" },
  { id: "a9", sideId: "s5", start: "09:00", end: "10:00", patient: "BLOCKED", type: "Blocked", status: "blocked" },
  { id: "a10", sideId: "s6", start: "09:00", end: "10:00", patient: "BLOCKED", type: "Out of office", status: "blocked" },
];

const times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

const patientExtras: Record<string, { id: string; insurance: string; dob: string; balance: string; ephone: string }> = {
  "JOHNSONN ELLA": { id: "17001", insurance: "Cigna (PPO) [PRIMARY-AS SELF]", dob: "02-27-2012", balance: "$0.00", ephone: "000-000-0000" },
  "BRAKE ZOIEY": { id: "17002", insurance: "Delta Dental (PPO) [PRIMARY-AS SELF]", dob: "08-28-2012", balance: "$120.00", ephone: "000-000-0000" },
  "BRAKE ZAKAI": { id: "17008", insurance: "Delta Dental (PPO) [PRIMARY-AS SELF]", dob: "08-28-2012", balance: "$120.00", ephone: "000-000-0000" },
  "MCNUTT PHEONIX": { id: "17003", insurance: "Aetna Dental [PRIMARY-AS SELF]", dob: "02-19-2012", balance: "$45.00", ephone: "000-000-0000" },
  "HOLLENBACH OLIVIA": { id: "17009", insurance: "MetLife PDP [PRIMARY-AS SELF]", dob: "04-11-2011", balance: "$0.00", ephone: "000-000-0000" },
  "CURRY NEVAEH": { id: "17004", insurance: "(CASH)", dob: "02-15-2005", balance: "$0.00", ephone: "000-000-0000" },
  "DELGADO GENESIS": { id: "17005", insurance: "Cigna (PPO) [PRIMARY-AS SELF]", dob: "03-03-2010", balance: "$210.00", ephone: "000-000-0000" },
  "BALSECA SAMUEL": { id: "17006", insurance: "(CASH)", dob: "05-12-2009", balance: "$0.00", ephone: "000-000-0000" },
};

const otherTypes = ["NF Patient", "Exam", "Cleaning", "Consultation", "Emergency", "Recall"];

const yellowActions = [
  "Cancel by patient & not reschedule",
  "Cancel not by patient & not reschedule",
  "Reschedule by patient",
  "Reschedule not by patient",
];

const redActions = ["No show / Broken", "Patient termination"];
const greenActions = ["Confirm appt", "Send email/text", "Left message", "Back to appointment", "Back to front desk"];

function statusClass(status: Appointment["status"]) {
  if (status === "confirmed") return "slot-confirmed";
  if (status === "allocated") return "slot-allocated";
  if (status === "message") return "slot-message";
  return "slot-blocked";
}

export default function AppointmentBookPage() {
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState<"grid" | "list">("grid");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showBook, setShowBook] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [otherType, setOtherType] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [collect, setCollect] = useState("");
  const [rescheduleNotice, setRescheduleNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const visibleSides = useMemo(
    () => (doctorFilter === "all" ? sides : sides.filter((s) => s.doctorId === doctorFilter)),
    [doctorFilter]
  );

  const appointments = useMemo(() => {
    void tick;
    let list = seed;
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) => a.patient.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
    );
  }, [search, statusFilter, tick]);

  useEffect(() => {
    if (!selected && !showBook && !showReschedule) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showReschedule) {
          setShowReschedule(false);
          return;
        }
        setSelected(null);
        setShowBook(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, showBook, showReschedule]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const shiftDay = (delta: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    setDate(next);
  };

  const findSlot = (sideId: string, time: string) =>
    appointments.find((a) => a.sideId === sideId && a.start === time);

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="panel-title">Appointment Book</div>
        <div className="flex items-center gap-1 border border-border rounded-[3px] overflow-hidden">
          <button type="button" className="btn rounded-none border-0 h-7" onClick={() => shiftDay(-1)}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="btn rounded-none border-0 h-7 min-w-[150px]" onClick={() => setDate(new Date())}>
            {dateLabel}
          </button>
          <button type="button" className="btn rounded-none border-0 h-7" onClick={() => shiftDay(1)}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        filterContent={
          <>
            <div className="field min-w-[160px]">
              <label>Doctor</label>
              <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                <option value="all">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="field min-w-[140px]">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="allocated">Allocated</option>
                <option value="message">Message</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </>
        }
        actions={
          <>
            <button type="button" className={`btn ${view === "grid" ? "btn-primary" : ""}`} onClick={() => setView("grid")}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button type="button" className={`btn ${view === "list" ? "btn-primary" : ""}`} onClick={() => setView("list")}>
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="btn" onClick={() => setShowBook(true)}>
              <Plus className="w-3.5 h-3.5" /> Book
            </button>
            <button type="button" className="btn"><UserPlus className="w-3.5 h-3.5" /> Patient</button>
            <button type="button" className="btn"><Ban className="w-3.5 h-3.5" /> Block</button>
            <button type="button" className="btn"><Printer className="w-3.5 h-3.5" /></button>
            <button type="button" className="btn"><Settings2 className="w-3.5 h-3.5" /></button>
          </>
        }
      />

      <div className="flex-1 min-h-0">
        <div className="panel flex flex-col min-h-0 h-full overflow-hidden">
          <div className="px-2 py-1.5 border-b border-border bg-secondary/30 flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Legend
            </span>
            {[
              ["Confirmed", "slot-confirmed"],
              ["Allocated", "slot-allocated"],
              ["Message", "slot-message"],
              ["Blocked", "slot-blocked"],
            ].map(([label, cls]) => (
              <div key={label} className={`px-2 py-1 rounded-[2px] text-[10px] font-semibold ${cls}`}>
                {label}
              </div>
            ))}
          </div>
          {view === "grid" ? (
            <div className="overflow-auto flex-1">
              <table className="data-table min-w-[900px]">
                <thead>
                  <tr>
                    <th className="w-[70px]">
                      <Clock className="w-3.5 h-3.5 inline" /> Time
                    </th>
                    {visibleSides.map((s) => {
                      const doc = doctors.find((d) => d.id === s.doctorId);
                      return (
                        <th key={s.id}>
                          <div>{s.label}</div>
                          <div className="font-medium normal-case tracking-normal text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Stethoscope className="w-3 h-3" /> {doc?.name}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {times.map((t) => (
                    <tr key={t}>
                      <td className="font-semibold text-muted-foreground whitespace-nowrap">{t}</td>
                      {visibleSides.map((s) => {
                        const appt = findSlot(s.id, t);
                        return (
                          <td key={s.id} className="p-1 align-top h-[44px]">
                            {appt ? (
                              <button
                                onClick={() => setSelected(appt)}
                                className={`w-full text-left px-1.5 py-1 rounded-[2px] border-none cursor-pointer ${statusClass(appt.status)}`}
                              >
                                <div className="text-[10px] font-bold truncate">{appt.patient}</div>
                                <div className="text-[9px] text-muted-foreground truncate">
                                  {appt.type} {appt.plan ? `· ${appt.plan}` : ""}
                                </div>
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowBook(true)}
                                className="w-full h-full min-h-[36px] border border-dashed border-transparent hover:border-border hover:bg-secondary/60 rounded-[2px] cursor-pointer bg-transparent"
                                title="Book slot"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrap flex-1 border-0 rounded-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Side</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .filter((a) => a.status !== "blocked")
                    .map((a) => (
                      <tr key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                        <td className="font-semibold">
                          {a.start}–{a.end}
                        </td>
                        <td>{sides.find((s) => s.id === a.sideId)?.label}</td>
                        <td>{a.patient}</td>
                        <td>{a.type}</td>
                        <td>
                          <StatusBadge status={a.status} />
                        </td>
                        <td>{a.phone || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-[4px] w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title">Appointment Detail</div>
              <button type="button" className="btn" onClick={() => setSelected(null)}>
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2 text-[12px]">
              <div className="field">
                <label>Patient</label>
                <div className="font-bold text-[13px]">{selected.patient}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="field">
                  <label>Start</label>
                  <div>{selected.start}</div>
                </div>
                <div className="field">
                  <label>End</label>
                  <div>{selected.end}</div>
                </div>
              </div>
              <div className="field">
                <label>Type</label>
                <div>{selected.type}</div>
              </div>
              <div className="field">
                <label>Status</label>
                <StatusBadge status={selected.status} />
              </div>
              <div className="field">
                <label>Phone</label>
                <div>{selected.phone || "—"}</div>
              </div>
              <div className="flex gap-1.5 mt-2">
                <button type="button" className="btn btn-primary flex-1">Check In</button>
                <button
                  type="button"
                  className="btn flex-1"
                  onClick={() => {
                    setOtherType([]);
                    setRemarks("");
                    setCollect("");
                    setRescheduleNotice(null);
                    setShowReschedule(true);
                  }}
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReschedule && selected && (
        <div
          className="fixed inset-0 bg-black/50 z-[2100] flex items-center justify-center p-4"
          onClick={() => setShowReschedule(false)}
        >
          <div
            className="bg-card border border-border rounded-[4px] w-full max-w-5xl max-h-[92vh] overflow-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-header">
              <div className="panel-title">
                Appointment Date · {date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
              </div>
              <button type="button" className="btn" onClick={() => setShowReschedule(false)}>
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>

            <div className="p-3 flex flex-col gap-3">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  ["Patient ID", patientExtras[selected.patient]?.id ?? selected.id.replace("a", "16")],
                  ["Patient Name", selected.patient],
                  ["Insurance Company", patientExtras[selected.patient]?.insurance ?? "(CASH)"],
                  ["Patient Telephone", selected.phone || "—"],
                  ["DOB", patientExtras[selected.patient]?.dob ?? "—"],
                  ["Approx Balance", patientExtras[selected.patient]?.balance ?? "N/A"],
                ].map(([label, value]) => (
                  <div key={label} className="field">
                    <label>{label}</label>
                    <div className="text-[12px] font-semibold leading-snug">{value}</div>
                    {label === "Patient Telephone" && patientExtras[selected.patient]?.ephone ? (
                      <div className="text-[10px] text-muted-foreground">E-phone {patientExtras[selected.patient].ephone}</div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" className="btn h-7 px-2" title="Notes"><FileText className="w-3.5 h-3.5" /></button>
                <button type="button" className="btn h-7 px-2" title="Call"><Phone className="w-3.5 h-3.5" /></button>
                <button type="button" className="btn h-7 px-2" title="Email"><Mail className="w-3.5 h-3.5" /></button>
                <button type="button" className="btn h-7 px-2" title="Print"><Printer className="w-3.5 h-3.5" /></button>
                <button type="button" className="btn h-7 px-2" title="Alert"><AlertTriangle className="w-3.5 h-3.5" /></button>
                <button type="button" className="btn" onClick={() => setRescheduleNotice("Opened View Ledger / Account")}>
                  <Wallet className="w-3.5 h-3.5" /> View Ledger / Account
                </button>
                <button type="button" className="btn" onClick={() => setRescheduleNotice("Opened View Invoices History")}>
                  <Receipt className="w-3.5 h-3.5" /> View Invoices History
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="field">
                  <label>Time Start</label>
                  <input type="time" defaultValue={selected.start} />
                </div>
                <div className="field">
                  <label>Time End / Units</label>
                  <input type="time" defaultValue={selected.end} />
                </div>
                <div className="field">
                  <label>Doctor</label>
                  <select defaultValue={sides.find((s) => s.id === selected.sideId)?.doctorId ?? "d1"}>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="field">
                      <label>Unfinished Split Procedure</label>
                      <div className="text-[12px] text-muted-foreground">—</div>
                    </div>
                    <div className="field">
                      <label>Treatment Plan</label>
                      <div className="text-[12px] text-muted-foreground">{selected.plan || "—"}</div>
                    </div>
                    <div className="field">
                      <label>Other</label>
                      <div className="flex flex-col gap-1">
                        {otherTypes.map((item) => (
                          <label key={item} className="flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={otherType.includes(item)}
                              onChange={() =>
                                setOtherType((current) =>
                                  current.includes(item) ? current.filter((v) => v !== item) : [...current, item]
                                )
                              }
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="field">
                      <label>Procedure to be done</label>
                      <input defaultValue={selected.type} />
                    </div>
                    <div className="field">
                      <label>Remarks</label>
                      <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Collect ($)</label>
                      <input value={collect} onChange={(e) => setCollect(e.target.value)} placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-[3px] bg-amber-50 border border-amber-200">
                    {yellowActions.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="btn h-auto min-h-8 py-1.5 text-[10px] bg-violet-100 border-violet-300 text-violet-800 hover:bg-violet-200"
                        onClick={() => setRescheduleNotice(label)}
                      >
                        {label}
                      </button>
                    ))}
                    {redActions.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="btn h-auto min-h-8 py-1.5 text-[10px] bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200"
                        onClick={() => setRescheduleNotice(label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-[3px] bg-emerald-50 border border-emerald-200">
                    {greenActions.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="btn h-auto min-h-8 py-1.5 text-[10px] bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200"
                        onClick={() => {
                          if (label === "Back to appointment" || label === "Back to front desk") {
                            setShowReschedule(false);
                            if (label === "Back to front desk") setSelected(null);
                            return;
                          }
                          setRescheduleNotice(label);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-success h-auto min-h-8 py-1.5 text-[10px] col-span-2"
                      onClick={() => {
                        setRescheduleNotice("Saved changes to appointment");
                        setShowReschedule(false);
                      }}
                    >
                      Save changes to appt
                    </button>
                  </div>
                </div>
              </div>

              {rescheduleNotice ? (
                <div className="panel px-3 py-2 text-[12px] flex items-center justify-between">
                  <span>{rescheduleNotice}</span>
                  <button type="button" className="btn" onClick={() => setRescheduleNotice(null)}>Close</button>
                </div>
              ) : null}

              <div className="panel overflow-hidden">
                <div className="panel-header">
                  <div className="panel-title">List of Proposed Appointments</div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Office</th>
                      <th>Doctor / Provider</th>
                      <th>Proposed Procedure</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="text-center text-muted-foreground py-4">
                        No results found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBook && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setShowBook(false)}>
          <div className="bg-card border border-border rounded-[4px] w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title">Book Appointment</div>
              <button className="btn" onClick={() => setShowBook(false)}>Close</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="field col-span-2">
                <label>Patient</label>
                <input placeholder="Search or type patient name" />
              </div>
              <div className="field">
                <label>Doctor</label>
                <select defaultValue="d1">
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Side</label>
                <select defaultValue="s1">
                  {sides.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Start</label>
                <input type="time" defaultValue="09:00" />
              </div>
              <div className="field">
                <label>End</label>
                <input type="time" defaultValue="09:30" />
              </div>
              <div className="field col-span-2">
                <label>Appointment Type</label>
                <select defaultValue="consult">
                  <option value="consult">Consultation</option>
                  <option value="new">New Patient</option>
                  <option value="awc">AWC</option>
                  <option value="eval">Evaluation</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-2 justify-end mt-1">
                <button className="btn" onClick={() => setShowBook(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => setShowBook(false)}>Save Booking</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
