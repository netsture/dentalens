import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Phone, Plus, UserPlus, Wallet } from "lucide-react";
import { TableToolbar } from "@/components/TableToolbar";
import { AddPatientModal } from "@/components/AddPatientModal";
import { AddInsuranceModal } from "@/components/AddInsuranceModal";

const seedPatients = [
  { id: "16665", name: "Denise Wingard", phone: "215-555-0142", dob: "03-12-1984", balance: "$948.80", lastVisit: "Dec 10, 2020", status: "Active" },
  { id: "17001", name: "JOHNSONN ELLA", phone: "484-903-7236", dob: "02-27-2012", balance: "$0.00", lastVisit: "Today", status: "Active" },
  { id: "17002", name: "BRAKE ZOIEY", phone: "201-616-6586", dob: "08-28-2012", balance: "$120.00", lastVisit: "Today", status: "Active" },
  { id: "17003", name: "MCNUTT PHEONIX", phone: "484-597-1934", dob: "02-19-2012", balance: "$45.00", lastVisit: "Today", status: "Active" },
  { id: "17004", name: "CURRY NEVAEH", phone: "484-554-6555", dob: "02-15-2005", balance: "$0.00", lastVisit: "Yesterday", status: "New" },
  { id: "17005", name: "DELGADO GENESIS", phone: "862-247-7212", dob: "03-03-2010", balance: "$210.00", lastVisit: "Today", status: "Active" },
  { id: "17006", name: "BALSECA SAMUEL", phone: "201-552-0729", dob: "05-12-2009", balance: "$0.00", lastVisit: "Today", status: "New" },
  { id: "17007", name: "ESCOBAR TEJADA DARA", phone: "484-375-5283", dob: "02-01-2013", balance: "$75.00", lastVisit: "Today", status: "Active" },
];

type PatientRow = (typeof seedPatients)[number];

export default function PatientPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const [rows, setRows] = useState<PatientRow[]>(seedPatients);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [insuranceRp, setInsuranceRp] = useState({ id: "1590", name: "Green, Craig" });

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setShowAddPatient(true);
      const next = new URLSearchParams(searchParams);
      next.delete("add");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    void tick;
    let list = rows;
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.id.includes(s) ||
        p.phone.includes(s)
    );
  }, [q, statusFilter, tick, rows]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTick((t) => t + 1);
      setRefreshing(false);
    }, 400);
  };

  const openInsurance = (patient: { id: string; name: string }) => {
    setInsuranceRp(patient);
    setShowAddPatient(false);
    setShowAddInsurance(true);
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div>
        <h1 className="text-[16px] font-bold">Patients</h1>
        <p className="text-[11px] text-muted-foreground">{filtered.length} records</p>
      </div>

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search patients..."
        onRefresh={handleRefresh}
        refreshing={refreshing}
        filterContent={
          <div className="field min-w-[160px]">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="New">New</option>
            </select>
          </div>
        }
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShowAddPatient(true)}>
            <UserPlus className="w-3.5 h-3.5" /> Add Patient
          </button>
        }
      />

      <div className="panel flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="table-wrap flex-1 border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>DOB</th>
                <th>Last Visit</th>
                <th>Balance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold text-muted-foreground">#{p.id}</td>
                  <td className="font-semibold">{p.name}</td>
                  <td>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {p.phone}
                    </span>
                  </td>
                  <td>{p.dob}</td>
                  <td>{p.lastVisit}</td>
                  <td className={p.balance !== "$0.00" ? "text-destructive font-bold" : ""}>
                    {p.balance}
                  </td>
                  <td>
                    <span className="badge bg-accent text-accent-foreground">{p.status}</span>
                  </td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <Link to="/patient/billing" className="btn h-6 px-2">
                        <Wallet className="w-3 h-3" /> Billing
                      </Link>
                      <button type="button" className="btn h-6 px-2">
                        <Plus className="w-3 h-3" /> Appt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddPatientModal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onSaved={(patient) => {
          const displayName = patient.name.includes(",")
            ? patient.name.split(",").map((p) => p.trim()).reverse().join(" ")
            : patient.name;
          setRows((prev) => [
            {
              id: patient.id,
              name: displayName,
              phone: "—",
              dob: "01-01-1979",
              balance: "$0.00",
              lastVisit: "—",
              status: "New",
            },
            ...prev,
          ]);
        }}
        onAddInsurance={openInsurance}
      />

      <AddInsuranceModal
        open={showAddInsurance}
        onClose={() => setShowAddInsurance(false)}
        responsibleParty={insuranceRp}
      />
    </div>
  );
}
