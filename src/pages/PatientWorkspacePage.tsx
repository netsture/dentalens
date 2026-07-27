import { useState, type ComponentType, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  FileText,
  HeartPulse,
  History,
  MessageSquare,
  Plus,
  ReceiptText,
  ShieldCheck,
  Stethoscope,
  UserCircle2,
  Wallet,
  X,
} from "lucide-react";
import { AddInsuranceModal } from "@/components/AddInsuranceModal";
import { AddPatientModal } from "@/components/AddPatientModal";

type SectionKey = "overview" | "insurance" | "clinical" | "treatment" | "recalls" | "authorizations";

const sections: { key: SectionKey; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: UserCircle2 },
  { key: "insurance", label: "Insurance", icon: ShieldCheck },
  { key: "clinical", label: "Clinical Chart", icon: Stethoscope },
  { key: "treatment", label: "Treatment Planner", icon: ClipboardList },
  { key: "recalls", label: "Recalls", icon: History },
  { key: "authorizations", label: "Authorizations", icon: FileCheck2 },
];

const treatments = [
  ["D6740", "Retainer crown - porcelain/ceramic", "23", "$0.00", "$0.00", "Proposed"],
  ["D6740", "Retainer crown - porcelain/ceramic", "26", "$0.00", "$0.00", "Proposed"],
  ["D6240", "Pontic - porcelain fused to high noble metal", "24", "$1,118.00", "$0.00", "Proposed"],
  ["D6240", "Pontic - porcelain fused to high noble metal", "25", "$1,118.00", "$0.00", "Proposed"],
];

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-1.5 border-b border-border last:border-0">
      <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">{label}</div>
      <div className="text-[11px] font-medium mt-0.5">{children}</div>
    </div>
  );
}

