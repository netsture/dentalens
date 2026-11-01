import { APP_FORM_FIELDS, APP_FUNCTIONS, EXTRA_APP_PAGES, SIDEBAR_MENU, type AppCatalogItem } from "@/lib/appCatalog";

export type SupportGuideItem = {
  id: string;
  title: string;
  group: string;
  path: string;
  keywords: string[];
  usedFor: string;
  steps: string[];
};

const PAGE_DETAILS: Record<string, Partial<Pick<SupportGuideItem, "usedFor" | "steps" | "keywords" | "title">>> = {
  dashboard: {
    title: "Dashboard",
    keywords: ["dashboard", "home", "today", "schedule", "overview"],
    usedFor: "See today's schedule, production snapshot, and quick clinic activity.",
    steps: ["Open the left sidebar", "Go to Practice → Dashboard"],
  },
  "practice-setup": {
    title: "Practice Setup",
    keywords: ["practice setup", "corporation", "office", "clinic setup", "fee"],
    usedFor: "Configure corporation, offices, providers, and fee lists for the practice.",
    steps: ["Open the left sidebar", "Go to Practice → Practice Setup", "Pick a setup section on the left"],
  },
  "provider-list": {
    title: "Doctor Screen / Providers",
    keywords: ["doctor", "provider", "doctor screen", "p2", "schedule patients"],
    usedFor: "Open a provider's daily patient list, clinical tools, and chair-side actions.",
    steps: ["Open the left sidebar", "Go to Provider → Doctor Screen", "Click a provider name to open their screen"],
  },
  "appointment-book": {
    keywords: ["appointment", "schedule", "book", "chair", "calendar"],
    usedFor: "Book, move, and review appointments by chair and provider.",
    steps: ["Open the left sidebar", "Go to Scheduling → Appointment Book"],
  },
  "patient-appointment": {
    keywords: ["appointment history", "patient appointment", "appt history", "time of apt"],
    usedFor: "Review a patient's past and upcoming appointments, status, and remarks.",
    steps: ["Open a patient", "In the patient left menu click Appointment (after Insurance)"],
  },
  "patient-search": {
    keywords: ["patient search", "find patient", "patient list", "add patient", "new patient"],
    usedFor: "Search the patient list, add a patient, or open billing and insurance.",
    steps: ["Open the left sidebar", "Go to Patients → Patient Search", "Or type a name in the top-bar Patient Search"],
  },
  "print-form": {
    keywords: ["print form", "printform", "consent", "examination form", "spanish form"],
    usedFor: "Print English or Spanish patient forms. Check forms, then Print, or click a form name for one PDF.",
    steps: [
      "Search and open a patient",
      "Open Patient Overview",
      "In the patient left menu click Print Form (before Documents)",
      "Choose English or Spanish",
      "Expand a group, check forms, click Print — or click the form name",
    ],
  },
  "exam-txplan": {
    keywords: ["exam txplan", "new ex/tx", "exam treatment", "treatementplan"],
    usedFor: "Open the exam treatment plan page for a patient from the doctor screen New Ex/Tx column.",
    steps: ["Open Provider → Doctor Screen", "Open a provider such as p1", "In the New Ex/Tx column click EXAM TXPLAN"],
  },
  "patient-ledger": {
    keywords: ["ledger", "patient ledger", "transactions"],
    usedFor: "Open the selected patient's billing ledger inside the patient workspace.",
    steps: ["Open a patient", "In the patient left menu under Account click Ledger"],
  },
  "patient-accounts": {
    keywords: ["accounts", "patient accounts", "proc id", "office fees"],
    usedFor: "Review procedure and payment rows, office fees, and patient balances.",
    steps: ["Open a patient", "In the patient left menu under Account click Accounts"],
  },
  "support-guide": {
    keywords: ["support", "help", "guide", "how to", "search functions"],
    usedFor: "Search every DentSaas menu and function, then jump to that screen.",
    steps: ["Open the left sidebar", "Go to Help → Support Guide", "Type a function name in the center search box"],
  },
};

