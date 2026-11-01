import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Mic,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
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
type ExamSortKey = "date" | "teeth" | "surface" | "hasButton" | "needButton" | "doctor" | "remarks";

const EXAM_COLUMNS: { key: ExamSortKey; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "teeth", label: "Tooth Number(s) or Letter(s)" },
  { key: "surface", label: "Tooth Surface" },
  { key: "hasButton", label: "Has Tx. Button" },
  { key: "needButton", label: "Need Tx. Button" },
  { key: "doctor", label: "Doctor" },
  { key: "remarks", label: "Remarks" },
];

function txButtonLabel(row: ExamRow, kind: ExamKind) {
  if (row.kind !== kind) return "";
  return row.ada ? `${row.button} (${row.ada})` : row.button;
}

function examSortValue(row: ExamRow, key: ExamSortKey) {
  if (key === "hasButton") return txButtonLabel(row, "has");
  if (key === "needButton") return txButtonLabel(row, "need");
  return String(row[key] ?? "");
}

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
  onHover,
  arch,
}: {
  code: string;
  selected: boolean;
  onClick: () => void;
  onHover?: (code: string) => void;
  arch: "upper" | "lower";
}) {
  const img = <img src={toothImage(code)} alt="" />;
  const num = <span className="tx-tooth-num">{code}</span>;
  return (
    <button
      type="button"
      data-tooth={code}
      className={`tx-tooth is-${arch}${selected ? " is-on" : ""}`}
      title={`Tooth ${code}`}
      aria-label={`Tooth ${code}`}
      aria-pressed={selected}
      draggable={false}
      onClick={onClick}
      onPointerEnter={() => onHover?.(code)}
    >
      {arch === "upper" ? (
        <>
          {img}
          {num}
        </>
      ) : (
        <>
          {num}
          {img}
        </>
      )}
    </button>
  );
}

function ArchChart({
  upper,
  lower,
  narrow,
  selectedTeeth,
  onToggle,
  onHover,
}: {
  upper?: string[];
  lower?: string[];
  narrow?: boolean;
  selectedTeeth: string[];
  onToggle: (code: string) => void;
  onHover?: (code: string) => void;
}) {
  const band = (codes: string[], arch: "upper" | "lower") => (
    <div className={`tx-odo-row is-${arch}`}>
      {codes.map((code) => (
        <Tooth
          key={`${arch}-${code}`}
          code={code}
          arch={arch}
          selected={selectedTeeth.includes(code)}
          onClick={() => onToggle(code)}
          onHover={onHover}
        />
      ))}
    </div>
  );

  return (
    <div className={`tx-odo${narrow ? " is-narrow" : ""}`}>
      {upper ? band(upper, "upper") : null}
      {lower ? band(lower, "lower") : null}
    </div>
  );
}

function MouthToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="tx-mouth-toggle" onClick={onToggle} title={open ? "Collapse mouth area" : "Expand mouth area"}>
      MOUTH AREA
      <span className="tx-mouth-toggle-icon">{open ? "−" : "+"}</span>
    </button>
  );
}

function MouthBar({
  area,
  onPick,
  pill = false,
}: {
  area: MouthArea;
  onPick: (area: MouthArea) => void;
  pill?: boolean;
}) {
  return (
    <button
      type="button"
      title={area.title}
      className={`tx-mouth-bar tone-${area.tone} ${pill ? "is-pill" : ""}`}
      onClick={() => onPick(area)}
    >
      {area.label}
    </button>
  );
}

