export type ExamKind = "has" | "need";

export type ProcButton = {
  code: string;
  label: string;
  ada?: string;
};

export type TxInsuranceRow = {
  id: string;
  speciality: string;
  company: string;
  plan: string;
  groupName: string;
  effectiveDate: string;
  type: string;
};

export type ExamRow = {
  id: string;
  kind: ExamKind;
  date: string;
  teeth: string;
  surface: string;
  button: string;
  ada: string;
  doctor: string;
  remarks: string;
};

export type PendingExam = {
  id: string;
  kind: ExamKind;
  option: string;
  teeth: string;
  surface: string;
  remarks: string;
  ada: string;
};

export const PERMANENT_UPPER = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
export const PERMANENT_LOWER = ["32", "31", "30", "29", "28", "27", "26", "25", "24", "23", "22", "21", "20", "19", "18", "17"];
export const PRIMARY_UPPER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const PRIMARY_LOWER = ["T", "S", "R", "Q", "P", "O", "N", "M", "L", "K"];
export const PERMANENT_ALL = [...PERMANENT_UPPER, ...PERMANENT_LOWER.slice().reverse()];
export const PRIMARY_ALL = [...PRIMARY_UPPER, ...PRIMARY_LOWER.slice().reverse()];

export type MouthArea = {
  id: string;
  label: string;
  title: string;
  permanent: string[];
  primary: string[];
  tone: "navy" | "green" | "red" | "gold";
};

function rangeNums(from: number, to: number) {
  const out: string[] = [];
  const step = from <= to ? 1 : -1;
  for (let n = from; step > 0 ? n <= to : n >= to; n += step) out.push(String(n));
  return out;
}

function letters(from: string, to: string) {
  const start = from.charCodeAt(0);
  const end = to.charCodeAt(0);
  const step = start <= end ? 1 : -1;
  const out: string[] = [];
  for (let c = start; step > 0 ? c <= end : c >= end; c += step) out.push(String.fromCharCode(c));
  return out;
}

export const UPPER_MOUTH_AREAS: MouthArea[] = [
  { id: "fm-top", label: "FULL MOUTH", title: "FULL MOUTH [00]", permanent: PERMANENT_ALL, primary: PRIMARY_ALL, tone: "navy" },
  { id: "fua", label: "FUA", title: "FULL UPPER ARCH [MAXILLARY ARCH-01]", permanent: rangeNums(1, 16), primary: letters("A", "J"), tone: "green" },
  { id: "urq", label: "URQ", title: "UPPER RIGHT QUADRANT [URQ-10]", permanent: rangeNums(1, 8), primary: letters("A", "E"), tone: "red" },
  { id: "urs", label: "URS", title: "UR SEXTANT [03]", permanent: rangeNums(1, 5), primary: letters("A", "B"), tone: "gold" },
  { id: "uas", label: "UAS", title: "UPPER ANTERIOR SEXTANT [04]", permanent: rangeNums(6, 11), primary: letters("C", "H"), tone: "gold" },
  { id: "uls", label: "ULS", title: "UL SEXTANT [05]", permanent: rangeNums(12, 16), primary: letters("I", "J"), tone: "gold" },
  { id: "ulq", label: "ULQ", title: "UPPER LEFT QUADRANT [ULQ-20]", permanent: rangeNums(9, 16), primary: letters("F", "J"), tone: "red" },
];

export const LOWER_MOUTH_AREAS: MouthArea[] = [
  { id: "lrq", label: "LRQ", title: "LOWER RIGHT QUADRANT [LRQ-40]", permanent: rangeNums(25, 32), primary: letters("P", "T"), tone: "red" },
  { id: "lrs", label: "LRS", title: "LR SEXTANT [08]", permanent: rangeNums(28, 32), primary: letters("S", "T"), tone: "gold" },
  { id: "las", label: "LAS", title: "LOWER ANTERIOR SEXTANT [07]", permanent: rangeNums(22, 27), primary: letters("M", "R"), tone: "gold" },
  { id: "lls", label: "LLS", title: "LL SEXTANT [06]", permanent: rangeNums(17, 21), primary: letters("K", "L"), tone: "gold" },
  { id: "llq", label: "LLQ", title: "LOWER LEFT QUADRANT [LLQ-30]", permanent: rangeNums(17, 24), primary: letters("K", "O"), tone: "red" },
  { id: "fla", label: "FLA", title: "FULL LOWER ARCH [MANDIBULAR ARCH-02]", permanent: rangeNums(17, 32), primary: letters("K", "T"), tone: "green" },
  { id: "fm-bot", label: "FULL MOUTH", title: "FULL MOUTH [00]", permanent: PERMANENT_ALL, primary: PRIMARY_ALL, tone: "navy" },
];

