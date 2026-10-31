import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, MapPin, Search, X } from "lucide-react";
import { searchSupportGuide } from "@/lib/supportGuide";

export function SupportGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchSupportGuide(query), [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-start justify-center p-4 pt-16" onClick={onClose}>
      <div
        className="panel bg-card w-full max-w-2xl shadow-xl flex flex-col max-h-[calc(100vh-96px)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-guide-title"
      >
        <div className="panel-header shrink-0">
          <div id="support-guide-title" className="panel-title flex items-center gap-1.5">
            <CircleHelp className="w-3.5 h-3.5 text-primary" />
            Support Guide
          </div>
          <button type="button" className="btn h-7 px-2" onClick={onClose} aria-label="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a menu or function — e.g. print form, eligibility, billing"
              className="w-full h-8 pl-8 pr-3 text-[length:var(--density-font)] bg-background border border-border rounded-[3px] outline-none focus:border-primary"
            />
          </div>
          <p className="text-[length:var(--density-font-sm)] text-muted-foreground mt-1.5">
            Type what you want to do. The guide shows which menu to open, the steps, and what that screen is used for.
          </p>
        </div>

        <div className="overflow-auto p-3 flex flex-col gap-2">
          {results.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No matching menu or function.</div>
          ) : (
            results.map((item) => (
              <div key={item.id} className="panel p-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="font-bold">{item.title}</div>
                    <div className="text-[length:var(--density-font-sm)] text-muted-foreground mt-0.5">
                      {item.group} · {item.path}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5" /> Go there
                  </button>
                </div>
                <div className="mt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Used for</div>
                  <p className="mt-0.5">{item.usedFor}</p>
                </div>
                <div className="mt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">How to go there</div>
                  <ol className="mt-1 pl-4 list-decimal flex flex-col gap-1">
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
