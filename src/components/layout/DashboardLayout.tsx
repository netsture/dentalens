import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  FilePlus2,
  FlaskConical,
  MessageSquare,
  NotebookPen,
  Pill,
  Printer,
  RotateCcw,
  UserPlus,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Statusbar } from "./Statusbar";
import { VoiceCommand } from "@/components/VoiceCommand";
import { shouldAutoCollapseSidebar, useSidebarCollapseSettings } from "@/lib/sidebarCollapse";
import { useIsMobile } from "@/lib/useMediaQuery";

const quickActions = [
  { label: "Patient", icon: UserPlus, href: "/patient?add=1" },
  { label: "Alert", icon: Bell },
  { label: "Form", icon: FilePlus2 },
  { label: "Prescription", icon: Pill },
  { label: "Note", icon: NotebookPen },
  { label: "Lab", icon: FlaskConical },
  { label: "Recall", icon: RotateCcw, href: "/appointment/recalls" },
  { label: "Message", icon: MessageSquare },
  { label: "Print", icon: Printer },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapseSettings] = useSidebarCollapseSettings();
  const autoCollapse = !isMobile && shouldAutoCollapseSidebar(location.pathname, collapseSettings);
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches
  );
  const [hoverOpen, setHoverOpen] = useState(false);
  const previousExpanded = useRef(true);

  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false);
      setHoverOpen(false);
      return;
    }
    if (autoCollapse) {
      previousExpanded.current = sidebarExpanded;
      setSidebarExpanded(false);
      setHoverOpen(false);
      return;
    }
    setSidebarExpanded(previousExpanded.current);
    setHoverOpen(false);
  }, [autoCollapse, isMobile]);

  useEffect(() => {
    if (isMobile) setSidebarExpanded(false);
  }, [location.pathname, isMobile]);

  const showSidebar = isMobile
    ? sidebarExpanded
    : autoCollapse
      ? sidebarExpanded || hoverOpen
      : sidebarExpanded;

  return (
    <div className="h-dvh w-screen max-w-[100vw] flex flex-col overflow-hidden bg-background text-foreground">
      <Topbar
        compact={isMobile}
        sidebarExpanded={autoCollapse ? false : sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((v) => !v)}
      />
      <div className="h-[30px] bg-primary text-primary-foreground flex items-center justify-start md:justify-end px-2 gap-0.5 shrink-0 overflow-x-auto border-b border-primary-hover [-webkit-overflow-scrolling:touch]">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const className = "h-6 px-2 flex items-center gap-1.5 text-[10px] font-semibold rounded-[2px] hover:bg-white/15 whitespace-nowrap border-none bg-transparent text-primary-foreground cursor-pointer";
          return action.href ? (
            <Link key={action.label} to={action.href} className={className}>
              <Icon className="w-3 h-3" /> {action.label}
            </Link>
          ) : (
            <button key={action.label} type="button" className={className}>
              <Icon className="w-3 h-3" /> {action.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {isMobile && sidebarExpanded ? (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/40 border-none cursor-pointer"
            aria-label="Close menu"
            onClick={() => setSidebarExpanded(false)}
          />
        ) : null}
        <div
          className={`h-full z-30 ${
            isMobile
              ? `absolute inset-y-0 left-0 ${sidebarExpanded ? "" : "pointer-events-none"}`
              : autoCollapse
                ? "relative w-[52px] shrink-0"
                : "shrink-0"
          }`}
          onMouseEnter={() => {
            if (autoCollapse) setHoverOpen(true);
          }}
          onMouseLeave={() => {
            if (autoCollapse) setHoverOpen(false);
          }}
        >
          <Sidebar
            expanded={showSidebar}
            flyout={isMobile || autoCollapse}
            collapsedHidden={isMobile}
            onNavigate={isMobile ? () => setSidebarExpanded(false) : undefined}
          />
        </div>
        <main className="console-body flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 flex flex-col overflow-auto min-h-0">{children}</div>
        </main>
      </div>
      <Statusbar />
      <VoiceCommand />
    </div>
  );
}
