import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  Home,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import { ReportDataTable, type ReportColumn } from "@/components/ReportDataTable";

type Section =
  | "home"
  | "patient-overview"
  | "patient-new"
  | "patient-aging"
  | "appt-daily"
  | "appt-doctor"
  | "appt-noshow"
  | "billing-collections"
  | "billing-claims"
  | "billing-revenue";

type GroupKey = "Patient" | "Appointment" | "Billing";

type NavChild = {
  key: Section;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
};

type NavGroup = {
  label: GroupKey;
  icon: ComponentType<{ className?: string }>;
  description: string;
  children: NavChild[];
};

const groups: NavGroup[] = [
  {
    label: "Patient",
    icon: Users,
    description: "Patient volume, registrations, and account aging",
    children: [
      {
        key: "patient-overview",
        label: "Patient Overview",
        icon: LayoutDashboard,
        description: "Active patients, demographics, and visit trends.",
      },
      {
        key: "patient-new",
        label: "New Patients",
        icon: UserPlus,
        description: "New registrations by day, source, and provider.",
      },
      {
        key: "patient-aging",
        label: "Account Aging",
        icon: ClipboardList,
        description: "Outstanding balances by aging bucket.",
      },
    ],
  },
  {
    label: "Appointment",
    icon: CalendarCheck,
    description: "Schedule load, provider utilization, and no-shows",
    children: [
      {
        key: "appt-daily",
        label: "Daily Schedule",
        icon: CalendarCheck,
        description: "Appointments completed vs scheduled by day.",
      },
      {
        key: "appt-doctor",
        label: "By Doctor",
        icon: BarChart3,
        description: "Chair time and appointment mix per doctor.",
      },
      {
        key: "appt-noshow",
        label: "No-Show / Cancel",
        icon: FileText,
        description: "Missed and cancelled appointments summary.",
      },
    ],
  },
  {
    label: "Billing",
    icon: Wallet,
    description: "Collections, claims, and revenue performance",
    children: [
      {
        key: "billing-collections",
        label: "Collections",
        icon: DollarSign,
        description: "Patient and insurance payments collected.",
      },
      {
        key: "billing-claims",
        label: "Claims Status",
        icon: Receipt,
        description: "Submitted, paid, denied, and pending claims.",
      },
      {
        key: "billing-revenue",
        label: "Revenue Trend",
        icon: TrendingUp,
        description: "Weekly production and collection trend.",
      },
    ],
  },
];

function parentOf(section: Section): GroupKey | undefined {
  return groups.find((g) => g.children.some((c) => c.key === section))?.label;
}

function findChild(section: Section): NavChild | undefined {
  for (const g of groups) {
    const child = g.children.find((c) => c.key === section);
    if (child) return child;
  }
  return undefined;
}

/* ── Demo datasets ── */
const patientRows = [
  { name: "Denise Wingard", id: "16665", visits: 12, balance: 948.8, status: "Active" },
  { name: "JOHNSONN ELLA", id: "17001", visits: 8, balance: 0, status: "Active" },
  { name: "BRAKE ZOIEY", id: "17002", visits: 5, balance: 120, status: "Active" },
  { name: "MCNUTT PHEONIX", id: "17003", visits: 6, balance: 45, status: "Active" },
  { name: "CURRY NEVAEH", id: "17004", visits: 1, balance: 0, status: "New" },
  { name: "DELGADO GENESIS", id: "17005", visits: 4, balance: 210, status: "Active" },
];

const newPatientRows = [
  { date: "2026-07-18", name: "BALSECA SAMUEL", source: "Referral", doctor: "Dr. Smith" },
  { date: "2026-07-18", name: "CURRY NEVAEH", source: "Walk-in", doctor: "Dr. Patel" },
  { date: "2026-07-17", name: "ESCOBAR TEJADA DARA", source: "Online", doctor: "Dr. Rollins" },
  { date: "2026-07-16", name: "HOLLENBACH OLIVIA", source: "Referral", doctor: "Dr. Smith" },
];

const agingRows = [
  { bucket: "0–30", patients: 42, amount: 3200 },
  { bucket: "31–60", patients: 18, amount: 5100 },
  { bucket: "61–90", patients: 11, amount: 4200 },
  { bucket: "90+", patients: 9, amount: 948.8 },
];

