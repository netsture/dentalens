import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { Plus, Trash2 } from "lucide-react";

type OwnershipRow = {
  id: number;
  name: string;
  percentage: string;
  remarks: string;
  effectiveDate: string;
  terminateDate: string;
};

type ContactRow = {
  id: number;
  user: string;
  phone: string;
  fax: string;
  email: string;
  effectiveDate: string;
  terminateDate: string;
};

type BasicFields = {
  displayName: string;
  dba: string;
  dba1: string;
  dba2: string;
  fictitiousDate: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  fax: string;
  email: string;
  taxIdName: string;
  npiType: string;
  npiNumber: string;
  npiEffectiveDate: string;
  corpEffectiveDate: string;
  corpTerminateDate: string;
};

type FieldErrors = Record<string, string>;

let nextId = 2;

const errorBorder = "border-destructive focus:border-destructive";
const normalBorder = "border-border focus:border-primary";

function FormRow({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-1 sm:gap-x-3 ${
        error ? "items-start" : "items-center"
      } ${className}`}
    >
      <label
        className={`text-[11px] font-medium sm:text-right leading-tight ${
          error ? "text-destructive sm:pt-1.5" : "text-foreground"
        }`}
      >
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      <div className="min-w-0 flex flex-col gap-0.5">
        {children}
        {error ? <p className="text-[10px] text-destructive leading-tight">{error}</p> : null}
      </div>
    </div>
  );
}

function FieldInput({
  invalid,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      className={`h-7 w-full px-2 text-[12px] border rounded-[3px] bg-background outline-none ${
        invalid ? errorBorder : normalBorder
      } ${className}`}
    />
  );
}

function FieldSelect({
  invalid,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...props}
      className={`h-7 w-full px-2 text-[12px] border rounded-[3px] bg-background outline-none ${
        invalid ? errorBorder : normalBorder
      } ${className}`}
    />
  );
}

const cities = ["Philadelphia", "Camden", "Wilmington", "Trenton"];
const states = ["Pennsylvania", "New Jersey", "Delaware", "New York"];
const countries = ["United States", "Canada"];
const users = ["Hart, Alex", "Moses, Greg", "Thomas, Rollins", "Patel, Priya"];
const officeOptions = [
  { value: "CENT", label: "CENT : City Center" },
  { value: "SOUTH", label: "SOUTH - Bright Smiles South" },
  { value: "MAIN", label: "MAIN - Bright Smiles Main" },
];

const emptyBasic: BasicFields = {
  displayName: "",
  dba: "",
  dba1: "",
  dba2: "",
  fictitiousDate: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  fax: "",
  email: "",
  taxIdName: "",
  npiType: "Group",
  npiNumber: "",
  npiEffectiveDate: "",
  corpEffectiveDate: "",
  corpTerminateDate: "",
};

function requiredMsg(label: string) {
  return `${label} is required.`;
}

export function AddCorporationForm({ onCancel }: { onCancel?: () => void }) {
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [basic, setBasic] = useState<BasicFields>(emptyBasic);
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [ownership, setOwnership] = useState<OwnershipRow[]>([
    { id: 1, name: "", percentage: "", remarks: "", effectiveDate: "", terminateDate: "" },
  ]);
  const [contacts, setContacts] = useState<ContactRow[]>([
    { id: 1, user: "", phone: "", fax: "", email: "", effectiveDate: "", terminateDate: "" },
  ]);

  const setBasicField = (key: keyof BasicFields, value: string) => {
    setBasic((prev) => ({ ...prev, [key]: value }));
    if (submitted) {
      setErrors((prev) => {
        const next = { ...prev };
        if (value.trim()) delete next[key];
        else if (key in next || ["displayName", "npiNumber", "npiEffectiveDate", "corpEffectiveDate"].includes(key)) {
          // will revalidate on next create; clear when filled
          delete next[key];
        }
        return next;
      });
    }
  };

  const clearError = (key: string) => {
    if (!submitted) return;
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!basic.displayName.trim()) next.displayName = requiredMsg("Display Name");
    if (!basic.npiNumber.trim()) next.npiNumber = requiredMsg("NPI Number");
    if (!basic.npiEffectiveDate.trim()) next.npiEffectiveDate = requiredMsg("NPI Effective Date");
    if (!basic.corpEffectiveDate.trim()) next.corpEffectiveDate = requiredMsg("Corp. Effective Date");

    ownership.forEach((row) => {
      if (!row.name.trim()) next[`own-${row.id}-name`] = requiredMsg("Ownership Name");
      if (!row.percentage.trim()) next[`own-${row.id}-percentage`] = requiredMsg("Ownership Percentage");
      if (!row.effectiveDate.trim()) next[`own-${row.id}-effectiveDate`] = requiredMsg("Effective Date");
    });

    contacts.forEach((row) => {
      if (!row.user.trim()) next[`contact-${row.id}-user`] = requiredMsg("User");
      if (!row.phone.trim()) next[`contact-${row.id}-phone`] = requiredMsg("Phone Number");
      if (!row.email.trim()) next[`contact-${row.id}-email`] = requiredMsg("Email");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
        next[`contact-${row.id}-email`] = "Enter a valid email address.";
      }
    });

    return next;
  };

  const addOwnership = () => {
    setOwnership((rows) => [
      ...rows,
      { id: nextId++, name: "", percentage: "", remarks: "", effectiveDate: "", terminateDate: "" },
    ]);
  };

  const removeOwnership = (id: number) => {
    setOwnership((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`own-${id}-name`];
      delete next[`own-${id}-percentage`];
      delete next[`own-${id}-effectiveDate`];
      return next;
    });
  };

  const addContact = () => {
    setContacts((rows) => [
      ...rows,
      { id: nextId++, user: "", phone: "", fax: "", email: "", effectiveDate: "", terminateDate: "" },
    ]);
  };

  const removeContact = (id: number) => {
    setContacts((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`contact-${id}-user`];
      delete next[`contact-${id}-phone`];
      delete next[`contact-${id}-email`];
      return next;
    });
  };

  const toggleOffice = (value: string) => {
    setSelectedOffices((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleCreate = () => {
    setSubmitted(true);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSaved(false);
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground">
        Fields with <span className="text-destructive">*</span> are required.
      </p>
      {submitted && errorCount > 0 ? (
        <p className="text-[11px] text-destructive font-medium">
          Please fix {errorCount} required field{errorCount === 1 ? "" : "s"} below.
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5">
        <FormRow label="Display Name" required error={errors.displayName}>
          <FieldInput
            invalid={!!errors.displayName}
            value={basic.displayName}
            onChange={(e) => setBasicField("displayName", e.target.value)}
          />
        </FormRow>
        <FormRow label="Doing Business As (DBA)/Brand Name">
          <FieldInput value={basic.dba} onChange={(e) => setBasicField("dba", e.target.value)} />
        </FormRow>
        <FormRow label="Doing Business1 As (DBA)/Brand Name">
          <FieldInput value={basic.dba1} onChange={(e) => setBasicField("dba1", e.target.value)} />
        </FormRow>
        <FormRow label="Doing Business2 As (DBA)/Brand Name 2">
          <FieldInput value={basic.dba2} onChange={(e) => setBasicField("dba2", e.target.value)} />
        </FormRow>
        <FormRow label="Effective Date For Fictitious Name Regn.">
          <FieldInput
            type="date"
            className="max-w-[200px]"
            value={basic.fictitiousDate}
            onChange={(e) => setBasicField("fictitiousDate", e.target.value)}
          />
        </FormRow>
        <FormRow label="Street Address Line1">
          <FieldInput value={basic.address1} onChange={(e) => setBasicField("address1", e.target.value)} />
        </FormRow>
        <FormRow label="Street Address Line2">
          <FieldInput value={basic.address2} onChange={(e) => setBasicField("address2", e.target.value)} />
        </FormRow>
        <FormRow label="Town/City">
          <FieldSelect value={basic.city} onChange={(e) => setBasicField("city", e.target.value)}>
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FieldSelect>
        </FormRow>
        <FormRow label="State/Province">
          <FieldSelect value={basic.state} onChange={(e) => setBasicField("state", e.target.value)}>
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FieldSelect>
        </FormRow>
        <FormRow label="Country">
          <FieldSelect value={basic.country} onChange={(e) => setBasicField("country", e.target.value)}>
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FieldSelect>
        </FormRow>
        <FormRow label="Phone Number">
          <FieldInput type="tel" value={basic.phone} onChange={(e) => setBasicField("phone", e.target.value)} />
        </FormRow>
        <FormRow label="Fax Number">
          <FieldInput type="tel" value={basic.fax} onChange={(e) => setBasicField("fax", e.target.value)} />
        </FormRow>
        <FormRow label="Email">
          <FieldInput type="email" value={basic.email} onChange={(e) => setBasicField("email", e.target.value)} />
        </FormRow>
        <FormRow label="Tax Id Name">
          <FieldInput value={basic.taxIdName} onChange={(e) => setBasicField("taxIdName", e.target.value)} />
        </FormRow>
        <FormRow label="Npi Type">
          <FieldSelect value={basic.npiType} onChange={(e) => setBasicField("npiType", e.target.value)}>
            <option>Group</option>
            <option>Individual</option>
          </FieldSelect>
        </FormRow>
        <FormRow label="Npi Number" required error={errors.npiNumber}>
          <FieldInput
            invalid={!!errors.npiNumber}
            value={basic.npiNumber}
            onChange={(e) => setBasicField("npiNumber", e.target.value)}
          />
        </FormRow>
        <FormRow label="Npi Effective Date" required error={errors.npiEffectiveDate}>
          <FieldInput
            type="date"
            className="max-w-[200px]"
            invalid={!!errors.npiEffectiveDate}
            value={basic.npiEffectiveDate}
            onChange={(e) => setBasicField("npiEffectiveDate", e.target.value)}
          />
        </FormRow>
        <FormRow label="Corp. Effective Date" required error={errors.corpEffectiveDate}>
          <FieldInput
            type="date"
            className="max-w-[200px]"
            invalid={!!errors.corpEffectiveDate}
            value={basic.corpEffectiveDate}
            onChange={(e) => setBasicField("corpEffectiveDate", e.target.value)}
          />
        </FormRow>
        <FormRow label="Corp. Terminate Date">
          <FieldInput
            type="date"
            className="max-w-[200px]"
            value={basic.corpTerminateDate}
            onChange={(e) => setBasicField("corpTerminateDate", e.target.value)}
          />
        </FormRow>
        <FormRow label="Office">
          <div className="border border-border rounded-[3px] bg-background p-2 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground">— Choose options below —</span>
            {officeOptions.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-[12px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOffices.includes(o.value)}
                  onChange={() => toggleOffice(o.value)}
                  className="rounded-[2px]"
                />
                {o.label}
              </label>
            ))}
          </div>
        </FormRow>
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-[12px] font-bold">Corporation Ownership Information</h3>
          <button type="button" className="btn h-6 px-2 text-[11px]" onClick={addOwnership}>
            <Plus className="w-3 h-3" /> Add Ownership Details
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {ownership.map((row, index) => {
            const nameErr = errors[`own-${row.id}-name`];
            const pctErr = errors[`own-${row.id}-percentage`];
            const effErr = errors[`own-${row.id}-effectiveDate`];
            return (
              <div key={row.id} className="bg-secondary/60 border border-border rounded-[3px] p-3 flex flex-col gap-2.5 relative">
                {ownership.length > 1 && (
                  <button
                    type="button"
                    className="btn h-6 px-2 text-[11px] absolute top-2 right-2"
                    onClick={() => removeOwnership(row.id)}
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
                <FormRow label="Ownership Name" required error={nameErr} className={ownership.length > 1 ? "pr-20" : ""}>
                  <FieldInput
                    invalid={!!nameErr}
                    value={row.name}
                    onChange={(e) => {
                      setOwnership((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, name: e.target.value } : r))
                      );
                      if (e.target.value.trim()) clearError(`own-${row.id}-name`);
                    }}
                  />
                </FormRow>
                <FormRow label="Ownership Percentage" required error={pctErr}>
                  <FieldInput
                    invalid={!!pctErr}
                    value={row.percentage}
                    onChange={(e) => {
                      setOwnership((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, percentage: e.target.value } : r))
                      );
                      if (e.target.value.trim()) clearError(`own-${row.id}-percentage`);
                    }}
                  />
                </FormRow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <FormRow label="Remarks">
                    <FieldInput
                      value={row.remarks}
                      onChange={(e) =>
                        setOwnership((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, remarks: e.target.value } : r))
                        )
                      }
                    />
                  </FormRow>
                  <FormRow label="Effective Date" required error={effErr}>
                    <FieldInput
                      type="date"
                      invalid={!!effErr}
                      value={row.effectiveDate}
                      onChange={(e) => {
                        setOwnership((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, effectiveDate: e.target.value } : r))
                        );
                        if (e.target.value.trim()) clearError(`own-${row.id}-effectiveDate`);
                      }}
                    />
                  </FormRow>
                </div>
                <FormRow label="Terminate Date">
                  <FieldInput
                    type="date"
                    className="max-w-[200px]"
                    value={row.terminateDate}
                    onChange={(e) =>
                      setOwnership((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, terminateDate: e.target.value } : r))
                      )
                    }
                  />
                </FormRow>
                {ownership.length > 1 && (
                  <p className="text-[10px] text-muted-foreground">Owner #{index + 1}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-3 flex flex-col gap-2.5">
        <h3 className="text-[12px] font-bold mb-1">Corporation Bank Information</h3>
        <FormRow label="Name">
          <FieldInput />
        </FormRow>
        <FormRow label="Address">
          <FieldInput />
        </FormRow>
        <FormRow label="Routing Number">
          <FieldInput />
        </FormRow>
        <FormRow label="Account Number">
          <FieldInput />
        </FormRow>
        <FormRow label="Detail Img">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-[11px] text-muted-foreground file:mr-2 file:h-7 file:px-2 file:rounded-[3px] file:border file:border-border file:bg-secondary file:text-[11px] file:font-semibold file:cursor-pointer"
          />
        </FormRow>
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-[12px] font-bold">Corporation Contact Person Information</h3>
          <button type="button" className="btn h-6 px-2 text-[11px]" onClick={addContact}>
            <Plus className="w-3 h-3" /> Add Contact Person
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {contacts.map((row, index) => {
            const userErr = errors[`contact-${row.id}-user`];
            const phoneErr = errors[`contact-${row.id}-phone`];
            const emailErr = errors[`contact-${row.id}-email`];
            return (
              <div key={row.id} className="bg-secondary/60 border border-border rounded-[3px] p-3 flex flex-col gap-2.5 relative">
                {contacts.length > 1 && (
                  <button
                    type="button"
                    className="btn h-6 px-2 text-[11px] absolute top-2 right-2"
                    onClick={() => removeContact(row.id)}
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
                <FormRow label="User" required error={userErr} className={contacts.length > 1 ? "pr-20" : ""}>
                  <FieldSelect
                    invalid={!!userErr}
                    value={row.user}
                    onChange={(e) => {
                      setContacts((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, user: e.target.value } : r))
                      );
                      if (e.target.value.trim()) clearError(`contact-${row.id}-user`);
                    }}
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </FieldSelect>
                </FormRow>
                <FormRow label="Phone Number" required error={phoneErr}>
                  <FieldInput
                    type="tel"
                    invalid={!!phoneErr}
                    value={row.phone}
                    onChange={(e) => {
                      setContacts((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, phone: e.target.value } : r))
                      );
                      if (e.target.value.trim()) clearError(`contact-${row.id}-phone`);
                    }}
                  />
                </FormRow>
                <FormRow label="Fax Number">
                  <FieldInput
                    type="tel"
                    value={row.fax}
                    onChange={(e) =>
                      setContacts((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, fax: e.target.value } : r))
                      )
                    }
                  />
                </FormRow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <FormRow label="Email" required error={emailErr}>
                    <FieldInput
                      type="email"
                      invalid={!!emailErr}
                      value={row.email}
                      onChange={(e) => {
                        setContacts((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, email: e.target.value } : r))
                        );
                        if (e.target.value.trim()) clearError(`contact-${row.id}-email`);
                      }}
                    />
                  </FormRow>
                  <FormRow label="Effective Date">
                    <FieldInput
                      type="date"
                      value={row.effectiveDate}
                      onChange={(e) =>
                        setContacts((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, effectiveDate: e.target.value } : r))
                        )
                      }
                    />
                  </FormRow>
                </div>
                <FormRow label="Terminate Date">
                  <FieldInput
                    type="date"
                    className="max-w-[200px]"
                    value={row.terminateDate}
                    onChange={(e) =>
                      setContacts((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, terminateDate: e.target.value } : r))
                      )
                    }
                  />
                </FormRow>
                {contacts.length > 1 && (
                  <p className="text-[10px] text-muted-foreground">Contact #{index + 1}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button type="button" className="btn btn-primary" onClick={handleCreate}>
          {saved ? "Created!" : "Create"}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
