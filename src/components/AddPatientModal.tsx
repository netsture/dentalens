import { useState } from "react";
import { Save, UserPlus, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: (patient: { id: string; name: string }) => void;
  onAddInsurance?: (patient: { id: string; name: string }) => void;
};

const prefixes = ["", "Mr.", "Mrs.", "Ms.", "Dr.", "Miss"];
const states = ["", "CA", "PA", "NY", "TX", "FL", "OH", "IL"];

export function AddPatientModal({ open, onClose, onSaved, onAddInsurance }: Props) {
  const [relationship, setRelationship] = useState("self");
  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("Craig");
  const [lastName, setLastName] = useState("Green");
  const [dob, setDob] = useState("1979-01-01");
  const [gender, setGender] = useState("Male");
  const [patientType, setPatientType] = useState("general");
  const [referral, setReferral] = useState("None");
  const [location, setLocation] = useState("CENT : City Center");
  const [address, setAddress] = useState("123 Main St");
  const [address2, setAddress2] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [comms, setComms] = useState({
    text: true,
    voice: true,
    emailNotifications: true,
    marketingEmails: false,
    patientPortal: true,
    postcards: false,
  });
  const [showMoreName, setShowMoreName] = useState(false);
  const [middleName, setMiddleName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  if (!open) return null;

  const patientPayload = {
    id: "1590",
    name: `${lastName.trim()}, ${firstName.trim()}`.replace(/^,\s*|,\s*$/g, "") || "Green, Craig",
  };

  const handleSave = () => {
    setSavedFlash(true);
    onSaved?.(patientPayload);
    window.setTimeout(() => {
      setSavedFlash(false);
      onClose();
    }, 700);
  };

  const toggleComm = (key: keyof typeof comms) => {
    setComms((prev) => ({ ...prev, [key]: !prev[key] }));
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
            <UserPlus className="w-3.5 h-3.5 text-primary" />
            Add New Patient
          </div>
          <button type="button" className="btn" onClick={onClose} aria-label="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 overflow-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="field md:col-span-2">
              <label>Relationship to RP *</label>
              <div className="flex flex-wrap gap-3 pt-1">
                {[
                  ["self", "Self"],
                  ["spouse", "Spouse"],
                  ["child", "Dependent Child"],
                  ["other", "Other"],
                ].map(([value, label]) => (
                  <label key={value} className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="relationship"
                      checked={relationship === value}
                      onChange={() => setRelationship(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Prefix</label>
              <select value={prefix} onChange={(e) => setPrefix(e.target.value)}>
                <option value="">Prefix</option>
                {prefixes.filter(Boolean).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field flex items-end">
              <button type="button" className="btn" onClick={() => setShowMoreName((v) => !v)}>
                {showMoreName ? "− Hide Name Options" : "+ More Name Options"}
              </button>
            </div>
            <div className="field">
              <label>First Name *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
            </div>
            <div className="field">
              <label>Last Name *</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
            </div>

            {showMoreName && (
              <>
                <div className="field">
                  <label>Middle Name</label>
                  <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Preferred Name</label>
                  <input value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
                </div>
              </>
            )}

            <div className="field">
              <label>Date of Birth *</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="field">
              <label>Gender *</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            <div className="field md:col-span-2">
              <label>Patient Type</label>
              <div className="flex flex-wrap gap-3 pt-1">
                <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="radio"
                    name="patientType"
                    checked={patientType === "general"}
                    onChange={() => setPatientType("general")}
                  />
                  General Patient
                </label>
                <label className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="radio"
                    name="patientType"
                    checked={patientType === "ortho"}
                    onChange={() => setPatientType("ortho")}
                  />
                  Ortho Patient
                </label>
              </div>
            </div>

            <div className="field">
              <label>Referral Source</label>
              <select value={referral} onChange={(e) => setReferral(e.target.value)}>
                <option>None</option>
                <option>Patient Referral</option>
                <option>Google</option>
                <option>Insurance Directory</option>
                <option>Walk-in</option>
              </select>
            </div>
            <div className="field">
              <label>Location *</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option>CENT : City Center</option>
                <option>SOUTH - Bright Smiles South</option>
                <option>MAIN - Bright Smiles Main</option>
              </select>
            </div>
          </div>

          <div>
            <div className="panel-title mb-2">Contact Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="field md:col-span-2">
                <label>Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
              </div>
              <div className="field md:col-span-2">
                <label>Address Line 2</label>
                <input value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Address Line 2" />
              </div>
              <div className="field">
                <label>ZIP</label>
                <div className="flex gap-1.5">
                  <input className="flex-1" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP" />
                  <button type="button" className="btn shrink-0">Verify</button>
                </div>
              </div>
              <div className="field">
                <label>City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              </div>
              <div className="field">
                <label>State</label>
                <select value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">State</option>
                  {states.filter(Boolean).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Mobile</label>
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="(____) ___-____" />
              </div>
              <div className="field md:col-span-2">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="field md:col-span-2">
                <label>Enable Communications</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                  {(
                    [
                      ["text", "Text"],
                      ["voice", "Voice"],
                      ["emailNotifications", "Email Notifications"],
                      ["marketingEmails", "Marketing Emails"],
                      ["patientPortal", "Patient Portal"],
                      ["postcards", "Postcards"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
                      <input type="checkbox" checked={comms[key]} onChange={() => toggleComm(key)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              {showMoreDetails && (
                <div className="field">
                  <label>SSN</label>
                  <input placeholder="XXX-XX-XXXX" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panel-header border-t shrink-0 !bg-secondary/60 flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setShowMoreDetails((v) => !v)}>
            {showMoreDetails ? "− Hide Extra Details" : "+ Add More Details"}
          </button>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button type="button" className="btn" onClick={() => onAddInsurance?.(patientPayload)}>
              Add Insurance
            </button>
            <button type="button" className="btn">Add another patient</button>
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
