import { useMemo, useState } from "react";
import { Download, FileText, FolderOpen, Image as ImageIcon, Upload } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";

const docs = [
  { name: "Consent_Form_Wingard.pdf", type: "PDF", size: "248 KB", patient: "Denise Wingard", date: "Dec 10, 2020" },
  { name: "Insurance_Card_Front.jpg", type: "Image", size: "1.2 MB", patient: "Denise Wingard", date: "Nov 19, 2020" },
  { name: "Treatment_Plan_Ella.pdf", type: "PDF", size: "512 KB", patient: "JOHNSONN ELLA", date: "Today" },
  { name: "XRay_Panoramic_Samuel.dcm", type: "Imaging", size: "4.8 MB", patient: "BALSECA SAMUEL", date: "Today" },
  { name: "Referral_Letter_Curry.docx", type: "Doc", size: "86 KB", patient: "CURRY NEVAEH", date: "Yesterday" },
  { name: "HIPAA_Notice_Template.pdf", type: "PDF", size: "190 KB", patient: "— Clinic", date: "Jan 02, 2025" },
];

function iconFor(type: string) {
  if (type === "Image" || type === "Imaging") return ImageIcon;
  if (type === "PDF" || type === "Doc") return FileText;
  return FolderOpen;
}

export default function DocumentsPage() {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const filtered = useMemo(() => {
    void tick;
    let list = docs;
    if (typeFilter !== "all") list = list.filter((d) => d.type === typeFilter);
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.patient.toLowerCase().includes(s) ||
        d.type.toLowerCase().includes(s)
    );
  }, [q, typeFilter, tick]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div>
        <h1 className="text-[16px] font-bold">Documents</h1>
        <p className="text-[11px] text-muted-foreground">Patient files, letters and imaging attachments</p>
      </div>

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search documents..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        filterContent={
          <div className="field min-w-[160px]">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="PDF">PDF</option>
              <option value="Image">Image</option>
              <option value="Imaging">Imaging</option>
              <option value="Doc">Doc</option>
            </select>
          </div>
        }
        actions={
          <button type="button" className="btn btn-primary">
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
        }
      />

      <div className="panel flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="table-wrap flex-1 border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Patient</th>
                <th>Size</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const Icon = iconFor(d.type);
                return (
                  <tr key={d.name}>
                    <td>
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        {d.name}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary text-secondary-foreground">{d.type}</span>
                    </td>
                    <td>{d.patient}</td>
                    <td>{d.size}</td>
                    <td>{d.date}</td>
                    <td className="text-right">
                      <button type="button" className="btn h-6 px-2">
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
