import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleHelp, MapPin, Search, X } from "lucide-react";
import { searchSupportGuide } from "@/lib/supportGuide";

export default function SupportGuidePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchSupportGuide(query), [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    results.forEach((item) => {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    });
    return [...map.entries()];
  }, [results]);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  const applyQuery = (value: string) => {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      <div className="flex flex-col items-center text-center gap-2 pt-2">
        <div className="flex items-center gap-2">
          <CircleHelp className="w-5 h-5 text-primary" />
          <h1 className="text-[18px] font-bold">Support Guide</h1>
        </div>
        <p className="text-[12px] text-muted-foreground max-w-xl">
          Search any menu or function in DentSaas. The guide shows what it is used for and how to open it.
        </p>
        <div className="relative w-full max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => applyQuery(event.target.value)}
            placeholder="Search a menu or function — e.g. print form, eligibility, billing"
            className="w-full h-10 pl-9 pr-9 text-[13px] bg-card border border-border rounded-[4px] outline-none focus:border-primary shadow-sm"
            aria-label="Search application functions"
          />
          {query ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"
              onClick={() => applyQuery("")}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {query.trim()
            ? `${results.length} matching ${results.length === 1 ? "function" : "functions"}`
            : `${results.length} functions in this application`}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {results.length === 0 ? (
          <div className="panel py-10 text-center text-muted-foreground">
            No matching menu or function. Try billing, print form, eligibility, or voice.
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto">
            {grouped.map(([group, items]) => (
              <section key={group} className="flex flex-col gap-2">
                <div className="menu-group-title px-1">{group}</div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <article key={item.id} className="panel p-3 bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-bold text-[13px]">{item.title}</h2>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.group} · {item.path}
                          </p>
                        </div>
                        <button type="button" className="btn btn-primary shrink-0" onClick={() => navigate(item.path)}>
                          <MapPin className="w-3.5 h-3.5" /> Go there
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Used for</div>
                        <p className="mt-0.5 text-[12px]">{item.usedFor}</p>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">How to go there</div>
                        <ol className="mt-1 pl-4 list-decimal flex flex-col gap-1 text-[12px]">
                          {item.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
