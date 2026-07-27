import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarCheck,
  Clock3,
  ListChecks,
  MessageSquareText,
  PhoneCall,
  Plus,
  Search,
  Send,
  UserCheck,
} from "lucide-react";

type ToolKey = "find-slot" | "online" | "short-call" | "unscheduled" | "recalls";

const toolMeta: Record<ToolKey, { title: string; description: string }> = {
  "find-slot": {
    title: "Find Appointment Slot",
    description: "Search provider availability and reserve the best matching time.",
  },
  online: {
    title: "Online Appointment Requests",
    description: "Review, confirm, and schedule requests received from the patient portal.",
  },
  "short-call": {
    title: "Short Call List",
    description: "Patients available to fill openings at short notice.",
  },
  unscheduled: {
    title: "Unscheduled Treatments",
    description: "Recommended and accepted procedures that still need an appointment.",
  },
  recalls: {
    title: "Recall Management",
    description: "Track due and overdue continuing-care appointments.",
  },
};

const onlineRequests = [
  ["RQ-1048", "Melissa Que", "New Patient Exam", "Jul 23, 9:00 AM", "Pending"],
  ["RQ-1047", "Laura Ban", "Cleaning", "Jul 23, 11:30 AM", "Pending"],
  ["RQ-1046", "George Greene", "Emergency Visit", "Jul 22, 3:00 PM", "Contacted"],
  ["RQ-1045", "Denise Wingard", "Crown Seat", "Jul 25, 10:00 AM", "Confirmed"],
];

const shortCallRows = [
  ["Alex Hartman", "(419) 731-5344", "Any weekday", "Morning", "Cleaning"],
  ["Emily Adams", "(215) 555-0128", "Mon / Wed", "After 2 PM", "Restoration"],
  ["Laura Ban", "(215) 555-0187", "Any day", "Any time", "Recall"],
  ["Samuel Balseca", "(201) 552-0729", "Friday", "Morning", "New Patient"],
];

const treatmentRows = [
  ["George Greene", "D2740", "Crown - porcelain/ceramic", "23", "$1,225.00", "Recommended"],
  ["George Greene", "D6240", "Pontic - porcelain fused", "24", "$1,118.00", "Proposed"],
  ["Denise Wingard", "D2950", "Core buildup", "21", "$300.00", "Accepted"],
  ["Melissa Que", "D2752", "Crown - noble metal", "4", "$1,132.00", "Recommended"],
  ["Jacob Adams", "D2393", "Resin composite, three surfaces", "30", "$287.00", "Accepted"],
];

const recallRows = [
  ["Laura Ban", "Adult Recall", "D1110 - Prophylaxis", "Jul 15, 2026", "Overdue"],
  ["Martin Hall", "Perio Maintenance", "D4910", "Jul 19, 2026", "Overdue"],
  ["Melissa Que", "Child Recall", "D1120 - Prophylaxis", "Jul 28, 2026", "Due soon"],
  ["Denise Wingard", "Periodic Exam", "D0120", "Aug 04, 2026", "Scheduled"],
];

const slots = [
  ["Wed, Jul 22", "9:20 AM", "Dr. Hart", "Operatory 2", "40 min"],
  ["Wed, Jul 22", "11:10 AM", "Dr. Hart", "Operatory 1", "40 min"],
  ["Thu, Jul 23", "8:30 AM", "Dr. Moses", "Operatory 3", "40 min"],
  ["Thu, Jul 23", "2:00 PM", "Dr. Patel", "Operatory 1", "40 min"],
  ["Fri, Jul 24", "10:40 AM", "Dr. Moses", "Operatory 2", "40 min"],
];

function DataGrid({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap flex-1 border-0 rounded-none">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header) => <th key={header}>{header}</th>)}
            <th className="w-[96px]">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, index) => (
                <td key={index} className={index === 0 ? "font-semibold" : ""}>
                  {index === row.length - 1 ? (
                    <span className="badge bg-accent text-accent-foreground">{cell}</span>
                  ) : cell}
                </td>
              ))}
              <td>
                <button type="button" className="btn h-6 px-2">Open</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SchedulerToolsPage() {
  const location = useLocation();
  const key = (location.pathname.split("/").pop() || "find-slot") as ToolKey;
  const current = toolMeta[key] || toolMeta["find-slot"];
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);

  const dataset = useMemo(() => {
    const map: Record<ToolKey, string[][]> = {
      "find-slot": slots,
      online: onlineRequests,
      "short-call": shortCallRows,
      unscheduled: treatmentRows,
      recalls: recallRows,
    };
    const rows = map[key] || slots;
    if (!query.trim()) return rows;
    const normalized = query.toLowerCase();
    return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(normalized)));
  }, [key, query]);

  const headers: Record<ToolKey, string[]> = {
    "find-slot": ["Date", "Time", "Provider", "Operatory", "Duration"],
    online: ["Request", "Patient", "Visit Type", "Preferred Time", "Status"],
    "short-call": ["Patient", "Phone", "Available Days", "Preference", "Visit Type"],
    unscheduled: ["Patient", "Code", "Procedure", "Tooth / Area", "Estimate", "Status"],
    recalls: ["Patient", "Recall Type", "Procedure", "Due Date", "Status"],
  };

  const HeaderIcon =
    key === "online" ? MessageSquareText
      : key === "short-call" ? PhoneCall
        : key === "unscheduled" ? ListChecks
          : key === "recalls" ? UserCheck
            : Clock3;

  const markSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[16px] font-bold flex items-center gap-2">
            <HeaderIcon className="w-4 h-4 text-primary" />
            {current.title}
          </h1>
          <p className="text-[11px] text-muted-foreground">{current.description}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={markSaved}>
          {key === "online" ? <CalendarCheck className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {saved ? "Saved" : key === "online" ? "Book selected" : "Add new"}
        </button>
      </div>

      <div className="panel p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
        <div className="field xl:col-span-2">
          <label>Search</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className="!pl-7 w-full"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Patient, provider, procedure..."
            />
          </div>
        </div>
        <div className="field">
          <label>Location</label>
          <select defaultValue="south">
            <option value="south">Bright Smiles South</option>
            <option value="main">Bright Smiles Main</option>
          </select>
        </div>
        <div className="field">
          <label>{key === "recalls" ? "Recall status" : "Provider"}</label>
          <select defaultValue="all">
            <option value="all">All</option>
            <option value="hart">Dr. Hart</option>
            <option value="moses">Dr. Moses</option>
          </select>
        </div>
        <div className="field">
          <label>Date range</label>
          <input type="date" defaultValue="2026-07-21" />
        </div>
      </div>

      <div className="panel flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="panel-header">
          <div className="panel-title">{dataset.length} results</div>
          <button type="button" className="btn">
            <Send className="w-3.5 h-3.5" /> Contact selected
          </button>
        </div>
        <DataGrid headers={headers[key] || headers["find-slot"]} rows={dataset} />
      </div>
    </div>
  );
}
