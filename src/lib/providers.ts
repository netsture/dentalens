export type Provider = {
  id: string;
  no: number;
  type: string;
  name: string;
  npi: string;
  patientCount: number;
  status: "Active";
  aliases?: string[];
};

export type DoctorScheduleRow = {
  id: string;
  providerId: string;
  no: number;
  patientId: string;
  patientName: string;
  gender: string;
  dob: string;
  age: string;
  checkIn: string;
  chair: string;
  status: string;
  realtimeAction: string;
  examTx: string;
  eodVerify: string;
  insurance: string;
  insuranceDetail?: string;
  oralSurgeryIns: string;
  alert?: boolean;
};

export const providers: Provider[] = [
  { id: "p1", no: 1, type: "Doctor", name: "Delozier Amee (Savani 1)", npi: "1678901234", patientCount: 2, status: "Active", aliases: ["delozier amee", "amee delozier", "savani 1", "savani one"] },
  { id: "p2", no: 2, type: "Doctor", name: "Thomas Jasmine", npi: "1567890123", patientCount: 3, status: "Active", aliases: ["thomas jasmine", "jasmine thomas"] },
  { id: "p3", no: 3, type: "Doctor", name: "Patel Khushmbu", npi: "1456789012", patientCount: 1, status: "Active", aliases: ["patel khushmbu", "khushmbu patel", "khushbu patel"] },
  {
    id: "p4",
    no: 4,
    type: "Doctor",
    name: "Savani Niranjan",
    npi: "1780067529",
    patientCount: 0,
    status: "Active",
    aliases: [
      "savani niranjan",
      "niranjan savani",
      "shivani niranjan",
      "sivani niranjan",
      "sawani niranjan",
      "savani nirnjan",
      "shivani nirnjan",
    ],
  },
  { id: "p5", no: 5, type: "Doctor", name: "Parasana Pratyush", npi: "1345678901", patientCount: 0, status: "Active", aliases: ["parasana pratyush", "pratyush parasana"] },
];

export const doctorSchedule: DoctorScheduleRow[] = [
  {
    id: "s1",
    providerId: "p1",
    no: 1,
    patientId: "17001",
    patientName: "JOHNSONN ELLA",
    gender: "Female",
    dob: "02-27-2012",
    age: "14 YRS",
    checkIn: "09:00 AM",
    chair: "1",
    status: "Confirmed",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s2",
    providerId: "p1",
    no: 2,
    patientId: "17002",
    patientName: "BRAKE ZOIEY",
    gender: "Female",
    dob: "08-28-2012",
    age: "14 YRS",
    checkIn: "09:30 AM",
    chair: "2",
    status: "Waiting",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
  },
  {
    id: "s3",
    providerId: "p2",
    no: 1,
    patientId: "854924",
    patientName: "MURTHY LYDIA",
    gender: "Female",
    dob: "05-20-1964",
    age: "62 YRS",
    checkIn: "04:05 PM",
    chair: "2",
    status: "Checking Out",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s4",
    providerId: "p2",
    no: 2,
    patientId: "854760",
    patientName: "CROSSON RHONDA",
    gender: "Female",
    dob: "10-19-1975",
    age: "50 YRS",
    checkIn: "03:53 PM",
    chair: "3",
    status: "Checkout Completed",
    realtimeAction: "AFTER C/OUT PROC",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s5",
    providerId: "p2",
    no: 3,
    patientId: "851982",
    patientName: "JOHNSON",
    gender: "Female",
    dob: "03-12-1984",
    age: "42 YRS",
    checkIn: "02:16 PM",
    chair: "2",
    status: "Checkout Completed",
    realtimeAction: "AFTER C/OUT PROC",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "FIDELIO INSURANCE COMPANY (PPO)",
    insuranceDetail: "[PRIMARY-AS SELF] AVL: $1,462.00",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s6",
    providerId: "p3",
    no: 1,
    patientId: "17005",
    patientName: "DELGADO GENESIS",
    gender: "Female",
    dob: "03-03-2010",
    age: "16 YRS",
    checkIn: "11:10 AM",
    chair: "4",
    status: "New",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
  },
];