function ToothChart() {
  const [selected, setSelected] = useState<number[]>([3, 14, 19, 20, 29]);
  const toggle = (tooth: number) => {
    setSelected((current) =>
      current.includes(tooth) ? current.filter((item) => item !== tooth) : [...current, tooth]
    );
  };

  const renderArch = (numbers: number[]) => (
    <div className="grid grid-cols-16 gap-1 min-w-[720px]">
      {numbers.map((tooth) => {
        const active = selected.includes(tooth);
        return (
          <button
            type="button"
            key={tooth}
            onClick={() => toggle(tooth)}
            className={`group h-24 border rounded-t-[18px] rounded-b-[8px] cursor-pointer relative transition-colors ${
              active
                ? "border-destructive bg-red-50"
                : "border-border bg-gradient-to-b from-amber-50 to-white hover:border-primary"
            }`}
            title={`Tooth ${tooth}`}
          >
            <span className="absolute top-1 inset-x-0 text-[9px] font-bold text-muted-foreground">{tooth}</span>
            <span
              className={`absolute top-7 left-1/2 -translate-x-1/2 w-6 h-9 rounded-[45%] border-2 ${
                active ? "border-destructive bg-destructive/15" : "border-slate-300 bg-white"
              }`}
            />
            {active && <span className="absolute bottom-2 inset-x-0 text-[8px] font-bold text-destructive">Planned</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="panel overflow-auto p-3">
      <div className="flex gap-4 mb-3 text-[10px]">
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Planned</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Existing</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> Healthy</span>
      </div>
      <div className="space-y-4">
        {renderArch(Array.from({ length: 16 }, (_, index) => index + 1))}
        {renderArch(Array.from({ length: 16 }, (_, index) => 32 - index))}
      </div>
    </div>
  );
}

function Overview() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
      <div className="panel">
        <div className="panel-header"><div className="panel-title">Patient Details</div></div>
        <div className="p-3">
          <Detail label="Patient ID">#1494</Detail>
          <Detail label="Date of birth">January 1, 1990 · 36 years</Detail>
          <Detail label="Phone">(419) 731-5344</Detail>
          <Detail label="Email">melissa.que@example.com</Detail>
          <Detail label="Primary provider">Dr. Hart</Detail>
          <Detail label="Preferred location">Bright Smiles South</Detail>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title">Account Summary</div></div>
        <div className="p-3">
          <Detail label="Patient balance">$0.00</Detail>
          <Detail label="Insurance balance">$0.00</Detail>
          <Detail label="Last visit">September 15, 2026</Detail>
          <Detail label="Next appointment">September 29, 2026 · 9:20 AM</Detail>
          <Detail label="Recall status"><span className="badge bg-amber-100 text-amber-800">Due soon</span></Detail>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title">Alerts and Notes</div></div>
        <div className="p-3 space-y-2">
          <div className="p-2 bg-red-50 border border-red-200 rounded-[3px] text-red-800">
            <div className="font-bold flex items-center gap-1"><HeartPulse className="w-3.5 h-3.5" /> Penicillin allergy</div>
            <p className="text-[10px] mt-1">Do not prescribe penicillin-class antibiotics.</p>
          </div>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-[3px]">
            <div className="font-bold flex items-center gap-1"><Bell className="w-3.5 h-3.5" /> Premedication required</div>
            <p className="text-[10px] mt-1">Confirm medication before clinical treatment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Insurance({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5" /> Add Insurance
        </button>
      </div>
      <div className="panel p-3 grid grid-cols-2 xl:grid-cols-4 gap-x-6">
        <Detail label="Plan name">Cigna Silver Plan</Detail>
        <Detail label="Member ID">J3405197101</Detail>
        <Detail label="Effective date">June 1, 2026</Detail>
        <Detail label="Status"><span className="badge bg-emerald-100 text-emerald-800">Active</span></Detail>
        <Detail label="Subscriber">Melissa Que</Detail>
        <Detail label="Relationship">Self</Detail>
        <Detail label="Eligibility checked">July 21, 2026</Detail>
        <Detail label="Fee schedule">Office UCR</Detail>
      </div>
      <div className="panel overflow-hidden">
        <div className="panel-header"><div className="panel-title">Deductibles and Maximums</div></div>
        <table className="data-table">
          <thead><tr><th>Benefit</th><th>Plan amount</th><th>Used</th><th>Remaining</th></tr></thead>
          <tbody>
            <tr><td className="font-semibold">Individual maximum</td><td>$2,000.00</td><td>$620.00</td><td>$1,380.00</td></tr>
            <tr><td className="font-semibold">Individual deductible</td><td>$50.00</td><td>$50.00</td><td>$0.00</td></tr>
            <tr><td className="font-semibold">Orthodontic lifetime maximum</td><td>$1,500.00</td><td>$0.00</td><td>$1,500.00</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TreatmentPlanner() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 h-full min-h-0">
      <div className="xl:col-span-2 panel overflow-auto">
        <div className="panel-header"><div className="panel-title">Treatment Plan · Bridge 23–26</div></div>
        <table className="data-table">
          <thead><tr><th>Code</th><th>Procedure</th><th>Tooth</th><th>Patient est.</th><th>Insurance est.</th><th>Status</th></tr></thead>
          <tbody>
            {treatments.map((row) => (
              <tr key={row.join("-")}>
                {row.map((cell, index) => <td key={index} className={index === 0 ? "font-semibold text-primary" : ""}>{cell}</td>)}
              </tr>
            ))}
            <tr className="bg-secondary font-bold"><td colSpan={3}>Total</td><td>$2,236.00</td><td>$0.00</td><td>Proposed</td></tr>
          </tbody>
        </table>
      </div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title">Fee Adjustment</div></div>
        <div className="p-3">
          <Detail label="Primary insurance">Cigna Silver Plan</Detail>
          <Detail label="Remaining maximum">$1,380.00</Detail>
          <Detail label="Deductible remaining">$0.00</Detail>
          <Detail label="Patient estimate">$2,236.00</Detail>
          <button type="button" className="btn btn-primary w-full mt-3">Present Plan</button>
        </div>
      </div>
    </div>
  );
}

function SimpleTable({ section }: { section: "recalls" | "authorizations" }) {
  const rows = section === "recalls"
    ? [
        ["Adult Recall", "D1110 - Prophylaxis", "Sep 30, 2026", "Scheduled"],
        ["Periodic Exam", "D0120", "Mar 15, 2027", "Active"],
        ["Perio Maintenance", "D4910", "Not set", "Inactive"],
      ]
    : [
        ["AUTH-227", "D1110 - Prophylaxis", "Delta Dental", "$97.00", "Pending"],
        ["AUTH-198", "D2740 - Crown", "Cigna", "$1,225.00", "Approved"],
        ["AUTH-181", "D6240 - Pontic", "Cigna", "$1,118.00", "Expired"],
      ];
  const headers = section === "recalls"
    ? ["Recall type", "Procedure", "Due date", "Status"]
    : ["Authorization", "Procedure", "Payer", "Amount", "Status"];
  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <div className="panel-title">{section === "recalls" ? "Active Recalls" : "Insurance Authorizations"}</div>
        <button type="button" className="btn btn-primary"><Plus className="w-3.5 h-3.5" /> Add</button>
      </div>
      <table className="data-table">
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={index} className={index === 0 ? "font-semibold" : ""}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function PatientWorkspacePage() {
  const location = useLocation();
  const section = (location.pathname.split("/").pop() || "overview") as SectionKey;
  const [showActions, setShowActions] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const active = sections.find((item) => item.key === section) || sections[0];

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      <div className="panel flex items-center justify-between gap-3 px-3 py-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
            <UserCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-bold text-[14px]">Melissa Que <span className="text-muted-foreground font-medium">(#1494)</span></h1>
            <p className="text-[10px] text-muted-foreground">36 yrs · Female · Active patient · Dr. Hart</p>
          </div>
          <span className="badge bg-red-100 text-red-700">Penicillin allergy</span>
        </div>
        <div className="flex gap-1">
          <button type="button" className="btn"><CalendarDays className="w-3.5 h-3.5" /> Appointment</button>
          <button type="button" className="btn"><MessageSquare className="w-3.5 h-3.5" /> Message</button>
          <button type="button" className="btn btn-primary" onClick={() => setShowActions(true)}><Plus className="w-3.5 h-3.5" /> Add</button>
        </div>
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        <aside className="panel w-[190px] shrink-0 p-1.5 overflow-auto hidden md:block">
          <div className="menu-group-title">Patient</div>
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.key} to={`/patient/${item.key}`} className={`sidebar-item ${section === item.key ? "active" : ""}`}>
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </Link>
            );
          })}
          <div className="menu-group-title">Account</div>
          <Link to="/patient/billing" className="sidebar-item"><Wallet className="w-3.5 h-3.5" /> Billing</Link>
          <Link to="/documents" className="sidebar-item"><FileText className="w-3.5 h-3.5" /> Documents</Link>
        </aside>

        <main className="flex-1 min-w-0 overflow-auto">
          <div className="flex items-center gap-2 mb-2">
            <active.icon className="w-4 h-4 text-primary" />
            <h2 className="text-[13px] font-bold">{active.label}</h2>
          </div>
          {section === "overview" && <Overview />}
          {section === "insurance" && <Insurance onAdd={() => setShowAddInsurance(true)} />}
          {section === "clinical" && <ToothChart />}
          {section === "treatment" && <TreatmentPlanner />}
          {section === "recalls" && <SimpleTable section="recalls" />}
          {section === "authorizations" && <SimpleTable section="authorizations" />}
        </main>
      </div>

      {showActions && (
        <div className="fixed inset-0 bg-black/40 z-[2000] grid place-items-center p-4" onClick={() => setShowActions(false)}>
          <div className="panel bg-card w-full max-w-md shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title">Add patient item</div>
              <button type="button" className="btn" onClick={() => setShowActions(false)}><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                [Activity, "Medical alert"],
                [ReceiptText, "Treatment"],
                [CalendarDays, "Appointment"],
                [FileText, "Document"],
                [ShieldCheck, "Insurance"],
                [UserCircle2, "New patient"],
              ].map(([Icon, label]) => {
                const ActionIcon = Icon as ComponentType<{ className?: string }>;
                return (
                  <button
                    key={label as string}
                    type="button"
                    className="panel p-3 hover:bg-secondary cursor-pointer text-left"
                    onClick={() => {
                      setShowActions(false);
                      if (label === "Insurance") setShowAddInsurance(true);
                      if (label === "New patient") setShowAddPatient(true);
                    }}
                  >
                    <ActionIcon className="w-4 h-4 text-primary mb-2" />
                    <span className="font-semibold text-[11px]">{label as string}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <AddPatientModal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onAddInsurance={(patient) => {
          setShowAddPatient(false);
          setShowAddInsurance(true);
          void patient;
        }}
      />

      <AddInsuranceModal
        open={showAddInsurance}
        onClose={() => setShowAddInsurance(false)}
        responsibleParty={{ id: "1494", name: "Que, Melissa" }}
      />
    </div>
  );
}