const SYNONYMS: Record<string, string[]> = {
  registration: ["register", "add", "new", "enroll", "enrollment", "create"],
  register: ["registration", "add", "new", "enroll", "create"],
  add: ["new", "create", "register", "registration"],
  new: ["add", "create", "register"],
  create: ["add", "new", "register"],
  patient: ["patients", "chart", "mareez"],
  billing: ["ledger", "invoice", "payment", "bill"],
  ledger: ["billing", "accounts", "transactions"],
  appointment: ["schedule", "booking", "book"],
  book: ["appointment", "schedule"],
  doctor: ["provider"],
  provider: ["doctor"],
  help: ["support", "guide"],
  support: ["help", "guide"],
  notification: ["notifications", "email", "alerts"],
  notifications: ["notification", "email", "alerts"],
  email: ["emails", "notification", "notifications"],
  emails: ["email"],
};

const extraItems: SupportGuideItem[] = [];

function wordsFrom(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);
}

function catalogToGuide(item: AppCatalogItem): SupportGuideItem {
  const detail = PAGE_DETAILS[item.id];
  const autoKeywords = [
    item.name,
    item.group,
    item.path,
    ...wordsFrom(item.name),
    ...wordsFrom(item.group),
    ...wordsFrom(item.path),
  ];
  return {
    id: item.id,
    title: detail?.title ?? item.name,
    group: item.group,
    path: item.path,
    keywords: [...new Set([...(item.keywords ?? []), ...(detail?.keywords ?? []), ...autoKeywords])],
    usedFor: item.usedFor ?? detail?.usedFor ?? `Open ${item.name} from the ${item.group} menu.`,
    steps: item.steps ?? detail?.steps ?? [`Open the left sidebar`, `Go to ${item.group} → ${item.name}`],
  };
}

function mergeGuide(items: SupportGuideItem[]) {
  const map = new Map<string, SupportGuideItem>();
  items.forEach((item) => map.set(item.id, item));
  return [...map.values()];
}

/** Call this when a new feature is added so it appears in Support Guide. */
export function registerSupportGuide(item: SupportGuideItem | SupportGuideItem[]) {
  const list = Array.isArray(item) ? item : [item];
  list.forEach((entry) => {
    const index = extraItems.findIndex((current) => current.id === entry.id);
    if (index >= 0) extraItems[index] = entry;
    else extraItems.push(entry);
  });
}

export function getSupportGuide(): SupportGuideItem[] {
  return mergeGuide([
    ...SIDEBAR_MENU.map(catalogToGuide),
    ...EXTRA_APP_PAGES.map(catalogToGuide),
    ...APP_FUNCTIONS.map(catalogToGuide),
    ...APP_FORM_FIELDS.map(catalogToGuide),
    ...extraItems,
  ]);
}

/** @deprecated use getSupportGuide() — kept as a live snapshot for existing imports */
export const SUPPORT_GUIDE = getSupportGuide();

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function expandToken(token: string) {
  const extra = token.endsWith("s") && token.length > 3 ? [token.slice(0, -1)] : [`${token}s`];
  return [token, ...extra, ...(SYNONYMS[token] ?? [])];
}

function itemMatches(item: SupportGuideItem, query: string) {
  const hay = normalize(
    [item.title, item.group, item.usedFor, item.path, ...item.keywords, ...item.steps].join(" ")
  );
  const q = normalize(query);
  if (!q) return true;
  if (hay.includes(q)) return true;
  const tokens = q.split(" ").filter(Boolean);
  return tokens.every((token) => expandToken(token).some((variant) => hay.includes(variant)));
}

export function searchSupportGuide(query: string): SupportGuideItem[] {
  const catalog = getSupportGuide();
  const q = query.trim();
  if (!q) return catalog;
  return catalog.filter((item) => itemMatches(item, q));
}
