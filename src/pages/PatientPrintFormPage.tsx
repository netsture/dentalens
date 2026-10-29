import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  FileText,
  History,
  MessageSquare,
  Printer,
  ShieldCheck,
  Stethoscope,
  UserCircle2,
  Wallet,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { getPatientById } from "@/lib/patients";
import { downloadPrintForms, formsFromCodes } from "@/lib/printFormPdf";
import { PRINT_FORM_GROUPS, type FormLang, type PrintFormItem } from "@/lib/printForms";

const workspaceNav = [
  { key: "overview", label: "Overview", icon: UserCircle2, path: "/patient/overview" },
  { key: "insurance", label: "Insurance", icon: ShieldCheck, path: "/patient/insurance" },
  { key: "clinical", label: "Clinical Chart", icon: Stethoscope, path: "/patient/clinical" },
  { key: "treatment", label: "Treatment Planner", icon: ClipboardList, path: "/patient/treatment" },
  { key: "recalls", label: "Recalls", icon: History, path: "/patient/recalls" },
  { key: "authorizations", label: "Authorizations", icon: FileCheck2, path: "/patient/authorizations" },
  { key: "printform", label: "Print Form", icon: Printer, path: "/patient/printform" },
  { key: "documents", label: "Documents", icon: FileText, path: "/patient/documents" },
];

export default function PatientPrintFormPage() {
  const { patientId = "" } = useParams();
  const patient = getPatientById(patientId);
  const [lang, setLang] = useState<FormLang>("en");
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [alert, setAlert] = useState<string | null>(null);

  const idQuery = `?id=${patientId}`;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(() => setAlert(null), 3000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  if (!patientId) return <Navigate to="/patient" replace />;

  const displayName = patient?.name ?? "Patient";
  const displayDetail = patient ? `${patient.phone} · DOB ${patient.dob}` : "Print forms";

  const toggleGroup = (code: string) => {
    setOpenGroups((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
    );
  };

  const toggleForm = (code: string) => {
    setSelected((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
    );
  };

  const pdfPatient = {
    id: patientId,
    name: displayName,
    dob: patient?.dob ?? "01-01-1985",
  };

  const createPdf = (forms: PrintFormItem[]) => {
    if (forms.length === 0) return;
    downloadPrintForms(forms, pdfPatient, lang);
  };

  const printSelected = () => {
    if (selected.length === 0) {
      setAlert("Please select at least one form.");
      return;
    }
    createPdf(formsFromCodes(selected));
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      {alert ? (
        <div className="fixed top-14 right-3 z-[4000] flex items-start gap-2.5 bg-red-50 text-red-600 px-3.5 py-2.5 rounded-xl border border-red-100 shadow-sm min-w-[240px] text-[length:var(--density-font)]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="font-medium">{alert}</span>
        </div>
      ) : null}
      <div className="panel flex items-center justify-between gap-3 px-3 py-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
            <UserCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-bold text-[length:calc(var(--density-font)+2.5px)]">
              {displayName} <span className="text-muted-foreground font-medium">(#{patientId})</span>
            </h1>
            <p className="text-[length:var(--density-font-sm)] text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span>{displayDetail}</span>
              <StatusBadge status={patient?.status ?? "Active"} />
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Link to={`/patient/overview${idQuery}`} className="btn">
            <CalendarDays className="w-3.5 h-3.5" /> Overview
          </Link>
          <button type="button" className="btn">
            <MessageSquare className="w-3.5 h-3.5" /> Message
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        <aside className="panel w-[190px] shrink-0 p-1.5 overflow-auto hidden md:block">
          <div className="menu-group-title">Patient</div>
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const to = item.key === "printform" ? `/patient/printform/${patientId}` : `${item.path}${idQuery}`;
            const active = item.key === "printform";
            return (
              <Link key={item.key} to={to} className={`sidebar-item ${active ? "active" : ""}`}>
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </Link>
            );
          })}
          <div className="menu-group-title">Account</div>
          <Link to={`/patient/billing${idQuery}`} className="sidebar-item">
            <Wallet className="w-3.5 h-3.5" /> Billing
          </Link>
        </aside>

        <main className="flex-1 min-w-0 overflow-auto flex flex-col gap-2">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              <h2 className="panel-title">Print Form</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" className={`btn ${lang === "en" ? "btn-primary" : ""}`} onClick={() => setLang("en")}>
                English
              </button>
              <button type="button" className={`btn ${lang === "es" ? "btn-primary" : ""}`} onClick={() => setLang("es")}>
                Spanish
              </button>
              <button type="button" className="btn btn-primary" onClick={printSelected}>
                <Printer className="w-3.5 h-3.5" /> Print{selected.length > 0 ? ` (${selected.length})` : ""}
              </button>
            </div>
          </div>

          <div className="panel overflow-hidden">
            {PRINT_FORM_GROUPS.map((group) => {
              const open = openGroups.includes(group.code);
              const title = lang === "es" ? group.es : group.en;
              return (
                <div key={group.code} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 text-left px-3 py-2 bg-card hover:bg-secondary cursor-pointer border-none text-foreground"
                    onClick={() => toggleGroup(group.code)}
                  >
                    {open ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-bold tracking-wide text-[length:var(--density-font)]">
                      {group.code} - {title}
                    </span>
                  </button>
                  {open ? (
                    <div className="border-t border-border bg-secondary/30">
                      {group.items.map((item) => {
                        const checked = selectedSet.has(item.code);
                        const label = lang === "es" ? item.es : item.en;
                        return (
                          <div
                            key={item.code}
                            className="flex items-center gap-2 px-8 py-1.5 border-b border-border last:border-b-0 hover:bg-secondary"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleForm(item.code)}
                              aria-label={`Select ${item.code}`}
                            />
                            <button
                              type="button"
                              className="font-medium text-primary bg-transparent border-none p-0 cursor-pointer text-left hover:underline text-[length:var(--density-font)]"
                              onClick={() => createPdf([item])}
                            >
                              {item.code} - {label}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="flex justify-start">
            <button type="button" className="btn btn-primary" onClick={printSelected}>
              <Printer className="w-3.5 h-3.5" /> Print{selected.length > 0 ? ` (${selected.length})` : ""}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