const dailyAppt = [
  { day: "Mon", scheduled: 45, completed: 38, cancelled: 4, noshow: 3 },
  { day: "Tue", scheduled: 52, completed: 48, cancelled: 2, noshow: 2 },
  { day: "Wed", scheduled: 48, completed: 42, cancelled: 3, noshow: 3 },
  { day: "Thu", scheduled: 55, completed: 50, cancelled: 3, noshow: 2 },
  { day: "Fri", scheduled: 40, completed: 35, cancelled: 3, noshow: 2 },
  { day: "Sat", scheduled: 20, completed: 18, cancelled: 1, noshow: 1 },
];

const doctorAppt = [
  { doctor: "Dr. Rollins Thomas", appts: 86, completed: 78, utilization: "91%" },
  { doctor: "Dr. Smith", appts: 72, completed: 65, utilization: "88%" },
  { doctor: "Dr. Patel", appts: 54, completed: 49, utilization: "85%" },
];

const noshowRows = [
  { date: "2026-07-17", patient: "BRAKE ZAKAI", doctor: "Dr. Rollins", type: "No-Show" },
  { date: "2026-07-16", patient: "MCNUTT PHEONIX", doctor: "Dr. Smith", type: "Cancelled" },
  { date: "2026-07-15", patient: "HOLLENBACH OLIVIA", doctor: "Dr. Patel", type: "No-Show" },
  { date: "2026-07-14", patient: "CURRY NEVAEH", doctor: "Dr. Smith", type: "Cancelled" },
];

const collectionRows = [
  { date: "2026-07-18", type: "Patient Payment", ref: "#5193", amount: 54.8 },
  { date: "2026-07-18", type: "Insurance EFT", ref: "#5229", amount: 67.2 },
  { date: "2026-07-17", type: "Patient Payment", ref: "#5188", amount: 120 },
  { date: "2026-07-16", type: "Insurance Check", ref: "#5210", amount: 340 },
];

const claimRows = [
  { claim: "#1136", payer: "CIGNA", status: "Submitted", amount: 274 },
  { claim: "#1140", payer: "Delta Dental", status: "Paid", amount: 410 },
  { claim: "#1142", payer: "Aetna", status: "Pending", amount: 188 },
  { claim: "#1145", payer: "CIGNA", status: "Denied", amount: 95 },
];

const revenueRows = [
  { week: "W1", production: 18200, collection: 16400 },
  { week: "W2", production: 20100, collection: 17800 },
  { week: "W3", production: 19500, collection: 18200 },
  { week: "W4", production: 21400, collection: 19600 },
];

function fmtDate(iso: string) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="panel p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-[3px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[16px] font-bold leading-tight">{value}</div>
      </div>
    </div>
  );
}

/* ── Column definitions per report ── */
const patientOverviewCols: ReportColumn<(typeof patientRows)[0]>[] = [
  { key: "name", label: "Patient", filter: "text", render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: "id", label: "ID", filter: "text", render: (r) => `#${r.id}` },
  { key: "visits", label: "Visits", filter: "number", align: "right" },
  {
    key: "balance",
    label: "Balance",
    filter: "number",
    align: "right",
    render: (r) => (
      <span className={r.balance > 0 ? "text-destructive font-bold" : ""}>
        ${r.balance.toFixed(2)}
      </span>
    ),
  },
  { key: "status", label: "Status", filter: "select", options: ["Active", "New"], render: (r) => <span className="badge bg-accent text-accent-foreground">{r.status}</span> },
];

const newPatientCols: ReportColumn<(typeof newPatientRows)[0]>[] = [
  { key: "date", label: "Date", filter: "date", render: (r) => fmtDate(r.date) },
  { key: "name", label: "Patient", filter: "text", render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: "source", label: "Source", filter: "select", options: ["Referral", "Walk-in", "Online"] },
  { key: "doctor", label: "Doctor", filter: "select" },
];

const agingCols: ReportColumn<(typeof agingRows)[0]>[] = [
  { key: "bucket", label: "Aging Bucket", filter: "select", options: ["0–30", "31–60", "61–90", "90+"] },
  { key: "patients", label: "Patients", filter: "number", align: "right" },
  {
    key: "amount",
    label: "Amount",
    filter: "number",
    align: "right",
    render: (r) => <span className="font-bold">${r.amount.toLocaleString()}</span>,
  },
];

