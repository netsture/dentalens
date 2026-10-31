import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, UserCircle2 } from "lucide-react";
import { ExamTreatmentPlan } from "@/components/ExamTreatmentPlan";
import { StatusBadge } from "@/components/StatusBadge";
import { getPatientById } from "@/lib/patients";
import { getProvider, getSchedulePatient } from "@/lib/providers";

export default function PatientTreatmentPlanPage() {
  const { patientId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const listed = getPatientById(patientId);
  const scheduled = getSchedulePatient(patientId);
  const providerId = searchParams.get("provider") || scheduled?.providerId || "";
  const provider = providerId ? getProvider(providerId) : undefined;
  const backTo = providerId ? `/provider/${providerId}` : "/provider";

  if (!patientId) return <Navigate to="/provider" replace />;

  const name = listed?.name ?? scheduled?.patientName ?? "Patient";
  const dob = listed?.dob ?? scheduled?.dob ?? "—";
  const phone = listed?.phone ?? "—";
  const status = listed?.status ?? scheduled?.status ?? "Active";
  const gender = scheduled?.gender;
  const age = scheduled?.age;
  const doctorName = provider?.name ?? "Assigned Provider";

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      <div className="panel flex items-center justify-between gap-3 px-3 py-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
            <UserCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-bold text-[length:calc(var(--density-font)+2.5px)]">
              {name} <span className="text-muted-foreground font-medium">(#{patientId})</span>
            </h1>
            <p className="text-[length:var(--density-font-sm)] text-muted-foreground flex items-center gap-1.5 flex-wrap">
              {gender ? <span>{gender}</span> : null}
              {age ? <span>· {age}</span> : null}
              <span>· DOB {dob}</span>
              <span>· {phone}</span>
              <StatusBadge status={status} />
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Link to={backTo} className="btn">
            <ArrowLeft className="w-3.5 h-3.5" /> {provider ? provider.name : "Provider"}
          </Link>
          <Link to={`/patient/overview?id=${patientId}`} className="btn">
            Overview
          </Link>
        </div>
      </div>

      <div className="panel flex-1 min-h-0 p-3 overflow-auto">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h2 className="panel-title">Exam Treatment Plan</h2>
        </div>
        <ExamTreatmentPlan
          patientId={patientId}
          patientName={name}
          doctorName={doctorName}
          insuranceLabel={scheduled?.insurance}
        />
      </div>
    </div>
  );
}
