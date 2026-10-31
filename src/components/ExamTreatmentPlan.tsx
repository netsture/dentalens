import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  FilterX,
  Mic,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { exportToExcel } from "@/lib/exportToExcel";
import {
  ADA_CODES,
  HAS_BUTTONS,
  LOWER_MOUTH_AREAS,
  NEED_BUTTONS,
  PRIMARY_LOWER,
  PRIMARY_UPPER,
  PERMANENT_LOWER,
  PERMANENT_UPPER,
  UPPER_MOUTH_AREAS,
  formatTeeth,
  parseTxSpeech,
  SURFACES,
  seedExistingExams,
  seedInsurance,
  todayMdY,
  toggleToken,
  toothImage,
  type ExamKind,
  type ExamRow,
  type MouthArea,
  type PendingExam,
  type ProcButton,
} from "@/lib/treatmentPlan";

type SortDir = "asc" | "desc";
type ExamSortKey = "date" | "teeth" | "surface" | "button" | "doctor" | "remarks";

const EXAM_COLUMNS: { key: ExamSortKey; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "teeth", label: "Tooth Number(s) or Letter(s)" },
  { key: "surface", label: "Tooth Surface" },
  { key: "button", label: "Tx. Button" },
  { key: "doctor", label: "Doctor" },
  { key: "remarks", label: "Remarks" },
];

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRec(): SpeechRec | null {
  const Ctor =
    (window as Window & { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec })
      .SpeechRecognition ||
    (window as Window & { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
  return dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
}

function SurfacePad({
  value,
  onToggle,
}: {
  value: string;
  onToggle: (surface: string) => void;
}) {
  const active = new Set(value.split(":").filter(Boolean));
  const cell = (label: string, extra = "") => (
    <button
      type="button"
      className={`tx-surface-btn ${active.has(label) ? "is-on" : ""} ${extra}`}
      onClick={() => onToggle(label)}
    >
      {label}
    </button>
  );
  return (
    <div className="tx-surface-pad">
      <div />
      {cell("B/F")}
      <div />
      {cell("M")}
      {cell("I/O")}
      {cell("D")}
      <div />
      {cell("L")}
      <div />
    </div>
  );
}

function Tooth({
  code,
  selected,
  onClick,
}: {
  code: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`tx-tooth ${selected ? "is-on" : ""}`} title={`Tooth ${code}`} onClick={onClick}>
      <img src={toothImage(code)} alt={code} />
      <span>{code}</span>
    </button>
  );
}

function MouthButtons({
  areas,
  onPick,
}: {
  areas: MouthArea[];
  onPick: (area: MouthArea) => void;
}) {
  return (
    <div className="tx-mouth-row">
      {areas.map((area) => (
        <button
          key={area.id}
          type="button"
          title={area.title}
          className={`tx-mouth-btn tone-${area.tone}`}
          onClick={() => onPick(area)}
        >
          {area.label}
        </button>
      ))}
    </div>
  );
}

function ProcGrid({
  buttons,
  kind,
  onPick,
}: {
  buttons: ProcButton[];
  kind: ExamKind;
  onPick: (button: ProcButton) => void;
}) {
  return (
    <div className="tx-chip-grid">
      {buttons.map((button) => (
        <button
          key={`${kind}-${button.code}`}
          type="button"
          title={button.ada ? `${button.label} · ${button.ada}` : button.label}
          className={kind === "has" ? "tx-chip-has" : "tx-chip-need"}
          onClick={() => onPick(button)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

export function ExamTreatmentPlan({
  patientId,
  patientName,
  doctorName,
  insuranceLabel,
}: {
  patientId: string;
  patientName: string;
  doctorName: string;
  insuranceLabel?: string;
}) {
  const [planId, setPlanId] = useState("ins-1");
  const [multiTooth, setMultiTooth] = useState(false);
  const [showPrimary, setShowPrimary] = useState(true);
  const [showPermanent, setShowPermanent] = useState(true);
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [hasSurface, setHasSurface] = useState("");
  const [needSurface, setNeedSurface] = useState("");
  const [hasProc, setHasProc] = useState("");
  const [needProc, setNeedProc] = useState("");
  const [adaCode, setAdaCode] = useState("");
  const [pending, setPending] = useState<PendingExam[]>([]);
  const [rows, setRows] = useState<ExamRow[]>(() => seedExistingExams(patientId, doctorName));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [combine, setCombine] = useState(false);
  const [q, setQ] = useState("");
  const [insSort, setInsSort] = useState<{ key: "speciality" | "company" | "plan" | "groupName" | "effectiveDate" | "type"; dir: SortDir }>({
    key: "type",
    dir: "asc",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [colFilter, setColFilter] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: ExamSortKey; dir: SortDir }>({ key: "date", dir: "desc" });
  const [refreshing, setRefreshing] = useState(false);
  const [adaOpen, setAdaOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [listenKind, setListenKind] = useState<ExamKind | null>(null);
  const [speechText, setSpeechText] = useState("");
  const recRef = useRef<SpeechRec | null>(null);
  const listenKindRef = useRef<ExamKind | null>(null);
  const applySpeechRef = useRef<(kind: ExamKind, spoken: string) => void>(() => {});

  const insurance = useMemo(() => {
    const rows = seedInsurance(patientName, insuranceLabel);
    const dir = insSort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => String(a[insSort.key] ?? "").localeCompare(String(b[insSort.key] ?? "")) * dir);
  }, [patientName, insuranceLabel, insSort]);

  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(() => setAlert(null), 3200);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const teethValue = formatTeeth(selectedTeeth);

  const toggleTooth = (code: string) => {
    setSelectedTeeth((current) => {
      if (multiTooth) {
        return current.includes(code) ? current.filter((item) => item !== code) : [...current, code];
      }
      return current.length === 1 && current[0] === code ? [] : [code];
    });
  };

  const pickMouth = (area: MouthArea) => {
    const group = [...(showPermanent ? area.permanent : []), ...(showPrimary ? area.primary : [])];
    setSelectedTeeth((current) => {
      if (!multiTooth) return group;
      const set = new Set(current);
      const allOn = group.every((code) => set.has(code));
      if (allOn) group.forEach((code) => set.delete(code));
      else group.forEach((code) => set.add(code));
      return Array.from(set);
    });
  };

  const clearTeeth = () => {
    setSelectedTeeth([]);
    setHasSurface("");
    setNeedSurface("");
  };

  const addPending = (
    kind: ExamKind,
    option: string,
    ada = "",
    override?: { teeth?: string; surface?: string }
  ) => {
    const teeth = override?.teeth ?? teethValue;
    if (!teeth) {
      setAlert({ type: "error", text: "Please select the tooth first, or say the tooth number." });
      return false;
    }
    const surface = override?.surface ?? (kind === "has" ? hasSurface : needSurface);
    setPending((current) => [
      ...current,
      {
        id: `${kind}-${Date.now()}-${current.length}`,
        kind,
        option,
        teeth,
        surface,
        remarks: "",
        ada,
      },
    ]);
    return true;
  };

  const pickProc = (kind: ExamKind, button: ProcButton) => {
    if (kind === "has") setHasProc(button.code);
    else setNeedProc(button.code);
    addPending(kind, button.label, button.ada ?? "");
  };

  const applySpeechTx = (kind: ExamKind, spoken: string) => {
    const buttons = kind === "has" ? HAS_BUTTONS : NEED_BUTTONS;
    const parsed = parseTxSpeech(spoken, buttons);
    if (parsed.teeth.length) setSelectedTeeth(parsed.teeth);
    if (parsed.surfaces.length) {
      const joined = parsed.surfaces.join(":");
      if (kind === "has") setHasSurface(joined);
      else setNeedSurface(joined);
    }

    const teeth = formatTeeth(parsed.teeth.length ? parsed.teeth : selectedTeeth);
    const surface = parsed.surfaces.length ? parsed.surfaces.join(":") : kind === "has" ? hasSurface : needSurface;

    if (parsed.buttons.length === 0) {
      if (parsed.teeth.length) {
        setAlert({ type: "ok", text: `Tooth ${teeth} selected. Speak a procedure.` });
        return;
      }
      setAlert({
        type: "error",
        text: `No matching ${kind === "has" ? "Exam/Existing/Has" : "Need"} item for "${spoken}".`,
      });
      return;
    }

    const added = parsed.buttons.filter((button) => {
      if (kind === "has") setHasProc(button.code);
      else setNeedProc(button.code);
      return addPending(kind, button.label, button.ada ?? "", { teeth, surface });
    });
    if (added.length) {
      setAlert({ type: "ok", text: `Added ${added.map((button) => button.label).join(", ")}.` });
    }
  };
  applySpeechRef.current = applySpeechTx;

  const stopTxSpeech = () => {
    listenKindRef.current = null;
    setListenKind(null);
    recRef.current?.abort();
    recRef.current = null;
  };

  const startTxSpeech = (kind: ExamKind) => {
    if (listenKind === kind) {
      stopTxSpeech();
      return;
    }
    const rec = getSpeechRec();
    if (!rec) {
      setAlert({ type: "error", text: "Speech recognition is not supported in this browser." });
      return;
    }
    recRef.current?.abort();
    rec.lang = localStorage.getItem("dentsaas-voice-lang") || "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (!last) return;
      const spoken = last[0].transcript.trim();
      setSpeechText(spoken);
      if (last.isFinal && listenKindRef.current) applySpeechRef.current(listenKindRef.current, spoken);
    };
    rec.onerror = (event) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setAlert({ type: "error", text: `Speech error: ${event.error}` });
      }
      stopTxSpeech();
    };
    rec.onend = () => {
      if (listenKindRef.current === kind && recRef.current === rec) {
        try {
          rec.start();
        } catch {
          stopTxSpeech();
        }
      }
    };
    recRef.current = rec;
    listenKindRef.current = kind;
    setListenKind(kind);
    setSpeechText("");
    rec.start();
  };

  useEffect(() => () => recRef.current?.abort(), []);

  const submitSelection = () => {
    if (pending.length === 0) {
      setAlert({ type: "error", text: "Please select at least one Exam/Existing/Has or Need option." });
      return;
    }
    const next: ExamRow[] = pending.map((item, index) => ({
      id: `${patientId}-${item.kind}-${Date.now()}-${index}`,
      kind: item.kind,
      date: todayMdY(),
      teeth: item.teeth,
      surface: item.surface,
      button: item.option,
      ada: item.ada,
      doctor: doctorName,
      remarks: item.remarks,
    }));
    setRows((current) => [...next, ...current]);
    setPending([]);
    clearTeeth();
    setHasProc("");
    setNeedProc("");
    setAdaCode("");
    setAlert({ type: "ok", text: "Selection submitted to Exam / Need tables." });
  };

  const applyAda = () => {
    const found = ADA_CODES.find((item) => item.code === adaCode);
    if (!found) {
      setAlert({ type: "error", text: "Please choose an ADA code." });
      return;
    }
    addPending("need", `${found.code} ${found.desc}`, found.code);
    setAdaOpen(false);
  };

  const updatePending = (id: string, patch: Partial<PendingExam>) => {
    setPending((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const visibleRows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const blob = [row.date, row.teeth, row.surface, row.button, row.ada, row.doctor, row.remarks]
        .join(" ")
        .toLowerCase();
      if (query && !blob.includes(query)) return false;
      return EXAM_COLUMNS.every((col) => {
        const filter = colFilter[col.key]?.trim().toLowerCase();
        if (!filter) return true;
        return String(row[col.key] ?? "").toLowerCase().includes(filter);
      });
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true }) * dir);
  }, [rows, q, colFilter, sort]);

  const hasRows = visibleRows.filter((row) => row.kind === "has");
  const needRows = visibleRows.filter((row) => row.kind === "need");
  const tableRows = combine ? visibleRows : null;

  const toggleSort = (key: ExamSortKey) => {
    setSort((current) => (current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAll = (list: ExamRow[]) => {
    const ids = list.map((row) => row.id);
    const allOn = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds((current) => (allOn ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids]))));
  };

  const deleteSelected = (scope: ExamRow[]) => {
    const ids = selectedIds.filter((id) => scope.some((row) => row.id === id));
    if (ids.length === 0) {
      setAlert({ type: "error", text: "Select at least one row to delete." });
      return;
    }
    setRows((current) => current.filter((row) => !ids.includes(row.id)));
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setAlert({ type: "ok", text: `${ids.length} row(s) deleted.` });
  };

  const makePlan = () => {
    const ids = selectedIds.filter((id) => rows.some((row) => row.id === id && row.kind === "need"));
    const source = ids.length > 0 ? ids : needRows.map((row) => row.id);
    if (source.length === 0) {
      setAlert({ type: "error", text: "Select at least one Need item to make a treatment plan." });
      return;
    }
    setAlert({ type: "ok", text: `Treatment plan created from ${source.length} Need item(s).` });
  };

  const handleExport = () => {
    exportToExcel(
      `exam-txplan-${patientId}.xls`,
      ["Type", "Date", "Tooth", "Surface", "Tx Button", "ADA", "Doctor", "Remarks"],
      visibleRows.map((row) => [
        row.kind === "has" ? "Exam/Existing/Has" : "Need",
        row.date,
        row.teeth,
        row.surface,
        row.button,
        row.ada,
        row.doctor,
        row.remarks,
      ]),
      "Exam Tx Plan"
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setQ("");
      setColFilter({});
      setRefreshing(false);
    }, 250);
  };

  const renderExamTable = (list: ExamRow[], empty: string) => (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 28 }}>
              <input
                type="checkbox"
                checked={list.length > 0 && list.every((row) => selectedIds.includes(row.id))}
                onChange={() => toggleAll(list)}
              />
            </th>
            {EXAM_COLUMNS.map((col) => (
              <th key={col.key}>
                <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort(col.key)}>
                  {col.label}
                  <SortIcon active={sort.key === col.key} dir={sort.dir} />
                </button>
              </th>
            ))}
            <th>Actions</th>
          </tr>
          {filtersOpen ? (
            <tr>
              <th />
              {EXAM_COLUMNS.map((col) => (
                <th key={`f-${col.key}`}>
                  <input
                    className="w-full border border-border rounded-sm px-1 py-0.5 bg-card"
                    value={colFilter[col.key] ?? ""}
                    onChange={(event) => setColFilter((current) => ({ ...current, [col.key]: event.target.value }))}
                  />
                </th>
              ))}
              <th>
                <button type="button" className="btn" onClick={() => setColFilter({})}>
                  <FilterX className="w-3 h-3" />
                </button>
              </th>
            </tr>
          ) : null}
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-muted-foreground">
                {empty}
              </td>
            </tr>
          ) : (
            list.map((row) => (
              <tr key={row.id}>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} />
                </td>
                <td>{row.date}</td>
                <td>{row.teeth || "—"}</td>
                <td>{row.surface || "—"}</td>
                <td>
                  {row.button}
                  {row.ada ? ` (${row.ada})` : ""}
                </td>
                <td>{row.doctor}</td>
                <td>
                  <input
                    className="w-full border border-border rounded-sm px-1 py-0.5 bg-card"
                    value={row.remarks}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((item) => (item.id === row.id ? { ...item, remarks: event.target.value } : item))
                      )
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn"
                    title="Delete"
                    onClick={() => {
                      setRows((current) => current.filter((item) => item.id !== row.id));
                      setSelectedIds((current) => current.filter((id) => id !== row.id));
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="tx-exam">
      {alert ? (
        <div
          className={`fixed top-14 right-3 z-[4000] flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-sm min-w-[240px] text-[length:var(--density-font)] ${
            alert.type === "error"
              ? "bg-red-50 text-red-600 border-red-100"
              : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}
        >
          {alert.type === "error" ? (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{alert.text}</span>
        </div>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="panel-header">
          <h3 className="panel-title">Insurance Information</h3>
        </div>
        <div className="p-2">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Select</th>
                  {([
                    ["speciality", "Speciality"],
                    ["company", "Insurance Company"],
                    ["plan", "Insurance Plan"],
                    ["groupName", "Group Name"],
                    ["effectiveDate", "Effective Date"],
                    ["type", "Type"],
                  ] as const).map(([key, label]) => (
                    <th key={key}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={() =>
                          setInsSort((current) =>
                            current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
                          )
                        }
                      >
                        {label}
                        <SortIcon active={insSort.key === key} dir={insSort.dir} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {insurance.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="radio"
                        name="tx-plan"
                        checked={planId === row.id}
                        onChange={() => setPlanId(row.id)}
                      />
                    </td>
                    <td>{row.speciality || "—"}</td>
                    <td>{row.company}</td>
                    <td>{row.plan || "—"}</td>
                    <td>{row.groupName || "—"}</td>
                    <td>{row.effectiveDate || "—"}</td>
                    <td>{row.type || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="tx-work">
        <aside className="panel p-2 tx-chart">
          <div className="flex items-center justify-between mb-1">
            <button type="button" className="tx-mouth-area">
              Mouth Area
            </button>
          </div>
          <MouthButtons areas={UPPER_MOUTH_AREAS} onPick={pickMouth} />

          <button type="button" className="tx-dentition" onClick={() => setShowPermanent((value) => !value)}>
            Secondary/Permanent Dentition (Adult Teeth)
          </button>
          {showPermanent ? (
            <>
              <div className="tx-arch">
                {PERMANENT_UPPER.map((code) => (
                  <Tooth key={code} code={code} selected={selectedTeeth.includes(code)} onClick={() => toggleTooth(code)} />
                ))}
              </div>
              <div className="tx-arch">
                {PERMANENT_LOWER.map((code) => (
                  <Tooth key={code} code={code} selected={selectedTeeth.includes(code)} onClick={() => toggleTooth(code)} />
                ))}
              </div>
            </>
          ) : null}

          <button type="button" className="tx-dentition" onClick={() => setShowPrimary((value) => !value)}>
            Primary Dentition (Deciduous/Baby Teeth)
          </button>
          {showPrimary ? (
            <>
              <div className="tx-arch">
                {PRIMARY_UPPER.map((code) => (
                  <Tooth key={code} code={code} selected={selectedTeeth.includes(code)} onClick={() => toggleTooth(code)} />
                ))}
              </div>
              <div className="tx-arch">
                {PRIMARY_LOWER.map((code) => (
                  <Tooth key={code} code={code} selected={selectedTeeth.includes(code)} onClick={() => toggleTooth(code)} />
                ))}
              </div>
            </>
          ) : null}

          <MouthButtons areas={LOWER_MOUTH_AREAS} onPick={pickMouth} />
          <div className="flex justify-end mt-1">
            <button type="button" className="tx-mouth-area">
              Mouth Area
            </button>
          </div>
        </aside>

        <div className="tx-entry">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={multiTooth} onChange={(event) => setMultiTooth(event.target.checked)} />
              Tic here for multi tooth selection.
            </label>
            <div className="flex flex-wrap gap-1">
              <button type="button" className="btn">
                Button Maintenance
              </button>
            </div>
          </div>

          <div className="tx-fields">
            <div className="field">
              <label>Teeth No</label>
              <div className="flex gap-1">
                <input readOnly value={teethValue} placeholder="Teeth No" />
                <button type="button" className="btn" onClick={clearTeeth} title="Clear teeth">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="tx-hasneed">
            <section className="tx-box">
              <header className="tx-box-h has">
                <span>Exam/Existing/Has</span>
                <button
                  type="button"
                  className={`tx-mic ${listenKind === "has" ? "is-on" : ""}`}
                  title={listenKind === "has" ? "Stop speech to exam" : "Speak to add Exam/Existing/Has"}
                  onClick={() => startTxSpeech("has")}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </header>
              <div className="tx-box-body">
                {listenKind === "has" ? (
                  <p className="tx-speech">{speechText || "Listening… say a procedure, e.g. PA XRAY or tooth 8 amalgam"}</p>
                ) : null}
                <div className="flex flex-wrap items-start gap-3">
                  <SurfacePad value={hasSurface} onToggle={(surface) => setHasSurface((current) => toggleToken(current, surface))} />
                  <div className="field min-w-[140px]">
                    <label>Has Surface</label>
                    <div className="flex gap-1">
                      <select
                        value=""
                        onChange={(event) => {
                          if (event.target.value) setHasSurface((current) => toggleToken(current, event.target.value));
                        }}
                      >
                        <option value="">{hasSurface || "- Has Surface -"}</option>
                        {SURFACES.map((surface) => (
                          <option key={surface} value={surface}>
                            {surface}{hasSurface.split(":").includes(surface) ? " ✓" : ""}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn" onClick={() => setHasSurface("")} title="Clear has surface">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="field min-w-[180px] flex-1">
                    <label className="sr-only">Exam Existing Has</label>
                    <select value={hasProc} onChange={(event) => {
                      const button = HAS_BUTTONS.find((item) => item.code === event.target.value);
                      setHasProc(event.target.value);
                      if (button) addPending("has", button.label, button.ada ?? "");
                    }}>
                      <option value="">- Exam/Existing/Has -</option>
                      {HAS_BUTTONS.map((button) => (
                        <option key={button.code} value={button.code}>
                          {button.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  <button type="button" className="tx-pill has" onClick={() => setAlert({ type: "ok", text: "FPD (Bridge) planner opens from this button." })}>
                    FPD (Bridge)
                  </button>
                  <button type="button" className="tx-pill has" onClick={() => setAlert({ type: "ok", text: "Denture planner opens from this button." })}>
                    Denture
                  </button>
                </div>
                <ProcGrid buttons={HAS_BUTTONS} kind="has" onPick={(button) => pickProc("has", button)} />
              </div>
            </section>

            <section className="tx-box">
              <header className="tx-box-h need">
                <span>Need</span>
                <button
                  type="button"
                  className={`tx-mic ${listenKind === "need" ? "is-on" : ""}`}
                  title={listenKind === "need" ? "Stop speech to need" : "Speak to add Need"}
                  onClick={() => startTxSpeech("need")}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </header>
              <div className="tx-box-body">
                {listenKind === "need" ? (
                  <p className="tx-speech">{speechText || "Listening… say a procedure, e.g. CROWN or tooth 14 composite"}</p>
                ) : null}
                <div className="flex flex-wrap items-start gap-3">
                  <SurfacePad value={needSurface} onToggle={(surface) => setNeedSurface((current) => toggleToken(current, surface))} />
                  <div className="field min-w-[140px]">
                    <label>Need Surface</label>
                    <div className="flex gap-1">
                      <select
                        value=""
                        onChange={(event) => {
                          if (event.target.value) setNeedSurface((current) => toggleToken(current, event.target.value));
                        }}
                      >
                        <option value="">{needSurface || "- Need Surface -"}</option>
                        {SURFACES.map((surface) => (
                          <option key={surface} value={surface}>
                            {surface}{needSurface.split(":").includes(surface) ? " ✓" : ""}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn" onClick={() => setNeedSurface("")} title="Clear need surface">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="field min-w-[180px] flex-1">
                    <label className="sr-only">Needs</label>
                    <select value={needProc} onChange={(event) => {
                      const button = NEED_BUTTONS.find((item) => item.code === event.target.value);
                      setNeedProc(event.target.value);
                      if (button) addPending("need", button.label, button.ada ?? "");
                    }}>
                      <option value="">- Needs -</option>
                      {NEED_BUTTONS.map((button) => (
                        <option key={button.code} value={button.code}>
                          {button.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <button type="button" className="tx-pill need" onClick={() => setAlert({ type: "ok", text: "Denture planner opens from this button." })}>
                    Denture
                  </button>
                  <button type="button" className="tx-pill need" onClick={() => setAlert({ type: "ok", text: "FPD (Bridge) planner opens from this button." })}>
                    FPD (Bridge)
                  </button>
                  <div className="field min-w-[220px] flex-1">
                    <select
                      value={adaCode}
                      onChange={(event) => {
                        setAdaCode(event.target.value);
                        const found = ADA_CODES.find((item) => item.code === event.target.value);
                        if (found) addPending("need", `${found.code} ${found.desc}`, found.code);
                      }}
                    >
                      <option value="">ADA Code/Desc./Type</option>
                      {ADA_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} - {item.desc} [{item.type}]
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <ProcGrid buttons={NEED_BUTTONS} kind="need" onPick={(button) => pickProc("need", button)} />
              </div>
            </section>
          </div>

          <div className="tx-pending">
            <div>
              <div className="tx-box-h has">Exam/Existing/Has</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Teeth</th>
                      <th>Surface</th>
                      <th>Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.filter((row) => row.kind === "has").length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted-foreground">No selection.</td>
                      </tr>
                    ) : (
                      pending.filter((row) => row.kind === "has").map((row) => (
                        <tr key={row.id}>
                          <td>{row.option}</td>
                          <td>{row.teeth}</td>
                          <td>{row.surface || "—"}</td>
                          <td>
                            <input
                              className="w-full border border-border rounded-sm px-1 py-0.5 bg-card"
                              value={row.remarks}
                              onChange={(event) => updatePending(row.id, { remarks: event.target.value })}
                            />
                          </td>
                          <td>
                            <button type="button" className="btn" onClick={() => setPending((current) => current.filter((item) => item.id !== row.id))}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="tx-box-h need">Need</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Teeth</th>
                      <th>Surface</th>
                      <th>Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.filter((row) => row.kind === "need").length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted-foreground">No selection.</td>
                      </tr>
                    ) : (
                      pending.filter((row) => row.kind === "need").map((row) => (
                        <tr key={row.id}>
                          <td>{row.option}</td>
                          <td>{row.teeth}</td>
                          <td>{row.surface || "—"}</td>
                          <td>
                            <input
                              className="w-full border border-border rounded-sm px-1 py-0.5 bg-card"
                              value={row.remarks}
                              onChange={(event) => updatePending(row.id, { remarks: event.target.value })}
                            />
                          </td>
                          <td>
                            <button type="button" className="btn" onClick={() => setPending((current) => current.filter((item) => item.id !== row.id))}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="btn btn-primary" onClick={submitSelection}>
              Submit Your Selection
            </button>
          </div>
        </div>
      </div>

      <section className="panel p-2">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <TableToolbar
            search={q}
            onSearchChange={setQ}
            searchPlaceholder="Search exam / need…"
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onFiltersOpenChange={setFiltersOpen}
            showFilterPanel={false}
            onExport={handleExport}
            exportLabel="Export"
          />
          <label className="inline-flex items-center gap-1.5 shrink-0">
            <input type="checkbox" checked={combine} onChange={(event) => setCombine(event.target.checked)} />
            Combine table layout
          </label>
        </div>

        <p className="text-right text-muted-foreground mb-1">
          Displaying {visibleRows.length} of {rows.length} result{rows.length === 1 ? "" : "s"}
        </p>

        {combine ? (
          <>
            <div className="tx-box-h has">Exam/Existing/Has + Need</div>
            {renderExamTable(tableRows ?? [], "No results found.")}
          </>
        ) : (
          <div className="grid gap-2">
            <div>
              <div className="tx-box-h has">Exam/Existing/Has</div>
              {renderExamTable(hasRows, "No results found.")}
            </div>
            <div>
              <div className="tx-box-h need">Need</div>
              {renderExamTable(needRows, "No results found.")}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          <button type="button" className="btn btn-primary" onClick={makePlan}>
            Make Treatment Plan
          </button>
          <button type="button" className="btn" onClick={() => deleteSelected(combine ? visibleRows : needRows.length ? [...hasRows, ...needRows] : hasRows)}>
            Delete All
          </button>
          <button type="button" className="btn" onClick={() => setAdaOpen(true)}>
            <Plus className="w-3 h-3" /> Add ADA Code
          </button>
        </div>
      </section>

      {adaOpen ? (
        <div className="fixed inset-0 z-[3500] bg-black/30 grid place-items-center p-4" onClick={() => setAdaOpen(false)}>
          <div className="panel w-full max-w-md p-3" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="panel-title">Add ADA Code</h3>
              <button type="button" className="btn" onClick={() => setAdaOpen(false)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="field">
              <label>ADA Code / Description / Type</label>
              <select value={adaCode} onChange={(event) => setAdaCode(event.target.value)}>
                <option value="">Select ADA code</option>
                {ADA_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} - {item.desc} [{item.type}]
                  </option>
                ))}
              </select>
            </div>
            <p className="text-muted-foreground mt-2 mb-3">Adds the code to the Need selection using the currently selected tooth.</p>
            <div className="flex justify-end gap-1">
              <button type="button" className="btn" onClick={() => setAdaOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={applyAda}>
                Add to Need
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
