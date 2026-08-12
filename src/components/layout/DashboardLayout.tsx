import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <Topbar
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((v) => !v)}
      />
      <div className="h-[30px] bg-primary text-primary-foreground flex items-center justify-end px-2 gap-0.5 shrink-0 overflow-x-auto border-b border-primary-hover">
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
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar expanded={sidebarExpanded} />
        <main className="console-body flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 flex flex-col overflow-auto min-h-0">{children}</div>
        </main>
      </div>
      <Statusbar />
    </div>
  );
}