const dailyApptCols: ReportColumn<(typeof dailyAppt)[0]>[] = [
  { key: "day", label: "Day", filter: "select", options: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { key: "scheduled", label: "Scheduled", filter: "number", align: "right" },
  { key: "completed", label: "Completed", filter: "number", align: "right" },
  { key: "cancelled", label: "Cancelled", filter: "number", align: "right" },
  { key: "noshow", label: "No-Show", filter: "number", align: "right" },
];

const doctorApptCols: ReportColumn<(typeof doctorAppt)[0]>[] = [
  { key: "doctor", label: "Doctor", filter: "select", render: (r) => <span className="font-semibold">{r.doctor}</span> },
  { key: "appts", label: "Appointments", filter: "number", align: "right" },
  { key: "completed", label: "Completed", filter: "number", align: "right" },
  {
    key: "utilization",
    label: "Utilization",
    filter: "select",
    options: ["91%", "88%", "85%"],
    render: (r) => <span className="badge bg-accent text-accent-foreground">{r.utilization}</span>,
  },
];

const noshowCols: ReportColumn<(typeof noshowRows)[0]>[] = [
  { key: "date", label: "Date", filter: "date", render: (r) => fmtDate(r.date) },
  { key: "patient", label: "Patient", filter: "text", render: (r) => <span className="font-semibold">{r.patient}</span> },
  { key: "doctor", label: "Doctor", filter: "select" },
  {
    key: "type",
    label: "Type",
    filter: "select",
    options: ["No-Show", "Cancelled"],
    render: (r) => <span className="badge bg-secondary text-secondary-foreground">{r.type}</span>,
  },
];

const collectionCols: ReportColumn<(typeof collectionRows)[0]>[] = [
  { key: "date", label: "Date", filter: "date", render: (r) => fmtDate(r.date) },
  {
    key: "type",
    label: "Type",
    filter: "select",
    options: ["Patient Payment", "Insurance EFT", "Insurance Check"],
  },
  { key: "ref", label: "Reference", filter: "text" },
  {
    key: "amount",
    label: "Amount",
    filter: "number",
    align: "right",
    render: (r) => <span className="font-bold text-emerald-700">${r.amount.toFixed(2)}</span>,
  },
];

const claimCols: ReportColumn<(typeof claimRows)[0]>[] = [
  { key: "claim", label: "Claim", filter: "text", render: (r) => <span className="font-semibold">{r.claim}</span> },
  { key: "payer", label: "Payer", filter: "select" },
  {
    key: "status",
    label: "Status",
    filter: "select",
    options: ["Submitted", "Paid", "Pending", "Denied"],
    render: (r) => <span className="badge bg-accent text-accent-foreground">{r.status}</span>,
  },
  {
    key: "amount",
    label: "Amount",
    filter: "number",
    align: "right",
    render: (r) => `$${r.amount.toFixed(2)}`,
  },
];

const revenueCols: ReportColumn<(typeof revenueRows)[0]>[] = [
  { key: "week", label: "Week", filter: "select", options: ["W1", "W2", "W3", "W4"] },
  {
    key: "production",
    label: "Production",
    filter: "number",
    align: "right",
    render: (r) => `$${r.production.toLocaleString()}`,
  },
  {
    key: "collection",
    label: "Collection",
    filter: "number",
    align: "right",
    render: (r) => <span className="font-bold">${r.collection.toLocaleString()}</span>,
  },
];

function ReportHome({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      {groups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div
            key={group.label}
            className="p-4 rounded-[3px] border border-border bg-card space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-[3px] bg-primary/10 text-primary shrink-0">
                  <GroupIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[12px] font-extrabold text-foreground tracking-tight leading-tight">
                    {group.label}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    {group.description}
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.children.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className="w-full text-left group p-3 rounded-[3px] bg-background border border-border hover:border-primary/50 hover:shadow-sm transition-all flex items-start gap-3 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-[3px] bg-secondary group-hover:bg-primary/10 transition-colors shrink-0">
                      <ItemIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[12px] text-foreground group-hover:text-primary transition-colors">
                          {item.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-primary shrink-0" />
                      </div>
                      <p className="text-muted-foreground text-[10.5px] mt-1 leading-normal line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionContent({ section }: { section: Section }) {
  switch (section) {
    case "patient-overview":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            <Kpi label="Total Patients" value="2,847" icon={Users} />
            <Kpi label="Active" value="2,410" icon={LayoutDashboard} />
            <Kpi label="New This Month" value="18" icon={UserPlus} />
            <Kpi label="Avg Visits" value="4.2" icon={BarChart3} />
          </div>
          <ReportDataTable columns={patientOverviewCols} data={patientRows} searchPlaceholder="Search patients..." />
        </div>
      );
    case "patient-new":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
            <Kpi label="New This Week" value="7" icon={UserPlus} />
            <Kpi label="Walk-in" value="2" icon={Users} />
            <Kpi label="Referral" value="3" icon={ClipboardList} />
          </div>
          <ReportDataTable columns={newPatientCols} data={newPatientRows} searchPlaceholder="Search new patients..." />
        </div>
      );
    case "patient-aging":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            {agingRows.map((a) => (
              <Kpi key={a.bucket} label={`${a.bucket} Days`} value={`$${a.amount.toLocaleString()}`} icon={Wallet} />
            ))}
          </div>
          <ReportDataTable columns={agingCols} data={agingRows} searchPlaceholder="Search aging..." />
        </div>
      );
    case "appt-daily":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            <Kpi label="Scheduled" value="260" icon={CalendarCheck} />
            <Kpi label="Completed" value="231" icon={BarChart3} />
            <Kpi label="Cancelled" value="16" icon={FileText} />
            <Kpi label="No-Show" value="13" icon={ClipboardList} />
          </div>
          <ReportDataTable columns={dailyApptCols} data={dailyAppt} searchPlaceholder="Search schedule..." />
        </div>
      );
    case "appt-doctor":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <ReportDataTable columns={doctorApptCols} data={doctorAppt} searchPlaceholder="Search doctors..." />
        </div>
      );
    case "appt-noshow":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="grid grid-cols-2 gap-2">
            <Kpi label="No-Shows (Week)" value="13" icon={ClipboardList} />
            <Kpi label="Cancelled (Week)" value="16" icon={FileText} />
          </div>
          <ReportDataTable columns={noshowCols} data={noshowRows} searchPlaceholder="Search no-shows..." />
        </div>
      );
    case "billing-collections":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
            <Kpi label="Today" value="$582" icon={DollarSign} />
            <Kpi label="This Week" value="$4,820" icon={Wallet} />
            <Kpi label="Collection Rate" value="92%" icon={TrendingUp} />
          </div>
          <ReportDataTable columns={collectionCols} data={collectionRows} searchPlaceholder="Search collections..." />
        </div>
      );
    case "billing-claims":
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            <Kpi label="Submitted" value="18" icon={Receipt} />
            <Kpi label="Paid" value="12" icon={DollarSign} />
            <Kpi label="Pending" value="5" icon={ClipboardList} />
            <Kpi label="Denied" value="1" icon={FileText} />
          </div>
          <ReportDataTable columns={claimCols} data={claimRows} searchPlaceholder="Search claims..." />
        </div>
      );
    case "billing-revenue": {
      const maxProd = Math.max(...revenueRows.map((r) => r.production));
      return (
        <div className="flex flex-col gap-2 h-full min-h-0">
          <div className="panel p-4">
            <div className="panel-title mb-3">Production vs Collection</div>
            <div className="flex items-end gap-4 h-[140px]">
              {revenueRows.map((r) => (
                <div key={r.week} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    <div
                      className="w-3 rounded-t-[2px] bg-primary"
                      style={{ height: `${(r.production / maxProd) * 100}%`, minHeight: 8 }}
                      title={`Production $${r.production}`}
                    />
                    <div
                      className="w-3 rounded-t-[2px] bg-emerald-500"
                      style={{ height: `${(r.collection / maxProd) * 100}%`, minHeight: 8 }}
                      title={`Collection $${r.collection}`}
                    />
                  </div>
                  <div className="text-[10px] font-semibold">{r.week}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-primary rounded-sm" /> Production</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" /> Collection</span>
            </div>
          </div>
          <ReportDataTable columns={revenueCols} data={revenueRows} searchPlaceholder="Search revenue..." />
        </div>
      );
    }
    default:
      return null;
  }
}

export default function ReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [expandedGroups, setExpandedGroups] = useState<GroupKey[]>(["Patient", "Appointment"]);

  const validSections = useMemo(
    () => new Set<Section>(["home", ...groups.flatMap((g) => g.children.map((c) => c.key))]),
    []
  );

  useEffect(() => {
    const param = (searchParams.get("section") as Section | null) || "home";
    if (validSections.has(param) && param !== activeSection) {
      setActiveSection(param);
      const parent = parentOf(param);
      if (parent) setExpandedGroups([parent]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    if (section === "home") {
      setSearchParams({}, { replace: false });
    } else {
      setSearchParams({ section }, { replace: false });
      const parent = parentOf(section);
      if (parent) setExpandedGroups([parent]);
    }
  };

  const toggleGroup = (label: GroupKey) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const activeChild = findChild(activeSection);
  const activeParent = parentOf(activeSection);

  return (
    <div className="flex-grow flex flex-col overflow-hidden h-full text-[11px] text-foreground">
      {activeSection !== "home" && (
        <header className="flex flex-col gap-2 shrink-0 pb-2">
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  className="hover:underline cursor-pointer border-none bg-transparent text-muted-foreground p-0"
                  onClick={() => handleSectionChange("home")}
                >
                  Reports
                </button>
                {activeParent && (
                  <>
                    <span>/</span>
                    <span>{activeParent}</span>
                  </>
                )}
                {activeChild && (
                  <>
                    <span>/</span>
                    <span className="text-primary font-bold">{activeChild.label}</span>
                  </>
                )}
              </div>
              <h1 className="text-base font-bold flex items-center gap-1.5 leading-none">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>{activeChild?.label || "Reports"}</span>
              </h1>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleSectionChange("home")}
                className="px-2.5 py-1 text-[10.5px] font-bold border border-border rounded-[3px] cursor-pointer bg-background hover:bg-muted"
              >
                Home
              </button>
              {groups.map((g) => {
                const first = g.children[0];
                const isActive = activeParent === g.label;
                return (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => handleSectionChange(first.key)}
                    className={`px-2.5 py-1 text-[10.5px] font-bold border rounded-[3px] cursor-pointer transition-colors ${
                      isActive
                        ? "border-primary/80 bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted text-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>
      )}

      {activeSection === "home" ? (
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div>
              <h1 className="text-base font-bold flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-primary" />
                Reports Console
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Patient, Appointment, and Billing reports in one place
              </p>
            </div>
          </div>
          <ReportHome onNavigate={handleSectionChange} />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden gap-2 min-h-0">
          {/* Nested section sidebar — CRM-style groups */}
          <aside className="w-[200px] shrink-0 border border-border rounded-[3px] bg-card flex flex-col overflow-hidden">
            <button
              type="button"
              onClick={() => handleSectionChange("home")}
              className="flex items-center gap-2 px-2.5 h-8 text-[11px] font-semibold border-b border-border bg-secondary hover:bg-secondary-hover cursor-pointer border-x-0 border-t-0 text-left"
            >
              <Home className="w-3.5 h-3.5 text-muted-foreground" />
              Report Home
            </button>
            <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-1">
              {groups.map((group) => {
                const GroupIcon = group.icon;
                const open = expandedGroups.includes(group.label);
                return (
                  <div key={group.label} className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      className="flex items-center gap-1.5 px-2 h-7 rounded-[3px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary border-none bg-transparent cursor-pointer text-left w-full"
                    >
                      {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <GroupIcon className="w-3 h-3" />
                      {group.label}
                    </button>
                    {open &&
                      group.children.map((child) => {
                        const Icon = child.icon;
                        const active = activeSection === child.key;
                        return (
                          <button
                            key={child.key}
                            type="button"
                            onClick={() => handleSectionChange(child.key)}
                            className={`flex items-center gap-2 pl-6 pr-2 h-7 rounded-[3px] text-[11px] font-medium border-none cursor-pointer text-left w-full ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-transparent text-foreground hover:bg-secondary"
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            <span className="truncate">{child.label}</span>
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            <SectionContent key={activeSection} section={activeSection} />
          </main>
        </div>
      )}
    </div>
  );
}