export const HAS_BUTTONS: ProcButton[] = [
  { code: "AMAL", label: "AMALGAM", ada: "D2140" },
  { code: "COMP", label: "COMPOSITE", ada: "D2391" },
  { code: "RCT", label: "RCT", ada: "D3330" },
  { code: "CORE", label: "CORE/CROWN", ada: "D2950" },
  { code: "CRN", label: "CROWN", ada: "D2740" },
  { code: "SEAL", label: "SEAL", ada: "D1351" },
  { code: "SPACE", label: "SPACE", ada: "D1510" },
  { code: "COMPEX", label: "COMP EX", ada: "D0150" },
  { code: "PERIOEX", label: "PERIO EX", ada: "D0180" },
  { code: "EVAC", label: "EVAC", ada: "D9110" },
  { code: "PAX", label: "PA XRAY", ada: "D0220" },
  { code: "2BW", label: "2BW XRAY", ada: "D0272" },
  { code: "4BW", label: "4BW XRAY", ada: "D0274" },
  { code: "PANO", label: "PANO", ada: "D0330" },
  { code: "CEPH", label: "CEPH", ada: "D0340" },
  { code: "PROA", label: "PROPHY ADULT", ada: "D1110" },
  { code: "PROC", label: "PROPHY CHILD", ada: "D1120" },
  { code: "SEALF2", label: "SEAL/F2", ada: "D1351" },
  { code: "OH", label: "OH", ada: "D1330" },
  { code: "SCORE", label: "SCORE", ada: "D0180" },
  { code: "PERIOM", label: "PERIO MAINT", ada: "D4910" },
  { code: "GBABY", label: "GREEN BABY", ada: "D1120" },
  { code: "RCTCRN", label: "RCT & CROWN", ada: "D3330" },
  { code: "EXTS", label: "EXT SIMP", ada: "D7140" },
  { code: "EXTU", label: "EXT SURG", ada: "D7210" },
  { code: "FL2", label: "FL2", ada: "D1206" },
  { code: "ONL", label: "ONLAY", ada: "D2644" },
  { code: "BGRAFT", label: "BONE GRAFT", ada: "D7953" },
  { code: "IMPL", label: "IMPLANT", ada: "D6010" },
  { code: "IMPMA", label: "IMP MAINT", ada: "D6080" },
  { code: "IMPAB", label: "IMP ABUT", ada: "D6056" },
  { code: "IMPCR", label: "IMP CROWN", ada: "D6058" },
  { code: "IMPDT", label: "IMP DENT", ada: "D6110" },
  { code: "FUD", label: "U DENTURE", ada: "D5110" },
  { code: "FLD", label: "L DENTURE", ada: "D5120" },
  { code: "URPD", label: "U PART DENT", ada: "D5213" },
  { code: "LRPD", label: "L PART DENT", ada: "D5214" },
  { code: "FPD", label: "FPD", ada: "D6240" },
  { code: "FPDAB", label: "FPD BRIDGE ABUT", ada: "D6750" },
  { code: "PONT", label: "FPD PONTIC", ada: "D6245" },
  { code: "VEN", label: "VEN", ada: "D2962" },
  { code: "PRESENT", label: "PRESENT" },
  { code: "OTHER", label: "OTHER" },
];

