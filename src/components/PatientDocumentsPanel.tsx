import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, FileType, X } from "lucide-react";

type DocKind = "jpg" | "pdf" | "doc";
type DocSection = "Insurance" | "Xray" | "Barcode" | "EOB" | "Invoice";

type PatientDoc = {
  id: string;
  section: DocSection;
  name: string;
  kind: DocKind;
  date: string;
  size: string;
  url: string;
};

const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const SAMPLE_DOC = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const documents: PatientDoc[] = [
  { id: "ins-1", section: "Insurance", name: "Insurance_Card_Front.jpg", kind: "jpg", date: "Jun 01, 2026", size: "420 KB", url: "https://picsum.photos/seed/ins-front/900/600" },
  { id: "ins-2", section: "Insurance", name: "Insurance_Card_Back.jpg", kind: "jpg", date: "Jun 01, 2026", size: "390 KB", url: "https://picsum.photos/seed/ins-back/900/600" },
  { id: "ins-3", section: "Insurance", name: "Cigna_Policy.pdf", kind: "pdf", date: "Jun 01, 2026", size: "248 KB", url: SAMPLE_PDF },
  { id: "xray-1", section: "Xray", name: "Bitewing_Left.jpg", kind: "jpg", date: "Sep 15, 2026", size: "1.1 MB", url: "https://picsum.photos/seed/xray-left/900/600" },
  { id: "xray-2", section: "Xray", name: "Panoramic.jpg", kind: "jpg", date: "Sep 15, 2026", size: "2.4 MB", url: "https://picsum.photos/seed/xray-pano/900/600" },
  { id: "xray-3", section: "Xray", name: "Perio_Notes.pdf", kind: "pdf", date: "Sep 15, 2026", size: "180 KB", url: SAMPLE_PDF },
  { id: "bar-1", section: "Barcode", name: "Patient_Barcode.jpg", kind: "jpg", date: "Today", size: "86 KB", url: "https://picsum.photos/seed/barcode-1/900/400" },
  { id: "bar-2", section: "Barcode", name: "Chart_Label.jpg", kind: "jpg", date: "Today", size: "74 KB", url: "https://picsum.photos/seed/barcode-2/900/400" },
  { id: "eob-1", section: "EOB", name: "EOB_Cigna_Jul.pdf", kind: "pdf", date: "Jul 21, 2026", size: "312 KB", url: SAMPLE_PDF },
  { id: "eob-2", section: "EOB", name: "EOB_Scan.jpg", kind: "jpg", date: "Jul 21, 2026", size: "540 KB", url: "https://picsum.photos/seed/eob-scan/900/600" },
  { id: "eob-3", section: "EOB", name: "EOB_Notes.docx", kind: "doc", date: "Jul 22, 2026", size: "64 KB", url: SAMPLE_DOC },
  { id: "inv-1", section: "Invoice", name: "Invoice_1136.pdf", kind: "pdf", date: "Yesterday", size: "198 KB", url: SAMPLE_PDF },
  { id: "inv-2", section: "Invoice", name: "Statement_Sep.docx", kind: "doc", date: "Sep 30, 2026", size: "92 KB", url: SAMPLE_DOC },
  { id: "inv-3", section: "Invoice", name: "Invoice_Copy.jpg", kind: "jpg", date: "Yesterday", size: "610 KB", url: "https://picsum.photos/seed/invoice/900/600" },
];

const sections: DocSection[] = ["Insurance", "Xray", "Barcode", "EOB", "Invoice"];

function FileGlyph({ kind }: { kind: DocKind }) {
  if (kind === "pdf") {
    return (
      <div className="w-full h-[88px] rounded-[3px] bg-red-50 border border-red-200 text-red-600 flex flex-col items-center justify-center gap-1">
        <FileText className="w-7 h-7" />
        <span className="text-[10px] font-semibold">PDF</span>
      </div>
    );
  }
  return (
    <div className="w-full h-[88px] rounded-[3px] bg-sky-50 border border-sky-200 text-sky-700 flex flex-col items-center justify-center gap-1">
      <FileType className="w-7 h-7" />
      <span className="text-[10px] font-semibold">WORD</span>
    </div>
  );
}

export function PatientDocumentsPanel() {
  const [viewer, setViewer] = useState<{ section: DocSection; index: number } | null>(null);

  const imagesBySection = useMemo(() => {
    const map = {} as Record<DocSection, PatientDoc[]>;
    sections.forEach((section) => {
      map[section] = documents.filter((doc) => doc.section === section && doc.kind === "jpg");
    });
    return map;
  }, []);

  const viewerImages = viewer ? imagesBySection[viewer.section] : [];
  const currentImage = viewer ? viewerImages[viewer.index] : null;

  useEffect(() => {
    if (!viewer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewer(null);
      if (event.key === "ArrowLeft") {
        setViewer((current) => {
          if (!current) return current;
          const list = imagesBySection[current.section];
          return { ...current, index: (current.index - 1 + list.length) % list.length };
        });
      }
      if (event.key === "ArrowRight") {
        setViewer((current) => {
          if (!current) return current;
          const list = imagesBySection[current.section];
          return { ...current, index: (current.index + 1) % list.length };
        });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewer, imagesBySection]);

  const openDoc = (doc: PatientDoc) => {
    if (doc.kind === "jpg") {
      const list = imagesBySection[doc.section];
      const index = list.findIndex((item) => item.id === doc.id);
      setViewer({ section: doc.section, index: Math.max(0, index) });
      return;
    }
    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  const stepImage = (delta: number) => {
    if (!viewer) return;
    const list = imagesBySection[viewer.section];
    setViewer({ ...viewer, index: (viewer.index + delta + list.length) % list.length });
  };

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section) => {
        const items = documents.filter((doc) => doc.section === section);
        return (
          <div key={section} className="panel overflow-hidden">
            <div className="panel-header">
              <div className="panel-title">{section}</div>
              <span className="text-[10px] text-muted-foreground">{items.length} file(s)</span>
            </div>
            <div className="p-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
              {items.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openDoc(doc)}
                  className="text-left bg-card border border-border rounded-[3px] p-1.5 hover:border-primary cursor-pointer"
                >
                  {doc.kind === "jpg" ? (
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-full h-[88px] object-cover rounded-[3px] border border-border"
                    />
                  ) : (
                    <FileGlyph kind={doc.kind} />
                  )}
                  <div className="mt-1.5 text-[11px] font-semibold truncate" title={doc.name}>
                    {doc.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {doc.kind.toUpperCase()} · {doc.size} · {doc.date}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {viewer && currentImage ? (
        <div
          className="fixed inset-0 z-[3000] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewer(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-2 text-white">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold truncate">{currentImage.name}</div>
                <div className="text-[11px] text-white/70">
                  {viewer.section} · {viewer.index + 1} of {viewerImages.length}
                </div>
              </div>
              <button type="button" className="btn" onClick={() => setViewer(null)}>
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
            <div className="relative bg-black rounded-[3px] border border-white/20">
              <img
                src={currentImage.url}
                alt={currentImage.name}
                className="w-full max-h-[75vh] object-contain"
              />
              {viewerImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border-none cursor-pointer inline-flex items-center justify-center"
                    onClick={() => stepImage(-1)}
                    title="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border-none cursor-pointer inline-flex items-center justify-center"
                    onClick={() => stepImage(1)}
                    title="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
