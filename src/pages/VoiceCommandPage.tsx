import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, FilterX, Mic, Pencil, Plus, Trash2, X } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { StatusBadge } from "@/components/StatusBadge";
import { exportToExcel } from "@/lib/exportToExcel";
import {
  ACTION_OPTIONS,
  commandDisplay,
  emptyCommand,
  listBuiltInCommands,
  loadCustomCommands,
  NAV_TARGETS,
  saveCustomCommands,
  type ManagedVoiceCommand,
  type VoiceCommandLang,
} from "@/lib/voiceCommands";

type SortKey = "phrase" | "action" | "target" | "language" | "source" | "status";
type SortDir = "asc" | "desc";
type FilterState = Record<string, string>;

const columns: { key: SortKey; label: string; filter: "text" | "select" }[] = [
  { key: "phrase", label: "Phrase", filter: "text" },
  { key: "action", label: "Action", filter: "select" },
  { key: "target", label: "Target", filter: "text" },
  { key: "language", label: "Language", filter: "select" },
  { key: "source", label: "Source", filter: "select" },
  { key: "status", label: "Status", filter: "select" },
];

const filterInputClass =
  "w-full h-6 px-1 text-[10px] border border-border rounded-[2px] bg-background text-foreground outline-none focus:border-primary font-medium";

type Row = ManagedVoiceCommand & { actionLabel: string; target: string; languageLabel: string; source: string; status: string };

function toRows(commands: ManagedVoiceCommand[]): Row[] {
  return commands.map((command) => {
    const display = commandDisplay(command);
    return {
      ...command,
      actionLabel: display.actionLabel,
      target: display.targetLabel,
      languageLabel: display.languageLabel,
      source: display.sourceLabel,
      status: command.enabled ? "Active" : "Inactive",
    };
  });
}