export const NEED_BUTTONS: ProcButton[] = [
  { code: "COMPEX", label: "COMP EX", ada: "D0150" },
  { code: "PERIOEX", label: "PERIO EX", ada: "D0180" },
  { code: "EVAC", label: "EVAC", ada: "D9110" },
  { code: "PAX", label: "PA XRAY", ada: "D0220" },
  { code: "2BW", label: "2BW XRAY", ada: "D0272" },
  { code: "4BW", label: "4BW XRAY", ada: "D0274" },
  { code: "PANO", label: "PANO", ada: "D0330" },
  { code: "CEPH", label: "CEPH", ada: "D0340" },
  { code: "PROA", label: "PROPHY ADULT", ada: "D1110" },
  { code: "PROC", label: "PROPHY CHILD", ada: "D1120" },
  { code: "SEAL", label: "SEAL", ada: "D1351" },
  { code: "OH", label: "OH", ada: "D1330" },
  { code: "SPACE", label: "SPACE", ada: "D1510" },
  { code: "AMAL", label: "AMALGAM", ada: "D2140" },
  { code: "COMP", label: "COMPOSITE", ada: "D2391" },
  { code: "PERIOM", label: "PERIO MAINT", ada: "D4910" },
  { code: "RCT", label: "RCT", ada: "D3330" },
  { code: "CORE", label: "CORE/CROWN", ada: "D2950" },
  { code: "CRN", label: "CROWN", ada: "D2740" },
  { code: "GBABY", label: "GREEN BABY", ada: "D1120" },
  { code: "RCTCRN", label: "RCT & CROWN", ada: "D3330" },
  { code: "EXTS", label: "EXT SIMP", ada: "D7140" },
  { code: "EXTU", label: "EXT SURG", ada: "D7210" },
  { code: "FL2", label: "FL2", ada: "D1206" },
  { code: "ONL", label: "ONLAY", ada: "D2644" },
  { code: "BGRAFT", label: "BONE GRAFT", ada: "D7953" },
  { code: "IMPL", label: "IMPLANT", ada: "D6010" },
  { code: "IMPMA", label: "IMP MAINT", ada: "D6080" },
  { code: "IMPAB", label: "IMP ABUT", ada: "D6056" },
  { code: "IMPCR", label: "IMP CROWN", ada: "D6058" },
  { code: "IMPDT", label: "IMP DENT", ada: "D6110" },
  { code: "FUD", label: "U DENTURE", ada: "D5110" },
  { code: "FLD", label: "L DENTURE", ada: "D5120" },
  { code: "URPD", label: "U PART DENT", ada: "D5213" },
  { code: "LRPD", label: "L PART DENT", ada: "D5214" },
  { code: "FPD", label: "FPD", ada: "D6240" },
  { code: "FPDAB", label: "FPD BRIDGE ABUT", ada: "D6750" },
  { code: "PONT", label: "FPD PONTIC", ada: "D6245" },
  { code: "VEN", label: "VEN", ada: "D2962" },
];

export const ADA_CODES: { code: string; desc: string; type: string }[] = [
  { code: "D0120", desc: "Periodic oral evaluation", type: "Exam" },
  { code: "D0150", desc: "Comprehensive oral evaluation", type: "Exam" },
  { code: "D0180", desc: "Comprehensive periodontal evaluation", type: "Exam" },
  { code: "D0220", desc: "Intraoral periapical first film", type: "X-Ray" },
  { code: "D0230", desc: "Intraoral periapical each additional", type: "X-Ray" },
  { code: "D0272", desc: "Bitewings two films", type: "X-Ray" },
  { code: "D0274", desc: "Bitewings four films", type: "X-Ray" },
  { code: "D0330", desc: "Panoramic film", type: "X-Ray" },
  { code: "D1110", desc: "Prophylaxis adult", type: "Hygiene" },
  { code: "D1120", desc: "Prophylaxis child", type: "Hygiene" },
  { code: "D1206", desc: "Topical fluoride varnish", type: "Hygiene" },
  { code: "D1351", desc: "Sealant per tooth", type: "Preventive" },
  { code: "D2140", desc: "Amalgam one surface", type: "Restorative" },
  { code: "D2391", desc: "Resin-based composite one surface posterior", type: "Restorative" },
  { code: "D2740", desc: "Crown porcelain/ceramic", type: "Restorative" },
  { code: "D2950", desc: "Core buildup including pins", type: "Restorative" },
  { code: "D3310", desc: "Endodontic therapy anterior", type: "Endo" },
  { code: "D3330", desc: "Endodontic therapy molar", type: "Endo" },
  { code: "D5110", desc: "Complete denture maxillary", type: "Prostho" },
  { code: "D5120", desc: "Complete denture mandibular", type: "Prostho" },
  { code: "D6010", desc: "Surgical placement of implant body", type: "Implant" },
  { code: "D7140", desc: "Extraction erupted tooth", type: "Oral Surgery" },
  { code: "D7210", desc: "Surgical extraction", type: "Oral Surgery" },
];

export const SURFACES = ["B/F", "M", "I/O", "D", "L"] as const;

export function toothImage(code: string) {
  return /^[A-T]$/.test(code) ? `/teeth/A-T/${code}.png` : `/teeth/1-32/${code}.png`;
}

export function formatTeeth(codes: string[]) {
  return codes.join(",");
}

