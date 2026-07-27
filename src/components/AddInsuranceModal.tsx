import { useState } from "react";
import { Save, ShieldCheck, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  responsibleParty?: { id: string; name: string };
  onSaved?: () => void;
};

export function AddInsuranceModal({
  open,
  onClose,
  responsibleParty = { id: "1590", name: "Green, Craig" },
  onSaved,
}: Props) {
  const [subscriberMode, setSubscriberMode] = useState<"same" | "existing" | "new">("same");
  const [idType, setIdType] = useState<"subscriber" | "ssn">("subscriber");
  const [subscriberId, setSubscriberId] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("2026-07-22");
  const [employer, setEmployer] = useState("");
  const [draftEmployer, setDraftEmployer] = useState("");
  const [carrier, setCarrier] = useState("");
  const [draftCarrier, setDraftCarrier] = useState("");
  const [plan, setPlan] = useState("");
  const [draftPlan, setDraftPlan] = useState("");
  const [memberChecked, setMemberChecked] = useState(true);
  const [notes, setNotes] = useState("");
  const [verified, setVerified] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  if (!open) return null;

  const rpLabel = `${responsibleParty.name} (${responsibleParty.id})`;

  const handleSave = () => {
    setSavedFlash(true);
    onSaved?.();
    window.setTimeout(() => {
      setSavedFlash(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[3000] flex items-start justify-center p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="panel bg-card w-full max-w-3xl shadow-xl my-6 flex flex-col max-h-[calc(100vh-48px)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="panel-header shrink-0">
          <div className="panel-title flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Add New Insurance to Family
          </div>
          <button type="button" className="btn" onClick={onClose} aria-label="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 overflow-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="field">
              <label>Responsible Party</label>
              <div className="text-[12px] font-semibold h-7 flex items-center">{rpLabel}</div>
            </div>
            <div className="field flex items-end">
              <button type="button" className="btn">Add Another Member</button>
            </div>

            <div className="field md:col-span-2">
              <label>Subscriber</label>
              <div className="flex flex-wrap gap-3 pt-1">
                <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="radio"
                    name="subscriberMode"
                    checked={subscriberMode === "same"}
                    onChange={() => setSubscriberMode("same")}
                  />
                  Same as RP
                </label>
                <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="radio"
                    name="subscriberMode"
                    checked={subscriberMode === "existing"}
                    onChange={() => setSubscriberMode("existing")}
                  />
                  Select From Existing
                </label>
                <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="radio"
                    name="subscriberMode"
                    checked={subscriberMode === "new"}
                    onChange={() => setSubscriberMode("new")}
                  />
                  Add New
                </label>
              </div>
              {subscriberMode === "same" && (
                <p className="text-[12px] font-semibold mt-1.5">{rpLabel}</p>
              )}
              {subscriberMode === "existing" && (
                <select className="mt-1.5" defaultValue={rpLabel}>
                  <option>{rpLabel}</option>
                  <option>Hall, Dan (1147)</option>
                  <option>Wingard, Denise (16665)</option>
                </select>
              )}
              {subscriberMode === "new" && (
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <input placeholder="First Name" />
                  <input placeholder="Last Name" />
                </div>
              )}
            </div>

            <div className="field md:col-span-2">
              <label>Subscriber ID Type</label>
              <div className="flex flex-wrap gap-3 pt-1">
                <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="radio"
                    name="idType"
                    checked={idType === "subscriber"}
                    onChange={() => setIdType("subscriber")}
                  />
                  Subscriber ID
                </label>
                <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input type="radio" name="idType" checked={idType === "ssn"} onChange={() => setIdType("ssn")} />
                  SSN
                </label>
              </div>
            </div>

            <div className="field">
              <label>Subscriber ID *</label>
              <input
                value={subscriberId}
                onChange={(e) => setSubscriberId(e.target.value)}
                placeholder={idType === "ssn" ? "XXX-XX-XXXX" : "Enter subscriber ID"}
              />
            </div>
            <div className="field">
              <label>Effective Date *</label>
              <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
            </div>

            <div className="field">
              <label>Employer</label>
              <select value={employer} onChange={(e) => setEmployer(e.target.value)}>
                <option value="">Select</option>
                <option>Acme Corp</option>
                <option>Hyatt Corporation</option>
                <option>Self Employed</option>
              </select>
            </div>
            <div className="field">
              <label>Draft Employer</label>
              <input
                placeholder="Add Draft Employer Information"
                value={draftEmployer}
                onChange={(e) => setDraftEmployer(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Carrier *</label>
              <select value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                <option value="">Select</option>
                <option>Cigna</option>
                <option>Delta Dental</option>
                <option>Aetna</option>
                <option>MetLife</option>
              </select>
            </div>
            <div className="field">
              <label>Draft Carrier</label>
              <div className="flex gap-1.5">
                <input
                  className="flex-1"
                  placeholder="Add Draft Carrier Name"
                  value={draftCarrier}
                  onChange={(e) => setDraftCarrier(e.target.value)}
                />
                <button type="button" className="btn shrink-0">Add New</button>
              </div>
            </div>

            <div className="field">
              <label>Plan *</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="">Select</option>
                <option>Cigna Silver Plan</option>
                <option>Delta PPO</option>
                <option>Aetna Dental PPO</option>
              </select>
            </div>
            <div className="field">
              <label>Draft Plan / Group No.</label>
              <div className="flex gap-1.5">
                <input
                  className="flex-1"
                  placeholder="Add Plan/ Group No."
                  value={draftPlan}
                  onChange={(e) => setDraftPlan(e.target.value)}
                />
                <button type="button" className="btn shrink-0">Add New</button>
              </div>
            </div>

            <div className="field md:col-span-2">
              <label>Covered Members</label>
              <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer pt-1">
                <input type="checkbox" checked={memberChecked} onChange={() => setMemberChecked((v) => !v)} />
                {rpLabel} <span className="text-muted-foreground">(Subscriber)</span>
              </label>
            </div>

            <div className="field md:col-span-2">
              <label>Notes</label>
              <textarea rows={3} placeholder="Type content here" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="field md:col-span-2">
              <label>Verification</label>
              <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer pt-1">
                <input type="checkbox" checked={verified} onChange={() => setVerified((v) => !v)} />
                Mark Insurance as Verified
              </label>
            </div>
          </div>
        </div>

        <div className="panel-header border-t shrink-0 !bg-secondary/60 flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={handleSave}>
            Save and add another insurance
          </button>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button type="button" className="btn" onClick={handleSave}>Add Appointment</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" /> {savedFlash ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
