import { useLocation } from "react-router-dom";

const titles: Record<string, { title: string; description: string }> = {
  "/eligibility": {
    title: "Eligibility Check",
    description: "Verify insurance eligibility and benefits.",
  },
  "/back-office": {
    title: "Back Office",
    description: "Back office tools and workflows.",
  },
};

export default function BlankSectionPage() {
  const location = useLocation();
  const meta = titles[location.pathname] ?? {
    title: "Page",
    description: "This section is ready for content.",
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div>
        <h1 className="text-[16px] font-bold">{meta.title}</h1>
        <p className="text-[11px] text-muted-foreground">{meta.description}</p>
      </div>
      <div className="panel flex-1 min-h-0 flex items-center justify-center">
        <p className="text-[12px] text-muted-foreground">This page is blank and ready for content.</p>
      </div>
    </div>
  );
}
