import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Building,
  Calendar,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Topbar({
  onToggleSidebar,
  sidebarExpanded,
}: {
  onToggleSidebar: () => void;
  sidebarExpanded: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [density, setDensity] = useState(
    () => localStorage.getItem("dl-density") || "compact"
  );
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

  const applyDensity = (d: string) => {
    setDensity(d);
    localStorage.setItem("dl-density", d);
    document.documentElement.classList.remove(
      "density-compact",
      "density-standard",
      "density-comfortable"
    );
    document.documentElement.classList.add(`density-${d}`);
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
          sidebarExpanded ? "w-[240px] pl-3 pr-3" : "w-[52px] justify-center px-1"
        }`}
      >
        <button
          onClick={onToggleSidebar}
          className="w-7 h-7 flex items-center justify-center rounded-[3px] hover:bg-secondary border-none bg-transparent cursor-pointer text-foreground shrink-0"
          title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>
        {sidebarExpanded && (
          <a href="/dashboard" className="flex items-center gap-2 opacity-90 hover:opacity-100 min-w-0">
            <div className="w-7 h-7 rounded-[4px] bg-primary text-primary-foreground font-black text-[11px] flex items-center justify-center shrink-0">
              DL
            </div>
            <span className="font-bold text-[13px] tracking-tight text-foreground truncate">
              DENTA<span className="font-medium text-muted-foreground">LENS</span>
            </span>
          </a>
        )}
      </div>

      <div className="flex-1 flex items-center justify-between pr-3 h-full min-w-0">
        <div className="flex items-stretch h-full">
          <div className="flex flex-col justify-center px-4 h-full border-r border-border bg-secondary/40 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5 flex items-center gap-1">
              <Building className="w-2.5 h-2.5" /> Clinic
            </span>
            <span className="text-[12px] font-semibold text-foreground truncate max-w-[160px]">
              DentaLens Clinic
            </span>
          </div>
          <div className="hidden md:flex flex-col justify-center px-4 h-full border-r border-border bg-secondary/40">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" /> Branch
            </span>
            <span className="text-[12px] text-muted-foreground truncate max-w-[140px]">
              5TH STREET-GD-MS
            </span>
          </div>
          <div className="hidden md:flex flex-col justify-center px-4 h-full border-r border-border bg-secondary/40">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> Period
            </span>
            <span className="text-[12px] font-medium text-amber-600 whitespace-nowrap">
              FY 2025–26
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative hidden sm:flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Quick find..."
              className="w-44 md:w-56 h-[34px] pl-8 pr-3 text-[12px] bg-background border border-border rounded-full outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="w-px h-6 bg-border mx-1 shrink-0" />

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
              className="w-[36px] h-[36px] rounded-full bg-primary text-white font-bold text-[11px] flex items-center justify-center ring-2 ring-primary/30 hover:ring-primary/60 cursor-pointer border-none"
              onClick={() => setShowProfile((v) => !v)}
            >
              {initials}
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-1 w-[220px] bg-card border border-border rounded-[4px] shadow-lg p-2 flex flex-col gap-2 z-[1010]">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-[12px] flex items-center justify-center shrink-0">
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
                        onClick={() => applyDensity(d)}
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
                    navigate("/login");
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
    </header>
  );
}
