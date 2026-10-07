import { useMemo, useState } from "react";
import { Play } from "lucide-react";

type Tone = "green" | "blue" | "purple" | "red" | "gray";

type DoctorRow = {
  name: string;
  count: number;
};

type OfficeRow = {
  id: string;
  name: string;
  count: number;
  tone: Tone;
  doctors: DoctorRow[];
};

const offices: OfficeRow[] = [
  {
    id: "smile-os-3000",
    name: "SMILE KRAFTER GD-OS-3000",
    count: 107,
    tone: "green",
    doctors: [
      { name: "DR. ROLLINS THOMAS", count: 42 },
      { name: "DR. SMITH PATEL", count: 35 },
      { name: "DR. KHAN AMIRA", count: 30 },
    ],
  },
  {
    id: "smile-pedo-3033",
    name: "SMILE KRAFTER PEDO-3033",
    count: 50,
    tone: "green",
    doctors: [
      { name: "DR. LEE SOPHIA", count: 28 },
      { name: "DR. MARTINEZ JULIO", count: 22 },
    ],
  },
  {
    id: "loretto-1044",
    name: "LORETTO AVE GD-OS-1044",
    count: 34,
    tone: "blue",
    doctors: [
      { name: "DR. GHERCA ROXANA", count: 20 },
      { name: "DR. FEJZIEJ BALA", count: 14 },
    ],
  },
  {
    id: "signature-gd-1044",
    name: "SIGNATURE SMILE-GD-1044",
    count: 24,
    tone: "blue",
    doctors: [
      { name: "DR. PATEL ANIKA", count: 14 },
      { name: "DR. BROWN JAMES", count: 10 },
    ],
  },
  {
    id: "bensalem-2000",
    name: "BENSALEM-GD-2000",
    count: 23,
    tone: "blue",
    doctors: [
      { name: "DR. WILLIAMS KATE", count: 13 },
      { name: "DR. NGUYEN MINH", count: 10 },
    ],
  },
  {
    id: "morton-ms",
    name: "MORTON-GD-MS",
    count: 21,
    tone: "blue",
    doctors: [{ name: "DR. COHEN DAVID", count: 21 }],
  },
  {
    id: "doylestown-1044",
    name: "DOYLESTOWN-GD-1044",
    count: 20,
    tone: "purple",
    doctors: [
      { name: "DR. SINGH PRIYA", count: 12 },
      { name: "DR. ADAMS RYAN", count: 8 },
    ],
  },
  {
    id: "harleysville-1044",
    name: "HARLEYSVILLE-GD-1044",
    count: 18,
    tone: "red",
    doctors: [{ name: "DR. FOSTER LISA", count: 18 }],
  },
  {
    id: "signature-os-2044",
    name: "SIGNATURE SMILE-OS-2044",
    count: 18,
    tone: "purple",
    doctors: [
      { name: "DR. ALI HASSAN", count: 10 },
      { name: "DR. PARK JENNIFER", count: 8 },
    ],
  },
  {
    id: "olney-gd",
    name: "OLNEY AVENUE-GD",
    count: 18,
    tone: "purple",
    doctors: [{ name: "DR. THOMAS ERIC", count: 18 }],
  },
  {
    id: "exton-6000",
    name: "EXTON-GD-MS-6000",
    count: 15,
    tone: "green",
    doctors: [{ name: "DR. RIVERA MARIA", count: 15 }],
  },
  {
    id: "chalfont-gd",
    name: "CHALFONT-GD",
    count: 13,
    tone: "green",
    doctors: [{ name: "DR. WALSH BRIAN", count: 13 }],
  },
];

const toneClass: Record<Tone, string> = {
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-sky-100 text-sky-700",
  purple: "bg-violet-100 text-violet-700",
  red: "bg-rose-100 text-rose-600",
  gray: "bg-slate-100 text-slate-600",
};

function CountBadge({ count, tone }: { count: number; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums ${toneClass[tone]}`}
    >
      {count}
    </span>
  );
}

function formatScheduleDate(date: Date) {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");
  return `${month} ${day}, ${date.getFullYear()}`;
}

export function TodayScheduleOverview() {
  const [openIds, setOpenIds] = useState<string[]>(["loretto-1044"]);
  const total = useMemo(() => offices.reduce((sum, office) => sum + office.count, 0), []);
  const todayLabel = useMemo(() => formatScheduleDate(new Date()), []);

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <div className="panel flex flex-col min-w-0 min-h-0">
      <div className="panel-header">
        <div className="panel-title">Today's Schedule</div>
        <div className="text-[10px] text-muted-foreground whitespace-nowrap">{todayLabel}</div>
      </div>

      <div className="p-2 flex flex-col gap-1.5 overflow-auto">
        {offices.map((office, index) => {
          const open = openIds.includes(office.id);
          return (
            <div key={office.id} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => toggle(office.id)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-[3px] bg-transparent border border-transparent hover:bg-secondary hover:border-border cursor-pointer text-left"
              >
                <Play
                  className={`w-2.5 h-2.5 text-muted-foreground fill-current shrink-0 transition-transform ${
                    open ? "rotate-90" : ""
                  }`}
                />
                <span className="w-4 text-[12px] text-muted-foreground tabular-nums shrink-0">
                  {index + 1}
                </span>
                <span className="flex-1 min-w-0 truncate text-[12px] text-foreground font-medium leading-snug uppercase">
                  {office.name}
                </span>
                <CountBadge count={office.count} tone={office.tone} />
              </button>

              {open &&
                office.doctors.map((doctor) => (
                  <div
                    key={doctor.name}
                    className="flex items-center gap-2 pl-8 pr-2 py-2 rounded-[3px] border border-transparent hover:bg-secondary hover:border-border"
                  >
                    <span className="flex-1 min-w-0 truncate text-[12px] text-foreground font-medium leading-snug uppercase">
                      {doctor.name}
                    </span>
                    <CountBadge count={doctor.count} tone="gray" />
                  </div>
                ))}
            </div>
          );
        })}

        <div className="flex items-center justify-between px-2 py-2 rounded-[3px] border border-transparent hover:bg-secondary hover:border-border">
          <div className="text-[12px] text-foreground font-medium leading-snug">Total</div>
          <CountBadge count={total} tone="gray" />
        </div>
      </div>
    </div>
  );
}
