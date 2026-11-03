import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  FileText,
  BarChart3,
  Settings,
  Building2,
  Search,
  UserRound,
  BadgeCheck,
  Briefcase,
  Mic,
  CircleHelp,
  X,
} from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";
import { SIDEBAR_MENU } from "@/lib/appCatalog";

const menuIcons: Record<string, ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/practice-setup": Building2,
  "/provider": UserRound,
  "/appointment/book": CalendarDays,
  "/patient": Users,
  "/patient/billing": Wallet,
  "/documents": FileText,
  "/report": BarChart3,
  "/eligibility": BadgeCheck,
  "/back-office": Briefcase,
  "/settings": Settings,
  "/voice-command": Mic,
  "/support-guide": CircleHelp,
};

const menuItems = SIDEBAR_MENU.map((item) => ({
  ...item,
  icon: menuIcons[item.path] ?? FileText,
}));

export function Sidebar({
  expanded,
  flyout = false,
  collapsedHidden = false,
  onNavigate,
}: {
  expanded: boolean;
  flyout?: boolean;
  collapsedHidden?: boolean;
  onNavigate?: () => void;
}) {
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
    if (path === "/provider") return location.pathname === "/provider" || location.pathname.startsWith("/provider/");
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside
      className={`app-sidebar bg-secondary border-r border-border flex flex-col shrink-0 overflow-hidden transition-[width] duration-200 h-full ${
        flyout ? "absolute inset-y-0 left-0 z-40" : ""
      } ${expanded ? "w-[240px]" : collapsedHidden ? "w-0 border-r-0" : "w-[52px]"} ${
        flyout && expanded ? "shadow-[4px_0_16px_rgba(15,23,42,0.12)]" : ""
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
                  onClick={onNavigate}
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
