import { useEffect, useState } from "react";

export type SidebarCollapsePage = {
  id: string;
  label: string;
  group: string;
  path: string;
  match: "exact" | "prefix";
};

export type SidebarCollapseSettings = {
  enabled: boolean;
  pages: string[];
};

export const SIDEBAR_COLLAPSE_EVENT = "dentsaas:sidebar-collapse";
export const SIDEBAR_COLLAPSE_KEY = "dentsaas-sidebar-collapse";

export const SIDEBAR_COLLAPSE_PAGES: SidebarCollapsePage[] = [
  { id: "dashboard", label: "Dashboard", group: "Practice", path: "/dashboard", match: "exact" },
  { id: "practice-setup", label: "Practice Setup", group: "Practice", path: "/practice-setup", match: "prefix" },
  { id: "provider-list", label: "Doctor Screen", group: "Provider", path: "/provider", match: "exact" },
  { id: "provider-daily", label: "Doctor Daily Screen", group: "Provider", path: "/provider/", match: "prefix" },
  { id: "appointment-book", label: "Appointment Book", group: "Scheduling", path: "/appointment/book", match: "exact" },
  { id: "find-slot", label: "Find Slot", group: "Scheduling", path: "/appointment/find-slot", match: "exact" },
  { id: "online", label: "Online Requests", group: "Scheduling", path: "/appointment/online", match: "exact" },
  { id: "short-call", label: "Short Call List", group: "Scheduling", path: "/appointment/short-call", match: "exact" },
  { id: "unscheduled", label: "Unscheduled Treatment", group: "Scheduling", path: "/appointment/unscheduled", match: "exact" },
  { id: "appointment-recalls", label: "Appointment Recalls", group: "Scheduling", path: "/appointment/recalls", match: "exact" },
  { id: "patient-search", label: "Patient Search", group: "Patients", path: "/patient", match: "exact" },
  { id: "patient-overview", label: "Patient Overview", group: "Patients", path: "/patient/overview", match: "exact" },
  { id: "patient-insurance", label: "Patient Insurance", group: "Patients", path: "/patient/insurance", match: "exact" },
  { id: "clinical", label: "Clinical Chart", group: "Patients", path: "/patient/clinical", match: "exact" },
  { id: "treatment-planner", label: "Treatment Planner", group: "Patients", path: "/patient/treatment", match: "exact" },
  { id: "patient-recalls", label: "Patient Recalls", group: "Patients", path: "/patient/recalls", match: "exact" },
  { id: "authorizations", label: "Authorizations", group: "Patients", path: "/patient/authorizations", match: "exact" },
  { id: "print-form", label: "Print Form", group: "Patients", path: "/patient/printform", match: "prefix" },
  { id: "exam-txplan", label: "Exam Treatment Plan", group: "Patients", path: "/patient/treatementplan", match: "prefix" },
  { id: "patient-documents", label: "Patient Documents", group: "Patients", path: "/patient/documents", match: "exact" },
  { id: "patient-billing", label: "Patient Billing", group: "Financial", path: "/patient/billing", match: "exact" },
  { id: "documents", label: "Office Documents", group: "Financial", path: "/documents", match: "exact" },
  { id: "report", label: "Analytics & Reports", group: "Financial", path: "/report", match: "prefix" },
  { id: "eligibility", label: "Eligibility Check", group: "Eligibility", path: "/eligibility", match: "exact" },
  { id: "back-office", label: "Back Office", group: "Back Office", path: "/back-office", match: "exact" },
  { id: "settings", label: "Settings", group: "Administration", path: "/settings", match: "exact" },
  { id: "voice-command", label: "Voice Command", group: "Administration", path: "/voice-command", match: "exact" },
];

export const DEFAULT_SIDEBAR_COLLAPSE: SidebarCollapseSettings = {
  enabled: true,
  pages: ["exam-txplan"],
};

function pageMatches(pathname: string, page: SidebarCollapsePage) {
  if (page.match === "prefix") {
    if (page.path.endsWith("/")) return pathname.startsWith(page.path);
    return pathname === page.path || pathname.startsWith(`${page.path}/`);
  }
  return pathname === page.path;
}

export function getSidebarCollapseSettings(): SidebarCollapseSettings {
  try {
    const raw = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (!raw) return DEFAULT_SIDEBAR_COLLAPSE;
    const parsed = JSON.parse(raw) as Partial<SidebarCollapseSettings>;
    const known = new Set(SIDEBAR_COLLAPSE_PAGES.map((page) => page.id));
    const pages = Array.isArray(parsed.pages) ? parsed.pages.filter((id) => known.has(id)) : DEFAULT_SIDEBAR_COLLAPSE.pages;
    return {
      enabled: parsed.enabled !== false,
      pages,
    };
  } catch {
    return DEFAULT_SIDEBAR_COLLAPSE;
  }
}

export function saveSidebarCollapseSettings(settings: SidebarCollapseSettings) {
  localStorage.setItem(SIDEBAR_COLLAPSE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(SIDEBAR_COLLAPSE_EVENT));
}

export function shouldAutoCollapseSidebar(pathname: string, settings = getSidebarCollapseSettings()) {
  if (!settings.enabled || settings.pages.length === 0) return false;
  return SIDEBAR_COLLAPSE_PAGES.some(
    (page) => settings.pages.includes(page.id) && pageMatches(pathname, page)
  );
}

export function useSidebarCollapseSettings() {
  const [settings, setSettings] = useState<SidebarCollapseSettings>(() => getSidebarCollapseSettings());

  useEffect(() => {
    const sync = () => setSettings(getSidebarCollapseSettings());
    window.addEventListener(SIDEBAR_COLLAPSE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SIDEBAR_COLLAPSE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = (next: SidebarCollapseSettings) => {
    saveSidebarCollapseSettings(next);
    setSettings(next);
  };

  return [settings, update] as const;
}
