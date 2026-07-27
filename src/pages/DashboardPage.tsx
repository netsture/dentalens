import { useMemo, useState } from "react";
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  DollarSign,
  Clock,
  Stethoscope,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TableToolbar } from "@/components/TableToolbar";

const stats = [
  { label: "Total Patients", value: "2,847", change: "+12%", icon: Users },
  { label: "Today's Appointments", value: "42", change: "+5", icon: CalendarCheck },
  { label: "Pending Claims", value: "18", change: "-3", icon: AlertTriangle },
  { label: "Monthly Revenue", value: "$84,250", change: "+8.4%", icon: DollarSign },
];

const todayAppts = [
  { time: "09:00", patient: "JOHNSONN ELLA", type: "AWC 16X22", doctor: "Dr. Rollins", status: "Confirmed" },
  { time: "09:30", patient: "MCNUTT PHEONIX", type: "AWC .018", doctor: "Dr. Rollins", status: "Allocated" },
  { time: "10:00", patient: "DELGADO GENESIS", type: "AWC", doctor: "Dr. Smith", status: "Confirmed" },
  { time: "10:30", patient: "ESCOBAR TEJADA DARA", type: "Consultation", doctor: "Dr. Patel", status: "Waiting" },
  { time: "11:00", patient: "CURRY NEVAEH", type: "New Patient", doctor: "Dr. Smith", status: "Message" },
];

const recentActivity = [
  { text: "Payment received — Denise Wingard $54.80", time: "12 min ago" },
  { text: "Claim #1136 submitted to CIGNA", time: "45 min ago" },
  { text: "New patient registered — Samuel Balseca", time: "1 hr ago" },
  { text: "Appointment cancelled — Side 5 blocked", time: "2 hr ago" },
];

export default function DashboardPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const filtered = useMemo(() => {
    void tick;
    let list = todayAppts;
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(
      (a) =>
        a.patient.toLowerCase().includes(s) ||
        a.doctor.toLowerCase().includes(s) ||
        a.type.toLowerCase().includes(s)
    );
  }, [q, statusFilter, tick]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-[16px] font-bold text-foreground">Dashboard</h1>
          <p className="text-[11px] text-muted-foreground">Clinic overview for today</p>
        </div>
        <div className="flex gap-2">
          <Link to="/appointment/book" className="btn btn-primary">
            <CalendarCheck className="w-3.5 h-3.5" /> Book Appointment
          </Link>
          <Link to="/patient/billing" className="btn">
            <DollarSign className="w-3.5 h-3.5" /> Billing
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="panel p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-[3px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="text-[18px] font-bold text-foreground leading-tight mt-0.5">{s.value}</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {s.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 flex-1 min-h-0">
        <div className="panel xl:col-span-2 flex flex-col min-h-0 gap-2 p-2">
          <div className="panel-header !border-0 !bg-transparent !px-0 !py-0">
            <div className="panel-title flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Today's Schedule
            </div>
            <Link to="/appointment/book" className="btn btn-ghost text-primary">
              Open book →
            </Link>
          </div>

          <TableToolbar
            search={q}
            onSearchChange={setQ}
            searchPlaceholder="Search schedule..."
            onRefresh={handleRefresh}
            refreshing={refreshing}
            filterContent={
              <div className="field min-w-[160px]">
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Message">Message</option>
                </select>
              </div>
            }
          />

          <div className="table-wrap flex-1 border border-border rounded-[3px]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.time + a.patient}>
                    <td className="font-semibold">{a.time}</td>
                    <td>{a.patient}</td>
                    <td>{a.type}</td>
                    <td>
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-muted-foreground" />
                        {a.doctor}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-accent text-accent-foreground">{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel flex flex-col">
          <div className="panel-header">
            <div className="panel-title">Recent Activity</div>
          </div>
          <div className="p-2 flex flex-col gap-1.5 overflow-auto">
            {recentActivity.map((r) => (
              <div
                key={r.text}
                className="px-2 py-2 rounded-[3px] hover:bg-secondary border border-transparent hover:border-border"
              >
                <div className="text-[12px] text-foreground font-medium leading-snug">{r.text}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{r.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
