import { useEffect, useState } from "react";
import { Building2, X } from "lucide-react";

const CLINICS = [
  "DentaLens Clinic",
  "Bright Smiles Dental Group",
  "City Center Oral Health",
];

const BRANCHES: Record<string, string[]> = {
  "DentaLens Clinic": ["5TH STREET-GD-MS", "SOUTH - Bright Smiles", "MAIN - City Center"],
  "Bright Smiles Dental Group": ["SOUTH", "WEST"],
  "City Center Oral Health": ["CENT", "EAST"],
};

export type WorkspaceContext = {
  clinic: string;
  branch: string;
};

const STORAGE_KEY = "dl-workspace-context";

export function loadWorkspaceContext(): WorkspaceContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkspaceContext;
      if (parsed.clinic && parsed.branch) return { clinic: parsed.clinic, branch: parsed.branch };
    }
  } catch {
    /* ignore */
  }
  return {
    clinic: CLINICS[0],
    branch: BRANCHES[CLINICS[0]][0],
  };
}

export function saveWorkspaceContext(ctx: WorkspaceContext) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
}

export function SwitchWorkspaceModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: WorkspaceContext;
  onClose: () => void;
  onSave: (ctx: WorkspaceContext) => void;
}) {
  const [clinic, setClinic] = useState(initial.clinic);
  const [branch, setBranch] = useState(initial.branch);

  useEffect(() => {
    if (!open) return;
    setClinic(initial.clinic);
    setBranch(initial.branch);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const branchOptions = BRANCHES[clinic] ?? [];

  const handleClinicChange = (value: string) => {
    setClinic(value);
    const nextBranches = BRANCHES[value] ?? [];
    setBranch(nextBranches[0] ?? "");
  };

  const handleSave = () => {
    const next = { clinic, branch };
    saveWorkspaceContext(next);
    onSave(next);
    onClose();
  };

  return (
    <div
      className="cs-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-card border border-border rounded-[6px] shadow-lg w-full max-w-[420px] mx-4 overflow-hidden"
        role="dialog"
        aria-labelledby="switch-workspace-title"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <h2
              id="switch-workspace-title"
              className="text-[12px] font-bold uppercase tracking-wide text-primary truncate"
            >
              Switch Workspace Context
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[3px] border-none bg-transparent hover:bg-secondary cursor-pointer text-muted-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3.5">
          <div className="field">
            <label>Clinic</label>
            <select value={clinic} onChange={(e) => handleClinicChange(e.target.value)}>
              {CLINICS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Branch</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
