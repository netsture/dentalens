export type VoiceLang = "en-US" | "hi-IN" | "gu-IN";

export type VoiceActionKind =
  | "navigate"
  | "search"
  | "search-page"
  | "refresh"
  | "export"
  | "filter"
  | "clear-search"
  | "back"
  | "add-patient"
  | "print"
  | "logout"
  | "help"
  | "view-add"
  | "unknown";

export type VoiceAction =
  | { kind: "navigate"; path: string; label: string }
  | { kind: "search"; query: string }
  | { kind: "search-page"; path: string; query: string; label: string }
  | { kind: "refresh" }
  | { kind: "export" }
  | { kind: "filter" }
  | { kind: "clear-search" }
  | { kind: "back" }
  | { kind: "add-patient" }
  | { kind: "print" }
  | { kind: "logout" }
  | { kind: "help" }
  | { kind: "view-add"; patientId: string }
  | { kind: "unknown" };

export type VoiceCommandLang = "all" | "en" | "hi" | "gu";

export type ManagedVoiceCommand = {
  id: string;
  phrase: string;
  extraPhrases: string;
  action: Exclude<VoiceActionKind, "unknown" | "search-page">;
  path: string;
  query: string;
  language: VoiceCommandLang;
  enabled: boolean;
  builtIn: boolean;
};

export const VOICE_LANGS: { id: VoiceLang; short: string; label: string }[] = [
  { id: "en-US", short: "EN", label: "English" },
  { id: "hi-IN", short: "HI", label: "Hindi" },
  { id: "gu-IN", short: "GU", label: "Gujarati" },
];

export const VOICE_EVENT = "dentsaas:voice";
const CUSTOM_KEY = "dentsaas-voice-commands";

export const NAV_TARGETS: { path: string; label: string }[] = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/practice-setup", label: "Practice Setup" },
  { path: "/provider", label: "Doctor Screen" },
  { path: "/appointment/book", label: "Appointment Book" },
  { path: "/appointment/find-slot", label: "Find Slot" },
  { path: "/appointment/recalls", label: "Recalls" },
  { path: "/patient", label: "Patient Search" },
  { path: "/patient/overview", label: "Patient Overview" },
  { path: "/patient/insurance", label: "Insurance" },
  { path: "/patient/clinical", label: "Clinical Chart" },
  { path: "/patient/treatment", label: "Treatment Planner" },
  { path: "/patient/authorizations", label: "Authorizations" },
  { path: "/patient/documents", label: "Patient Documents" },
  { path: "/patient/billing", label: "Patient Billing" },
  { path: "/documents", label: "Documents" },
  { path: "/report", label: "Reports" },
  { path: "/eligibility", label: "Eligibility" },
  { path: "/back-office", label: "Back Office" },
  { path: "/settings", label: "Settings" },
  { path: "/voice-command", label: "Voice Command" },
];

export const ACTION_OPTIONS: { id: ManagedVoiceCommand["action"]; label: string }[] = [
  { id: "navigate", label: "Open page" },
  { id: "search", label: "Search" },
  { id: "refresh", label: "Refresh" },
  { id: "export", label: "Export" },
  { id: "filter", label: "Filter" },
  { id: "clear-search", label: "Clear search" },
  { id: "back", label: "Go back" },
  { id: "add-patient", label: "Add patient" },
  { id: "print", label: "Print" },
  { id: "logout", label: "Logout" },
  { id: "help", label: "Show help" },
  { id: "view-add", label: "View / Add insurance" },
];

