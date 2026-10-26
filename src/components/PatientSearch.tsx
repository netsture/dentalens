import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserRound } from "lucide-react";
import { searchPatients, type SearchPatient } from "@/lib/patients";
import { StatusBadge } from "@/components/StatusBadge";

export function PatientSearch() {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => searchPatients(query), [query]);
  const showList = open && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const openPatient = (patient: SearchPatient) => {
    setQuery(patient.name);
    setOpen(false);
    navigate(`/patient/overview?id=${patient.id}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (results.length === 0 ? 0 : (index + 1) % results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (results.length === 0 ? 0 : (index - 1 + results.length) % results.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const patient = results[activeIndex];
      if (patient) openPatient(patient);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-[420px]" ref={wrapRef}>
      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Patient Search..."
        className="w-full h-[34px] pl-8 pr-3 text-[12px] bg-background border border-border rounded-full outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
        aria-label="Patient search"
        aria-expanded={showList}
        aria-autocomplete="list"
      />
      {showList ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[1010] bg-card border border-border rounded-[4px] shadow-lg overflow-hidden">
          <div className="px-2.5 py-1.5 border-b border-border bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {results.length > 0 ? `${results.length} patient${results.length === 1 ? "" : "s"}` : "Patients"}
          </div>
          {results.length === 0 ? (
            <div className="px-3 py-4 text-[11px] text-muted-foreground text-center">No patients found.</div>
          ) : (
            <div className="max-h-[320px] overflow-auto">
              {results.map((patient, index) => (
                <button
                  key={patient.id}
                  type="button"
                  className={`w-full text-left px-2.5 py-2 border-b border-border last:border-b-0 cursor-pointer ${
                    index === activeIndex ? "bg-secondary" : "bg-card hover:bg-secondary"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openPatient(patient)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                      <UserRound className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold truncate">{patient.name}</span>
                        <StatusBadge status={patient.status} />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        #{patient.id} · {patient.phone} · DOB {patient.dob}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