export function parseTeeth(value: string) {
  return value.split(",").map((part) => part.trim()).filter(Boolean);
}

export function toggleToken(list: string, token: string, sep = ":") {
  const parts = list.split(sep).map((part) => part.trim()).filter(Boolean);
  const next = parts.includes(token) ? parts.filter((part) => part !== token) : [...parts, token];
  return next.join(sep);
}

export function todayMdY(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${date.getFullYear()}`;
}

export function ageFromDob(dob: string) {
  const match = dob.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return "";
  const born = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
  if (Number.isNaN(born.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  const monthDiff = now.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) years -= 1;
  return String(years);
}

export function seedInsurance(patientName: string, scheduledIns?: string): TxInsuranceRow[] {
  const cash: TxInsuranceRow = {
    id: "cash",
    speciality: "",
    company: "CASH",
    plan: "",
    groupName: "",
    effectiveDate: "",
    type: "",
  };
  if (scheduledIns && scheduledIns !== "(CASH)" && !scheduledIns.includes("CASH")) {
    return [
      {
        id: "ins-1",
        speciality: "GENERAL DENTISTRY",
        company: scheduledIns.replace(/\s*\(.*\)$/, "").trim() || scheduledIns,
        plan: scheduledIns,
        groupName: "",
        effectiveDate: "01-01-2024",
        type: "PRIMARY",
      },
      cash,
    ];
  }
  return [
    {
      id: "ins-1",
      speciality: "GENERAL DENTISTRY",
      company: "AMERIHEALTH CARITAS (MEDICAID)",
      plan: "AMERIHEALTH WELFARE MEDICAID",
      groupName: "",
      effectiveDate: "08-03-2024",
      type: "PRIMARY",
    },
    { ...cash, id: `cash-${patientName}` },
  ];
}

const SPEECH_NUM: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  "twenty one": "21",
  "twenty two": "22",
  "twenty three": "23",
  "twenty four": "24",
  "twenty five": "25",
  "twenty six": "26",
  "twenty seven": "27",
  "twenty eight": "28",
  "twenty nine": "29",
  thirty: "30",
  "thirty one": "31",
  "thirty two": "32",
};

const PROC_ALIASES: Record<string, string[]> = {
  AMAL: ["amalgam", "amal", "silver filling"],
  COMP: ["composite", "white filling", "comp filling"],
  RCT: ["rct", "root canal", "endo"],
  CORE: ["core crown", "core/crown", "core buildup", "core"],
  CRN: ["crown", "crn"],
  SEAL: ["sealant", "seal"],
  SPACE: ["space maintainer", "space"],
  COMPEX: ["comprehensive exam", "comp exam", "comp ex"],
  PERIOEX: ["perio exam", "periodontal exam", "perio ex"],
  EVAC: ["evac", "emergency"],
  PAX: ["pa xray", "pa x ray", "periapical", "pa"],
  "2BW": ["2bw xray", "2bw", "two bitewing", "two bitewings"],
  "4BW": ["4bw xray", "4bw", "four bitewing", "four bitewings"],
  PANO: ["pano", "panoramic"],
  CEPH: ["ceph", "cephalometric"],
  PROA: ["prophy adult", "adult prophy", "adult cleaning"],
  PROC: ["prophy child", "child prophy", "child cleaning"],
  SEALF2: ["seal f2", "seal/f2"],
  OH: ["oral hygiene", "oh"],
  SCORE: ["score"],
  PERIOM: ["perio maint", "perio maintenance", "periodontal maintenance"],
  GBABY: ["green baby"],
  RCTCRN: ["rct and crown", "rct crown", "root canal and crown"],
  EXTS: ["ext simp", "simple extraction", "extraction"],
  EXTU: ["ext surg", "surgical extraction"],
  FL2: ["fluoride", "fl2"],
  ONL: ["onlay"],
  BGRAFT: ["bone graft"],
  IMPL: ["implant"],
  IMPMA: ["imp maint", "implant maintenance"],
  IMPAB: ["imp abut", "implant abutment"],
  IMPCR: ["imp crown", "implant crown"],
  IMPDT: ["imp dent", "implant denture"],
  FUD: ["u denture", "upper denture"],
  FLD: ["l denture", "lower denture"],
  URPD: ["u part dent", "upper partial"],
  LRPD: ["l part dent", "lower partial"],
  FPD: ["fpd", "bridge"],
  FPDAB: ["fpd bridge abut", "bridge abutment"],
  PONT: ["fpd pontic", "pontic"],
  VEN: ["veneer", "ven"],
  PRESENT: ["present"],
  OTHER: ["other"],
};

function normalizeSpeech(text: string) {
  let next = text.toLowerCase();
  next = next.replace(/[_/.,-]+/g, " ");
  next = next.replace(/\bx[\s-]?ray/g, "xray");
  next = next.replace(/\bbite[\s-]?wings?\b/g, "bitewing");
  next = next.replace(/\broot[\s-]?canal\b/g, "rct");
  next = next.replace(/\bperiapical\b/g, "pa xray");
  next = next.replace(/\bprophylaxis\b/g, "prophy");
  next = next.replace(/\bd\s*0?\s*(\d)\s*(\d)\s*(\d)\s*(\d)\b/g, "d0$1$2$3$4");
  Object.entries(SPEECH_NUM)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([word, num]) => {
      next = next.replace(new RegExp(`\\b${word}\\b`, "g"), num);
    });
  return next.replace(/\s+/g, " ").trim();
}

function hasSpeechPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(text);
}

function extractSpeechTeeth(text: string) {
  const found = new Set<string>();
  const regex = /\b(?:tooth|teeth|number|#)\s+((?:[a-t]|[1-9]|[12]\d|3[0-2])(?:\s*(?:,|and)?\s*(?:[a-t]|[1-9]|[12]\d|3[0-2]))*)/gi;
  let match = regex.exec(text);
  while (match) {
    const tokens = match[1].match(/\b(?:[1-9]|[12]\d|3[0-2]|[a-t])\b/gi) ?? [];
    tokens.forEach((token) => found.add(token.toUpperCase()));
    match = regex.exec(text);
  }
  return Array.from(found);
}

function extractSpeechSurfaces(text: string) {
  const map: Array<[RegExp, string]> = [
    [/\b(mesial| m )\b/, "M"],
    [/\b(distal| d )\b/, "D"],
    [/\b(buccal|facial|b\/f| b | f )\b/, "B/F"],
    [/\b(lingual|palatal| l )\b/, "L"],
    [/\b(occlusal|incisal|i\/o| o | i )\b/, "I/O"],
  ];
  const padded = ` ${text} `;
  const surfaces: string[] = [];
  map.forEach(([pattern, value]) => {
    if (pattern.test(padded) && !surfaces.includes(value)) surfaces.push(value);
  });
  return surfaces;
}

export function parseTxSpeech(spoken: string, buttons: ProcButton[]) {
  const text = normalizeSpeech(spoken);
  const teeth = extractSpeechTeeth(text);
  const surfaces = extractSpeechSurfaces(text);
  const scored = buttons
    .map((button) => {
      const phrases = [
        button.label,
        button.code,
        button.ada ?? "",
        ...(PROC_ALIASES[button.code] ?? []),
      ]
        .map((phrase) => normalizeSpeech(phrase))
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
      const hit = phrases.find((phrase) => hasSpeechPhrase(text, phrase));
      return hit ? { button, score: hit.length } : null;
    })
    .filter((item): item is { button: ProcButton; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score);

  const matched: ProcButton[] = [];
  scored.forEach((item) => {
    if (!matched.some((button) => button.code === item.button.code)) matched.push(item.button);
  });

  return { text, teeth, surfaces, buttons: matched };
}

export function seedExistingExams(patientId: string, doctor: string): ExamRow[] {
  const rows: Array<Pick<ExamRow, "date" | "teeth" | "button" | "ada" | "remarks">> = [
    { date: "08-15-2024", teeth: "", button: "PA XRAY", ada: "D0220", remarks: "HYGIENE" },
    { date: "08-15-2024", teeth: "8", button: "PA XRAY", ada: "D0220", remarks: "HYGIENE" },
    { date: "08-15-2024", teeth: "11", button: "PA XRAY", ada: "D0230", remarks: "HYGIENE" },
    { date: "08-10-2024", teeth: "10", button: "PA XRAY", ada: "D0230", remarks: "HYGIENE" },
    { date: "08-21-2024", teeth: "11", button: "PA XRAY", ada: "D0230", remarks: "HYGIENE" },
    { date: "08-19-2024", teeth: "25", button: "PA XRAY", ada: "D0230", remarks: "HYGIENE" },
  ];
  return rows.map((row, index) => ({
    id: `${patientId}-has-${index + 1}`,
    kind: "has" as const,
    surface: "",
    doctor,
    ...row,
  }));
}