export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}

export function getProviderSchedule(providerId: string) {
  return doctorSchedule.filter((row) => row.providerId === providerId);
}

export function getSchedulePatient(patientId: string) {
  return doctorSchedule.find((row) => row.patientId === patientId);
}

const SPOKEN_SKIP = new Set([
  "doctor",
  "doctors",
  "provider",
  "providers",
  "dr",
  "screen",
  "page",
  "list",
  "daily",
  "the",
  "a",
  "an",
  "open",
  "opening",
  "opened",
  "go",
  "going",
  "show",
  "showing",
  "display",
  "displaying",
  "launch",
  "launching",
]);
const SPOKEN_DIGITS: Record<string, string> = {
  zero: "0",
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

function normalizeSpoken(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"`~()/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function spokenTokens(text: string) {
  return normalizeSpoken(text)
    .split(" ")
    .map((token) => SPOKEN_DIGITS[token] ?? token)
    .filter((token) => token && !SPOKEN_SKIP.has(token));
}

function providerTokens(name: string) {
  return normalizeSpoken(name).split(" ").filter(Boolean);
}

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, (_, i) => {
    const row = new Array<number>(cols);
    row[0] = i;
    return row;
  });
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[rows - 1][cols - 1];
}

function phonetic(token: string) {
  return token
    .replace(/shi/g, "si")
    .replace(/^sh/, "s")
    .replace(/ph/g, "f")
    .replace(/w/g, "v")
    .replace(/aa/g, "a")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u");
}

function tokensClose(a: string, b: string) {
  if (a === b) return true;
  const pa = phonetic(a);
  const pb = phonetic(b);
  if (pa === pb) return true;
  if (a.length >= 4 && (b.includes(a) || pb.includes(pa))) return true;
  if (b.length >= 4 && (a.includes(b) || pa.includes(pb))) return true;
  const maxLen = Math.max(a.length, b.length, pa.length, pb.length);
  if (maxLen < 4) return false;
  const allowed = maxLen <= 5 ? 1 : 3;
  return levenshtein(a, b) <= allowed || levenshtein(pa, pb) <= allowed;
}

export function providerDisplayName(name: string) {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function phraseClose(spoken: string, phrase: string) {
  const a = normalizeSpoken(spoken);
  const b = normalizeSpoken(phrase);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const aTokens = spokenTokens(a);
  const bTokens = spokenTokens(b);
  if (!aTokens.length || aTokens.length !== bTokens.length) return false;
  return aTokens.every((token, index) => tokensClose(token, bTokens[index]));
}

export function findProviderBySpokenName(spoken: string): Provider | null {
  const query = spokenTokens(spoken);
  if (!query.length) return null;

  const spokenPhrase = query.join(" ");
  const aliasHit = providers.find((provider) =>
    [providerDisplayName(provider.name), provider.name, ...(provider.aliases ?? [])].some((phrase) => phraseClose(spokenPhrase, phrase) || phraseClose(spoken, phrase))
  );
  if (aliasHit) return aliasHit;

  let best: { provider: Provider; score: number } | null = null;
  for (const provider of providers) {
    const names = [...providerTokens(provider.name), ...(provider.aliases ?? []).flatMap((alias) => providerTokens(alias))];
    if (!names.length) continue;
    const used = new Set<number>();
    let score = 0;
    let matched = 0;
    for (const token of query) {
      let found = -1;
      for (let i = 0; i < names.length; i++) {
        if (used.has(i) || !tokensClose(token, names[i])) continue;
        found = i;
        break;
      }
      if (found < 0) continue;
      used.add(found);
      matched += 1;
      score += token.length + (token === names[found] ? 2 : 0);
      if (found === 0) score += 8;
    }
    if (!matched) continue;
    score -= (query.length - matched) * 6;
    if (query.length >= 2 && matched < 2 && query.every((token) => token.length <= 3)) continue;
    if (query.length === 1 && matched === 1 && query[0].length < 4) continue;
    if (!best || score > best.score) best = { provider, score };
  }

  return best?.provider ?? null;
}
