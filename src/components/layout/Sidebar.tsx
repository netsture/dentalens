import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  FileText,
  BarChart3,
  Clock3,
  FileCheck2,
  Globe2,
  History,
  ListChecks,
  PhoneCall,
  Settings,
  ShieldCheck,
  Stethoscope,
  Building2,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const menuItems = [
  { group: "Practice", name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { group: "Practice", name: "Practice Setup", path: "/practice-setup", icon: Building2 },
  { group: "Scheduling", name: "Appointment Book", path: "/appointment/book", icon: CalendarDays },
  { group: "Scheduling", name: "Find Slot", path: "/appointment/find-slot", icon: Clock3 },
  { group: "Scheduling", name: "Online Requests", path: "/appointment/online", icon: Globe2 },
  { group: "Scheduling", name: "Short Call", path: "/appointment/short-call", icon: PhoneCall },
  { group: "Scheduling", name: "Unscheduled Tx", path: "/appointment/unscheduled", icon: ListChecks },
  { group: "Scheduling", name: "Recalls", path: "/appointment/recalls", icon: History },
  { group: "Patients", name: "Patient Search", path: "/patient", icon: Users },
  { group: "Patients", name: "Patient Overview", path: "/patient/overview", icon: LayoutDashboard },
  { group: "Patients", name: "Insurance", path: "/patient/insurance", icon: ShieldCheck },
  { group: "Patients", name: "Clinical Chart", path: "/patient/clinical", icon: Stethoscope },
  { group: "Patients", name: "Treatment Planner", path: "/patient/treatment", icon: ListChecks },
  { group: "Patients", name: "Authorizations", path: "/patient/authorizations", icon: FileCheck2 },
  { group: "Financial", name: "Patient Billing", path: "/patient/billing", icon: Wallet },
  { group: "Financial", name: "Documents", path: "/documents", icon: FileText },
  { group: "Financial", name: "Analytics & Reports", path: "/report", icon: BarChart3 },
  { group: "Administration", name: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar({ expanded }: { expanded: boolean }) {
  const location = useLocation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return menuItems;
    const q = query.toLowerCase();
    return menuItems.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard" || location.pathname === "/";
    if (path === "/patient") return location.pathname === "/patient";
    if (path === "/practice-setup") return location.pathname.startsWith("/practice-setup");
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside
      className={`bg-secondary border-r border-border flex flex-col shrink-0 overflow-hidden transition-[width] duration-200 h-full ${
        expanded ? "w-[240px]" : "w-[52px]"
      }`}
    >
      {expanded && (
        <div className="px-2 pt-2 pb-1.5 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search menu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-[30px] pl-8 pr-6 text-[12px] bg-background border border-border rounded-[3px] outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`sidebar-menu flex flex-col gap-1 flex-1 overflow-y-auto ${expanded ? "p-1.5" : "p-1 pt-2"}`}>
        {[...new Set(filtered.map((item) => item.group))].map((group) => (
          <div className="flex flex-col gap-0.5" key={group}>
            {expanded && <div className="menu-group-title">{group}</div>}
            {filtered.filter((item) => item.group === group).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={`sidebar-item ${
                    expanded ? "" : "justify-center px-0"
                  } ${active ? "active" : "text-foreground hover:bg-secondary-hover"}`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                  {expanded && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
