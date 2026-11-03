import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Building,
  Check,
  CircleHelp,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { applyTheme, getStoredTheme, THEMES, type AppTheme } from "@/lib/theme";
import { applyDensity, getStoredDensity, type AppDensity } from "@/lib/density";
import { PatientSearch } from "@/components/PatientSearch";
import { SupportGuideModal } from "@/components/SupportGuideModal";
import {
  loadWorkspaceContext,
  SwitchWorkspaceModal,
  type WorkspaceContext,
} from "@/components/SwitchWorkspaceModal";

export function Topbar({
  onToggleSidebar,
  sidebarExpanded,
  compact = false,
}: {
  onToggleSidebar: () => void;
  sidebarExpanded: boolean;
  compact?: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceContext>(() => loadWorkspaceContext());
  const [density, setDensity] = useState<AppDensity>(() => getStoredDensity());
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const selectDensity = (next: AppDensity) => {
    setDensity(next);
    applyDensity(next);
  };

  const selectTheme = (next: AppTheme) => {
    setTheme(next);
    applyTheme(next);
  };

  const initials =
    user?.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DL";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="topbar bg-card border-b border-border flex items-center shrink-0 relative z-[100]">
      <div
        className={`shrink-0 flex items-center gap-2 h-full border-r border-border transition-[width] duration-200 ${
          compact
            ? "w-auto pl-2 pr-2"
            : sidebarExpanded
              ? "w-[240px] pl-3 pr-3"
              : "w-[52px] justify-center px-1"
        }`}
      >
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-[3px] hover:bg-secondary border-none bg-transparent cursor-pointer text-foreground shrink-0"
          title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={sidebarExpanded ? "Collapse sidebar" : "Open sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>
        {(compact || sidebarExpanded) && (
          <a href="/dashboard" className="flex items-center gap-2 opacity-90 hover:opacity-100 min-w-0">
            <div className="w-7 h-7 rounded-[4px] bg-primary text-primary-foreground font-black text-[11px] flex items-center justify-center shrink-0">
              DL
            </div>
            <span className={`font-bold text-[13px] tracking-tight text-foreground truncate ${compact ? "hidden min-[420px]:inline" : ""}`}>
              DentSaas<span className="font-medium text-primary">.ai</span>
            </span>
          </a>
        )}
      </div>

      <div
        className={`flex-1 items-center pr-2 sm:pr-3 h-full min-w-0 ${
          compact ? "flex gap-2" : "grid grid-cols-[1fr_minmax(160px,420px)_1fr]"
        }`}
      >
        {!compact && (
          <div className="flex items-stretch h-full min-w-0">
            <button
              type="button"
              onClick={() => setShowWorkspace(true)}
              className="flex flex-col justify-center px-4 h-full border-r border-border bg-secondary/40 min-w-0 border-l-0 border-t-0 border-b-0 cursor-pointer hover:bg-secondary text-left"
              title="Switch clinic"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5 flex items-center gap-1">
                <Building className="w-2.5 h-2.5" /> Clinic
              </span>
              <span className="text-[12px] font-semibold text-foreground truncate max-w-[160px]">
                {workspace.clinic}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowWorkspace(true)}
              className="hidden md:flex flex-col justify-center px-4 h-full border-r border-border bg-secondary/40 border-l-0 border-t-0 border-b-0 cursor-pointer hover:bg-secondary text-left"
              title="Switch branch"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Branch
              </span>
              <span className="text-[12px] text-muted-foreground truncate max-w-[140px]">
                {workspace.branch}
              </span>
            </button>
          </div>
        )}

        <div className={`flex justify-center px-1 sm:px-2 min-w-0 ${compact ? "flex-1" : ""}`}>
          <PatientSearch />
        </div>

        <div className="flex items-center justify-end gap-0.5 sm:gap-1.5 shrink-0">
          <div className="hidden sm:block w-px h-6 bg-border mx-1 shrink-0" />

          <button
            type="button"
            className="btn"
            title="Support guide"
            onClick={() => setShowSupport(true)}
          >
            <CircleHelp className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Support</span>
          </button>

          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary border-none bg-transparent cursor-pointer">
            <Bell className="w-[18px] h-[18px] text-foreground" />
            <span className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center border-[1.5px] border-card">
              3
            </span>
          </button>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary border-none bg-transparent cursor-pointer">
            <Mail className="w-[18px] h-[18px] text-foreground" />
            <span className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center border-[1.5px] border-card">
              2
            </span>
          </button>
          <button
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-secondary border-none bg-transparent cursor-pointer text-foreground"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="w-[18px] h-[18px]" />
          </button>

          <div className="w-px h-5 bg-border mx-1 shrink-0" />

          <div className="relative" ref={profileRef}>
            <button
              className="w-[36px] h-[36px] rounded-full bg-primary text-primary-foreground font-bold text-[11px] flex items-center justify-center ring-2 ring-primary/30 hover:ring-primary/60 cursor-pointer border-none"
              onClick={() => setShowProfile((v) => !v)}
            >
              {initials}
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-1 w-[min(240px,calc(100vw-16px))] bg-card border border-border rounded-[4px] shadow-lg p-2 flex flex-col gap-2 z-[1010]">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-[12px] flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-foreground text-[12px] truncate">{user?.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
                    <span className="mt-0.5 self-start inline-flex px-1 py-px text-[10px] font-bold rounded-full bg-primary/15 text-primary">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <hr className="-mx-2 border-none h-px bg-border" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Density
                  </span>
                  <div className="flex rounded-[3px] border border-border overflow-hidden">
                    {(["compact", "standard", "comfortable"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => selectDensity(d)}
                        className={`flex-1 h-6 text-[11px] font-semibold capitalize cursor-pointer border-none ${
                          density === d
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {d === "comfortable" ? "Comfort" : d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Theme
                    </span>
                    <span className="text-[10px] font-semibold text-foreground truncate">
                      {THEMES.find((t) => t.id === theme)?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {THEMES.map((t) => {
                      const selected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          title={t.label}
                          aria-label={`${t.label} theme`}
                          aria-pressed={selected}
                          onClick={() => selectTheme(t.id)}
                          className={`flex items-center gap-1.5 h-7 px-1.5 rounded-[3px] border-none cursor-pointer text-left ${
                            selected ? "bg-primary/15 ring-1 ring-primary" : "bg-transparent hover:bg-secondary"
                          }`}
                        >
                          <span
                            className={`relative w-4 h-4 rounded-full shrink-0 ring-1 ${
                              selected ? "ring-foreground/40" : "ring-border"
                            }`}
                            style={{ backgroundColor: t.swatch }}
                          >
                            {selected ? (
                              <Check
                                className="w-2.5 h-2.5 absolute inset-0 m-auto"
                                strokeWidth={3}
                                style={{ color: t.check }}
                              />
                            ) : null}
                          </span>
                          <span className={`text-[11px] truncate ${selected ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <hr className="-mx-2 border-none h-px bg-border" />
                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/settings");
                  }}
                  className="flex items-center gap-2 h-6 px-2 text-[12px] font-medium text-foreground hover:bg-secondary rounded-[3px] border-none bg-transparent cursor-pointer text-left"
                >
                  <Settings className="w-3 h-3 text-muted-foreground" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/settings");
                  }}
                  className="flex items-center gap-2 h-6 px-2 text-[12px] font-medium text-foreground hover:bg-secondary rounded-[3px] border-none bg-transparent cursor-pointer text-left"
                >
                  <User className="w-3 h-3 text-muted-foreground" />
                  My Profile
                </button>
                <hr className="-mx-2 border-none h-px bg-border" />
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="w-full h-6 text-[12px] font-semibold text-white bg-destructive hover:opacity-90 rounded-[3px] cursor-pointer border-none"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SupportGuideModal open={showSupport} onClose={() => setShowSupport(false)} />

      <SwitchWorkspaceModal
        open={showWorkspace}
        initial={workspace}
        onClose={() => setShowWorkspace(false)}
        onSave={setWorkspace}
      />
    </header>
  );
}