export default function VoiceCommandPage() {
  const [custom, setCustom] = useState<ManagedVoiceCommand[]>(() => loadCustomCommands());
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("source");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editor, setEditor] = useState<ManagedVoiceCommand | null>(null);

  useEffect(() => {
    const sync = () => setCustom(loadCustomCommands());
    window.addEventListener("dentsaas:voice-commands-changed", sync);
    return () => window.removeEventListener("dentsaas:voice-commands-changed", sync);
  }, []);

  const rows = useMemo(() => {
    void tick;
    return toRows([...custom, ...listBuiltInCommands()]);
  }, [custom, tick]);

  const selectOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filter !== "select") return;
      const key = col.key === "action" ? "actionLabel" : col.key === "language" ? "languageLabel" : col.key;
      map[col.key] = Array.from(new Set(rows.map((row) => String(row[key as keyof Row] ?? "")).filter(Boolean))).sort();
    });
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows.filter((row) => {
      if (q.trim()) {
        const s = q.toLowerCase();
        const hit = [row.phrase, row.extraPhrases, row.actionLabel, row.target, row.languageLabel, row.source, row.status]
          .join(" ")
          .toLowerCase()
          .includes(s);
        if (!hit) return false;
      }
      for (const col of columns) {
        const f = (filters[col.key] ?? "").trim();
        if (!f) continue;
        const value =
          col.key === "action" ? row.actionLabel : col.key === "language" ? row.languageLabel : String(row[col.key] ?? "");
        if (col.filter === "select") {
          if (value !== f) return false;
        } else if (!value.toLowerCase().includes(f.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      const av =
        sortKey === "action" ? a.actionLabel : sortKey === "language" ? a.languageLabel : String(a[sortKey] ?? "");
      const bv =
        sortKey === "action" ? b.actionLabel : sortKey === "language" ? b.languageLabel : String(b[sortKey] ?? "");
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, q, filters, sortKey, sortDir]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setCustom(loadCustomCommands());
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 300);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const handleExport = () => {
    exportToExcel(
      "voice-commands",
      ["Phrase", "Extra phrases", "Action", "Target", "Language", "Source", "Status"],
      filtered.map((row) => [row.phrase, row.extraPhrases, row.actionLabel, row.target, row.languageLabel, row.source, row.status]),
      "Voice Commands"
    );
  };

  const persist = (next: ManagedVoiceCommand[]) => {
    setCustom(next);
    saveCustomCommands(next);
  };

  const saveEditor = () => {
    if (!editor) return;
    const phrase = editor.phrase.trim();
    if (!phrase) return;
    const payload: ManagedVoiceCommand = {
      ...editor,
      phrase,
      extraPhrases: editor.extraPhrases.trim(),
      builtIn: false,
    };
    const exists = custom.some((item) => item.id === payload.id);
    persist(exists ? custom.map((item) => (item.id === payload.id ? payload : item)) : [payload, ...custom]);
    setEditor(null);
  };

  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div>
        <h1 className="text-[16px] font-bold">Voice Command</h1>
        <p className="text-[11px] text-muted-foreground">
          Available English, Hindi, and Gujarati commands. Add your own phrases and manage them here.
        </p>
      </div>

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search voice commands..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onFiltersOpenChange={setFiltersOpen}
        showFilterPanel={false}
        onExport={handleExport}
        exportLabel="Export"
        actions={
          <>
            {activeFilterCount > 0 ? (
              <button type="button" className="btn" onClick={() => setFilters({})}>
                <FilterX className="w-3 h-3" />
                Clear ({activeFilterCount})
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                setEditor({
                  id: `custom-${Date.now()}`,
                  ...emptyCommand(),
                  builtIn: false,
                })
              }
            >
              <Plus className="w-3.5 h-3.5" /> Add Voice Command
            </button>
          </>
        }
      />

      <div className="panel flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="table-wrap flex-1 border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer font-inherit text-inherit hover:text-primary"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      <SortIcon col={col.key} />
                    </button>
                  </th>
                ))}
                <th>Action</th>
              </tr>
              {filtersOpen && (
                <tr className="bg-secondary/80">
                  {columns.map((col) => (
                    <th key={`f-${col.key}`} className="!normal-case !tracking-normal !font-medium !py-1.5">
                      {col.filter === "select" ? (
                        <select
                          value={filters[col.key] ?? ""}
                          onChange={(e) => setFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
                          className={filterInputClass}
                        >
                          <option value="">All</option>
                          {(selectOptions[col.key] ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Search…"
                          value={filters[col.key] ?? ""}
                          onChange={(e) => setFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
                          className={filterInputClass}
                        />
                      )}
                    </th>
                  ))}
                  <th />
                </tr>
              )}
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center text-muted-foreground py-6">
                    No voice commands found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="min-w-[180px]">
                      <div className="font-semibold">{row.phrase}</div>
                      {row.extraPhrases ? <div className="text-[10px] text-muted-foreground mt-0.5">{row.extraPhrases}</div> : null}
                    </td>
                    <td>{row.actionLabel}</td>
                    <td>{row.target}</td>
                    <td>{row.languageLabel}</td>
                    <td>
                      <StatusBadge status={row.builtIn ? "Recommended" : "New"}>{row.source}</StatusBadge>
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      {row.builtIn ? (
                        <span className="text-[10px] text-muted-foreground">Built-in</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button type="button" className="btn h-6 px-1.5" title="Edit" onClick={() => setEditor(row)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="btn h-6 px-1.5"
                            title="Delete"
                            onClick={() => persist(custom.filter((item) => item.id !== row.id))}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editor ? (
        <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4" onClick={() => setEditor(null)}>
          <div className="panel bg-card w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-primary" />
                {custom.some((item) => item.id === editor.id) ? "Edit Voice Command" : "Add Voice Command"}
              </div>
              <button type="button" className="btn h-7 px-2" onClick={() => setEditor(null)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="field sm:col-span-2">
                <label>Phrase</label>
                <input
                  value={editor.phrase}
                  onChange={(e) => setEditor({ ...editor, phrase: e.target.value })}
                  placeholder="e.g. open eligibility"
                />
              </div>
              <div className="field sm:col-span-2">
                <label>Extra phrases</label>
                <input
                  value={editor.extraPhrases}
                  onChange={(e) => setEditor({ ...editor, extraPhrases: e.target.value })}
                  placeholder="Comma separated, e.g. patrata, eligibility check"
                />
              </div>
              <div className="field">
                <label>Action</label>
                <select
                  value={editor.action}
                  onChange={(e) => setEditor({ ...editor, action: e.target.value as ManagedVoiceCommand["action"] })}
                >
                  {ACTION_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Language</label>
                <select
                  value={editor.language}
                  onChange={(e) => setEditor({ ...editor, language: e.target.value as VoiceCommandLang })}
                >
                  <option value="all">All</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                </select>
              </div>
              {editor.action === "navigate" ? (
                <div className="field sm:col-span-2">
                  <label>Page</label>
                  <select value={editor.path} onChange={(e) => setEditor({ ...editor, path: e.target.value })}>
                    {NAV_TARGETS.map((item) => (
                      <option key={item.path} value={item.path}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {editor.action === "view-add" ? (
                <div className="field sm:col-span-2">
                  <label>Patient ID</label>
                  <input
                    value={editor.query}
                    onChange={(e) => setEditor({ ...editor, query: e.target.value })}
                    placeholder="Optional default. Spoken ID is used when you say a number."
                  />
                </div>
              ) : null}
              {editor.action === "search" ? (
                <div className="field sm:col-span-2">
                  <label>Search text</label>
                  <input
                    value={editor.query}
                    onChange={(e) => setEditor({ ...editor, query: e.target.value })}
                    placeholder="Optional default. Spoken text is used when you say search ..."
                  />
                </div>
              ) : null}
              <label className="btn h-7 sm:col-span-2 justify-start">
                <input
                  type="checkbox"
                  checked={editor.enabled}
                  onChange={(e) => setEditor({ ...editor, enabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>
            <div className="px-3 py-2 border-t border-border flex justify-end gap-1.5">
              <button type="button" className="btn" onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={saveEditor} disabled={!editor.phrase.trim()}>
                Save Command
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