export function dispatchVoiceEvent(detail: {
  type: "search" | "refresh" | "export" | "filter" | "clear-search";
  query?: string;
}) {
  window.dispatchEvent(new CustomEvent(VOICE_EVENT, { detail }));
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLead(text: string) {
  return text
    .replace(
      /^(please |kindly |can you |could you |i want to |i need to |take me to |navigate to |go to |open |show |show me |display |launch |start |switch to )+/i,
      ""
    )
    .replace(/^(the |a |an )+/i, "")
    .replace(/\s+(page|screen|module|section)$/i, "")
    .trim();
}

function phrasesOf(command: ManagedVoiceCommand) {
  return [command.phrase, ...command.extraPhrases.split(",")]
    .map((item) => normalize(item))
    .filter(Boolean);
}

function actionLabel(action: ManagedVoiceCommand["action"]) {
  return ACTION_OPTIONS.find((item) => item.id === action)?.label ?? action;
}

function targetLabel(command: ManagedVoiceCommand) {
  if (command.action === "navigate") {
    return NAV_TARGETS.find((item) => item.path === command.path)?.label ?? command.path;
  }
  if (command.action === "search") return command.query ? `Search "${command.query}"` : "Search spoken text";
  if (command.action === "view-add") return command.query ? `Patient ${command.query}` : "Spoken patient ID";
  return "—";
}

const BUILTIN_ROUTES: { path: string; label: string; aliases: string[] }[] = [
  { path: "/dashboard", label: "Dashboard", aliases: ["dashboard", "home", "dashbord"] },
  { path: "/practice-setup", label: "Practice Setup", aliases: ["practice setup", "practice"] },
  { path: "/provider", label: "Doctor Screen", aliases: ["doctor", "doctor screen", "provider", "providers"] },
  { path: "/appointment/book", label: "Appointment Book", aliases: ["appointment", "appointment book", "book", "booking", "schedule", "calendar"] },
  { path: "/appointment/find-slot", label: "Find Slot", aliases: ["find slot", "slot"] },
  { path: "/appointment/recalls", label: "Recalls", aliases: ["recall", "recalls"] },
  { path: "/patient", label: "Patient Search", aliases: ["patient", "patients", "patient search", "mareez", "rogi", "dardee"] },
  { path: "/patient/overview", label: "Patient Overview", aliases: ["patient overview", "overview"] },
  { path: "/patient/insurance", label: "Insurance", aliases: ["insurance", "bima", "vimo"] },
  { path: "/patient/clinical", label: "Clinical Chart", aliases: ["clinical", "clinical chart", "chart"] },
  { path: "/patient/treatment", label: "Treatment Planner", aliases: ["treatment", "treatment planner"] },
  { path: "/patient/authorizations", label: "Authorizations", aliases: ["authorization", "authorizations"] },
  { path: "/patient/documents", label: "Patient Documents", aliases: ["patient documents"] },
  { path: "/patient/billing", label: "Patient Billing", aliases: ["billing", "bill"] },
  { path: "/documents", label: "Documents", aliases: ["document", "documents", "dastavej"] },
  { path: "/report", label: "Reports", aliases: ["report", "reports", "analytics"] },
  { path: "/eligibility", label: "Eligibility", aliases: ["eligibility", "eligibility check", "patrata"] },
  { path: "/back-office", label: "Back Office", aliases: ["back office", "backoffice"] },
  { path: "/settings", label: "Settings", aliases: ["setting", "settings"] },
  { path: "/voice-command", label: "Voice Command", aliases: ["voice command", "voice commands", "voice"] },
];

const BUILTIN_ACTIONS: { kind: Exclude<VoiceActionKind, "navigate" | "search" | "search-page" | "view-add" | "unknown">; aliases: string[] }[] = [
  { kind: "refresh", aliases: ["refresh", "reload"] },
  { kind: "export", aliases: ["export", "download excel", "excel"] },
  { kind: "filter", aliases: ["filter", "filters"] },
  { kind: "clear-search", aliases: ["clear search", "clear", "reset search"] },
  { kind: "back", aliases: ["back", "go back", "previous"] },
  { kind: "add-patient", aliases: ["add patient", "new patient", "create patient"] },
  { kind: "print", aliases: ["print"] },
  { kind: "logout", aliases: ["logout", "log out", "sign out"] },
  { kind: "help", aliases: ["help", "commands", "what can i say"] },
];

const DIGIT_WORDS: Record<string, string> = {
  zero: "0",
  oh: "0",
  o: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

export function extractPatientId(text: string): string | null {
  const digitMatch = text.replace(/[^\d\s]/g, " ").match(/\d{4,8}/);
  if (digitMatch?.[0]) return digitMatch[0];

  const words = normalize(text).split(" ");
  let current = "";
  let best = "";
  for (const word of words) {
    const digit = DIGIT_WORDS[word];
    if (digit) {
      current += digit;
      if (current.length > best.length) best = current;
    } else {
      current = "";
    }
  }
  return best.length >= 4 ? best : null;
}

function looksLikeViewAdd(text: string) {
  return /view\s*\/?\s*add|view and add|open insurance|patient id|patient number|eligibility/.test(text);
}

export function listBuiltInCommands(): ManagedVoiceCommand[] {
  const routes = BUILTIN_ROUTES.map((route) => ({
    id: `builtin-nav-${route.path}`,
    phrase: route.aliases[0],
    extraPhrases: route.aliases.slice(1).join(", "),
    action: "navigate" as const,
    path: route.path,
    query: "",
    language: "all" as const,
    enabled: true,
    builtIn: true,
  }));
  const actions = BUILTIN_ACTIONS.map((item) => ({
    id: `builtin-act-${item.kind}`,
    phrase: item.aliases[0],
    extraPhrases: item.aliases.slice(1).join(", "),
    action: item.kind,
    path: "",
    query: "",
    language: "all" as const,
    enabled: true,
    builtIn: true,
  }));
  const search: ManagedVoiceCommand = {
    id: "builtin-search",
    phrase: "search",
    extraPhrases: "find, look for, khojo, shodho",
    action: "search",
    path: "",
    query: "",
    language: "all",
    enabled: true,
    builtIn: true,
  };
  const viewAdd: ManagedVoiceCommand = {
    id: "builtin-view-add",
    phrase: "view add",
    extraPhrases: "view / add, patient id, open insurance",
    action: "view-add",
    path: "/patient/insurance",
    query: "",
    language: "all",
    enabled: true,
    builtIn: true,
  };
  return [...routes, ...actions, search, viewAdd];
}

export function loadCustomCommands(): ManagedVoiceCommand[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManagedVoiceCommand[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.phrase && item.action) : [];
  } catch {
    return [];
  }
}

export function saveCustomCommands(commands: ManagedVoiceCommand[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(commands));
  window.dispatchEvent(new CustomEvent("dentsaas:voice-commands-changed"));
}

export function listManagedCommands(): ManagedVoiceCommand[] {
  return [...loadCustomCommands(), ...listBuiltInCommands()];
}

export function commandDisplay(command: ManagedVoiceCommand) {
  return {
    actionLabel: actionLabel(command.action),
    targetLabel: targetLabel(command),
    languageLabel: command.language === "all" ? "All" : command.language.toUpperCase(),
    sourceLabel: command.builtIn ? "Built-in" : "Custom",
  };
}

function matchAlias(haystack: string, alias: string) {
  const a = normalize(alias);
  if (!a) return false;
  return haystack === a || haystack.includes(a);
}

function extractSearch(text: string): string | null {
  const patterns = [
    /(?:search for|search|find|look for|look up|filter by)\s+(.+)/i,
    /(?:khojo|dhoondo|shodho)\s+(.+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

function actionFromCommand(command: ManagedVoiceCommand, spokenQuery?: string): VoiceAction {
  if (command.action === "navigate") {
    const label = NAV_TARGETS.find((item) => item.path === command.path)?.label ?? command.path;
    return { kind: "navigate", path: command.path, label };
  }
  if (command.action === "search") {
    return { kind: "search", query: spokenQuery || command.query };
  }
  if (command.action === "view-add") {
    return { kind: "view-add", patientId: spokenQuery || command.query };
  }
  return { kind: command.action } as VoiceAction;
}

export function parseVoiceCommand(raw: string): VoiceAction {
  const original = raw.trim();
  if (!original) return { kind: "unknown" };

  const text = normalize(original);
  const stripped = stripLead(text);

  const custom = loadCustomCommands().filter((item) => item.enabled);
  for (const command of custom) {
    if (phrasesOf(command).some((phrase) => matchAlias(stripped, phrase) || matchAlias(text, phrase))) {
      const spokenId = command.action === "view-add" ? extractPatientId(original) ?? command.query : undefined;
      const spokenSearch = command.action === "search" ? extractSearch(original) ?? extractSearch(text) ?? command.query : undefined;
      return actionFromCommand(command, spokenId || spokenSearch || undefined);
    }
  }

  const spokenId = extractPatientId(original);
  if (spokenId) {
    const leftover = stripped
      .replace(spokenId, " ")
      .replace(/\b(patient|id|number|view|add|and|open|insurance)\b/g, " ")
      .replace(/\s+/g, "")
      .trim();
    if (!leftover || looksLikeViewAdd(text)) {
      return { kind: "view-add", patientId: spokenId };
    }
  }

  const search = extractSearch(original) ?? extractSearch(text);
  if (search) {
    const rest = normalize(search);
    const patientSearch = /^(patient|patients|mareez|dardee)\s+(.+)/i.exec(rest);
    if (patientSearch?.[2]) {
      return { kind: "search-page", path: "/patient", query: patientSearch[2], label: "Patient Search" };
    }
    return { kind: "search", query: search };
  }

  for (const action of BUILTIN_ACTIONS) {
    if (action.aliases.some((alias) => matchAlias(stripped, alias) || matchAlias(text, alias))) {
      return { kind: action.kind };
    }
  }

  const ranked = BUILTIN_ROUTES.map((route) => {
    const hit = route.aliases.find((alias) => matchAlias(stripped, alias) || matchAlias(text, alias));
    return hit ? { route, score: normalize(hit).length } : null;
  })
    .filter((item): item is { route: (typeof BUILTIN_ROUTES)[number]; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score);

  if (ranked[0]) {
    return { kind: "navigate", path: ranked[0].route.path, label: ranked[0].route.label };
  }

  return { kind: "unknown" };
}

export function confirmPhrase(action: VoiceAction, lang: VoiceLang) {
  const en: Record<string, string> = {
    navigate: `Opening ${"label" in action ? action.label : "page"}`,
    search: `Searching ${"query" in action ? action.query : ""}`,
    "search-page": "Searching patients",
    refresh: "Refreshing",
    export: "Exporting",
    filter: "Opening filters",
    "clear-search": "Search cleared",
    back: "Going back",
    "add-patient": "Add patient",
    print: "Printing",
    logout: "Signing out",
    help: "Showing commands",
    "view-add": `Opening insurance for ${"patientId" in action && action.patientId ? action.patientId : "patient"}`,
    unknown: "Sorry, I did not understand",
  };
  void lang;
  return en[action.kind] ?? en.unknown;
}

export function emptyCommand(): Omit<ManagedVoiceCommand, "id" | "builtIn"> {
  return {
    phrase: "",
    extraPhrases: "",
    action: "navigate",
    path: "/dashboard",
    query: "",
    language: "all",
    enabled: true,
  };
}
