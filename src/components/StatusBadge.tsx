import type { ReactNode } from "react";

type Tone = "green" | "blue" | "red" | "amber" | "slate";

const TONE_BY_STATUS: Record<string, Tone> = {
  active: "green",
  confirmed: "green",
  open: "green",
  paid: "green",
  approved: "green",
  scheduled: "green",
  completed: "green",
  accepted: "green",
  contacted: "green",
  new: "blue",
  submitted: "blue",
  message: "blue",
  proposed: "blue",
  recommended: "blue",
  inactive: "red",
  denied: "red",
  cancelled: "red",
  canceled: "red",
  blocked: "red",
  expired: "red",
  overdue: "red",
  "no-show": "red",
  noshow: "red",
  pending: "amber",
  waiting: "amber",
  allocated: "amber",
  "due soon": "amber",
  draft: "amber",
};

function toneFor(status: string): Tone {
  return TONE_BY_STATUS[status.trim().toLowerCase()] ?? "slate";
}

function formatStatusLabel(status: string) {
  if (status === status.toLowerCase()) {
    return status.replace(/^\w/, (letter) => letter.toUpperCase());
  }
  return status;
}

export function StatusBadge({
  status,
  children,
  className = "",
}: {
  status: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`badge badge-status badge-status-${toneFor(status)} ${className}`.trim()}>
      {children ?? formatStatusLabel(status)}
    </span>
  );
}