function FieldRefresh({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button type="button" className="tx-field-refresh" onClick={onClick} title={title}>
      <RefreshCw />
    </button>
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
  const [showUpperMouth, setShowUpperMouth] = useState(false);
  const [showLowerMouth, setShowLowerMouth] = useState(false);
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
  const [sort, setSort] = useState<{ key: ExamSortKey; dir: SortDir }>({ key: "date", dir: "desc" });
  const [adaOpen, setAdaOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [listenKind, setListenKind] = useState<ExamKind | null>(null);
  const [speechText, setSpeechText] = useState("");
  const recRef = useRef<SpeechRec | null>(null);
  const listenKindRef = useRef<ExamKind | null>(null);
  const applySpeechRef = useRef<(kind: ExamKind, spoken: string) => void>(() => {});
  const selectedRef = useRef<string[]>([]);
  const multiRef = useRef(false);
  const skipToothClick = useRef(false);
  const toothDrag = useRef<{
    on: boolean;
    moved: boolean;
    start: string | null;
    codes: string[];
    base: string[];
  }>({ on: false, moved: false, start: null, codes: [], base: [] });

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
  selectedRef.current = selectedTeeth;
  multiRef.current = multiTooth;

  const commitTooth = (code: string) => {
    setSelectedTeeth((current) => {
      if (multiRef.current) {
        return current.includes(code) ? current.filter((item) => item !== code) : [...current, code];
      }
      return current.length === 1 && current[0] === code ? [] : [code];
    });
  };

  const toggleTooth = (code: string) => {
    if (skipToothClick.current) return;
    commitTooth(code);
  };

  const toothFromPoint = (clientX: number, clientY: number) => {
    const node = document.elementFromPoint(clientX, clientY);
    return node?.closest("[data-tooth]")?.getAttribute("data-tooth") ?? null;
  };

  const applyToothDrag = (codes: string[]) => {
    if (multiRef.current) {
      const next = new Set(toothDrag.current.base);
      codes.forEach((item) => next.add(item));
      setSelectedTeeth(Array.from(next));
      return;
    }
    setSelectedTeeth(codes);
  };

  const addDragTooth = (code: string) => {
    if (!toothDrag.current.on || toothDrag.current.codes.includes(code)) return;
    toothDrag.current.moved = true;
    toothDrag.current.codes = [...toothDrag.current.codes, code];
    skipToothClick.current = true;
    applyToothDrag(toothDrag.current.codes);
  };

  useEffect(() => {
    const onMove = (event: globalThis.PointerEvent) => {
      if (!toothDrag.current.on) return;
      const code = toothFromPoint(event.clientX, event.clientY);
      if (code) addDragTooth(code);
    };
    const onUp = () => {
      const drag = toothDrag.current;
      if (!drag.on) return;
      drag.on = false;
      if (!drag.moved && drag.start) {
        skipToothClick.current = true;
        commitTooth(drag.start);
        window.setTimeout(() => {
          skipToothClick.current = false;
        }, 0);
      } else {
        skipToothClick.current = false;
      }
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const onTeethPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const code = toothFromPoint(event.clientX, event.clientY);
    if (!code) return;
    skipToothClick.current = false;
    toothDrag.current = {
      on: true,
      moved: false,
      start: code,
      codes: [code],
      base: selectedRef.current,
    };
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
    if (parsed.teeth.length > 1) setMultiTooth(true);
    if (parsed.teeth.length) setSelectedTeeth(parsed.teeth);
    if (parsed.surfaces.length) {
      const joined = parsed.surfaces.join(":");
      if (kind === "has") setHasSurface(joined);
      else setNeedSurface(joined);
    }

    const teeth = formatTeeth(parsed.teeth.length ? parsed.teeth : selectedTeeth);
    const surface = parsed.surfaces.length ? parsed.surfaces.join(":") : kind === "has" ? hasSurface : needSurface;

    if (parsed.buttons.length === 0) {
      if (parsed.teeth.length || parsed.surfaces.length) {
        const bits = [
          parsed.teeth.length ? `Tooth ${teeth}` : "",
          parsed.surfaces.length ? `surface ${surface.replace(/:/g, ", ")}` : "",
        ].filter(Boolean);
        setAlert({ type: "ok", text: `${bits.join(" and ")} selected.` });
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
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => examSortValue(a, sort.key).localeCompare(examSortValue(b, sort.key), undefined, { numeric: true }) * dir
    );
  }, [rows, q, sort]);

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
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-muted-foreground">
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
                <td>{txButtonLabel(row, "has") || "—"}</td>
                <td>{txButtonLabel(row, "need") || "—"}</td>
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
          <div className="tx-mouth-stack">
            <MouthToggle open={showUpperMouth} onToggle={() => setShowUpperMouth((value) => !value)} />
            {showUpperMouth ? (
              <>
                <MouthBar area={UPPER_MOUTH_AREAS[0]} onPick={pickMouth} />
                <MouthBar area={UPPER_MOUTH_AREAS[1]} onPick={pickMouth} />
                <div className="tx-mouth-quint">
                  {UPPER_MOUTH_AREAS.slice(2).map((area) => (
                    <MouthBar key={area.id} area={area} onPick={pickMouth} pill />
                  ))}
                </div>
              </>
            ) : null}

            <div className="tx-teeth-drag" onPointerDown={onTeethPointerDown}>
              <button type="button" className="tx-dentition" onClick={() => setShowPermanent((value) => !value)}>
                Secondary/Permanent Dentition (Adult Teeth)
              </button>
              {showPermanent ? (
                <ArchChart
                  upper={PERMANENT_UPPER}
                  selectedTeeth={selectedTeeth}
                  onToggle={toggleTooth}
                  onHover={addDragTooth}
                />
              ) : null}

              {showPrimary ? (
                <ArchChart
                  narrow
                  upper={PRIMARY_UPPER}
                  lower={PRIMARY_LOWER}
                  selectedTeeth={selectedTeeth}
                  onToggle={toggleTooth}
                  onHover={addDragTooth}
                />
              ) : null}

              {showPermanent ? (
                <ArchChart
                  lower={PERMANENT_LOWER}
                  selectedTeeth={selectedTeeth}
                  onToggle={toggleTooth}
                  onHover={addDragTooth}
                />
              ) : null}

              <button type="button" className="tx-dentition" onClick={() => setShowPrimary((value) => !value)}>
                Primary Dentition (Deciduous/Baby Teeth)
              </button>
            </div>

            {showLowerMouth ? (
              <>
                <div className="tx-mouth-quint">
                  {LOWER_MOUTH_AREAS.slice(0, 5).map((area) => (
                    <MouthBar key={area.id} area={area} onPick={pickMouth} pill />
                  ))}
                </div>
                <MouthBar area={LOWER_MOUTH_AREAS[5]} onPick={pickMouth} />
                <MouthBar area={LOWER_MOUTH_AREAS[6]} onPick={pickMouth} />
              </>
            ) : null}
            <MouthToggle open={showLowerMouth} onToggle={() => setShowLowerMouth((value) => !value)} />
          </div>
        </aside>

        <div className="tx-entry">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 shrink-0">
              <input type="checkbox" checked={multiTooth} onChange={(event) => setMultiTooth(event.target.checked)} />
              Tic here for multi tooth selection.
            </label>
            {listenKind ? (
              <div className="tx-listen-bar" role="status">
                <span className="tx-listen-dot" />
                <strong>Listening</strong>
                <span>{speechText || "Say a procedure, e.g. tooth 8 PA XRAY"}</span>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-1 ml-auto">
              <button type="button" className="btn">
                Button Maintenance
              </button>
            </div>
          </div>

          <div className="tx-fields">
            <div className="field">
              <label>Teeth No</label>
              <div className="tx-field-with-refresh">
                <input readOnly value={teethValue} placeholder="Teeth No" />
                <FieldRefresh onClick={clearTeeth} title="Refresh teeth" />
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
                <div className="flex flex-wrap items-start gap-3">
                  <SurfacePad value={hasSurface} onToggle={(surface) => setHasSurface((current) => toggleToken(current, surface))} />
                  <div className="field min-w-[140px]">
                    <label>Has Surface</label>
                    <div className="tx-field-with-refresh">
                      <input readOnly value={hasSurface} placeholder="Has Surface" />
                      <FieldRefresh onClick={() => setHasSurface("")} title="Refresh has surface" />
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
                <div className="flex flex-wrap items-start gap-3">
                  <SurfacePad value={needSurface} onToggle={(surface) => setNeedSurface((current) => toggleToken(current, surface))} />
                  <div className="field min-w-[140px]">
                    <label>Need Surface</label>
                    <div className="tx-field-with-refresh">
                      <input readOnly value={needSurface} placeholder="Need Surface" />
                      <FieldRefresh onClick={() => setNeedSurface("")} title="Refresh need surface" />
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
          <div className="relative flex items-center w-full max-w-[320px] min-w-[180px]">
            <input
              type="text"
              placeholder="Search exam / need…"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="w-full h-7 px-3 text-[11px] bg-background border border-border rounded-[3px] outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
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
