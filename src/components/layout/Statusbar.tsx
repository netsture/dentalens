import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export function Statusbar() {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      );
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="statusbar">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>System Connected</span>
        </div>
        <div>
          Latency <span className="font-bold text-[#10b981]">12ms</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span>Demo Mode</span>
        <span>Operator {user?.name?.split(" ")[0] || "Guest"}</span>
        <span>{timeStr}</span>
      </div>
    </footer>
  );
}
