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

let nextId = 2;

function FormRow({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-1 sm:gap-x-3 items-center ${className}`}>
      <label className="text-[11px] font-medium text-foreground sm:text-right leading-tight">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-7 w-full px-2 text-[12px] border border-border rounded-[3px] bg-background outline-none focus:border-primary ${props.className || ""}`}
    />
  );
}

function FieldSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-7 w-full px-2 text-[12px] border border-border rounded-[3px] bg-background outline-none focus:border-primary ${props.className || ""}`}
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

export function AddCorporationForm({ onCancel }: { onCancel?: () => void }) {
  const [saved, setSaved] = useState(false);
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [ownership, setOwnership] = useState<OwnershipRow[]>([
    { id: 1, name: "", percentage: "", remarks: "", effectiveDate: "", terminateDate: "" },
  ]);
  const [contacts, setContacts] = useState<ContactRow[]>([
    { id: 1, user: "", phone: "", fax: "", email: "", effectiveDate: "", terminateDate: "" },
  ]);

  const addOwnership = () => {
    setOwnership((rows) => [
      ...rows,
      { id: nextId++, name: "", percentage: "", remarks: "", effectiveDate: "", terminateDate: "" },
    ]);
  };

  const removeOwnership = (id: number) => {
    setOwnership((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  };

  const addContact = () => {
    setContacts((rows) => [
      ...rows,
      { id: nextId++, user: "", phone: "", fax: "", email: "", effectiveDate: "", terminateDate: "" },
    ]);
  };

  const removeContact = (id: number) => {
    setContacts((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  };

  const toggleOffice = (value: string) => {
    setSelectedOffices((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleCreate = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground">
        Fields with <span className="text-destructive">*</span> are required.
      </p>

      <div className="flex flex-col gap-2.5">
        <FormRow label="Display Name" required>
          <FieldInput />
        </FormRow>
        <FormRow label="Doing Business As (DBA)/Brand Name">
          <FieldInput />
        </FormRow>
        <FormRow label="Doing Business1 As (DBA)/Brand Name">
          <FieldInput />
        </FormRow>
        <FormRow label="Doing Business2 As (DBA)/Brand Name 2">
          <FieldInput />
        </FormRow>
        <FormRow label="Effective Date For Fictitious Name Regn.">
          <FieldInput type="date" className="max-w-[200px]" />
        </FormRow>
        <FormRow label="Street Address Line1">
          <FieldInput />
        </FormRow>
        <FormRow label="Street Address Line2">
          <FieldInput />
        </FormRow>
        <FormRow label="Town/City">
          <FieldSelect defaultValue="">
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FieldSelect>
        </FormRow>
        <FormRow label="State/Province">
          <FieldSelect defaultValue="">
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FieldSelect>
        </FormRow>
        <FormRow label="Country">
          <FieldSelect defaultValue="">
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FieldSelect>
        </FormRow>
        <FormRow label="Phone Number">
          <FieldInput type="tel" />
        </FormRow>
        <FormRow label="Fax Number">
          <FieldInput type="tel" />
        </FormRow>
        <FormRow label="Email">
          <FieldInput type="email" />
        </FormRow>
        <FormRow label="Tax Id Name">
          <FieldInput />
        </FormRow>
        <FormRow label="Npi Type">
          <FieldSelect defaultValue="Group">
            <option>Group</option>
            <option>Individual</option>
          </FieldSelect>
        </FormRow>
        <FormRow label="Npi Number" required>
          <FieldInput />
        </FormRow>
        <FormRow label="Npi Effective Date" required>
          <FieldInput type="date" className="max-w-[200px]" />
        </FormRow>
        <FormRow label="Corp. Effective Date" required>
          <FieldInput type="date" className="max-w-[200px]" />
        </FormRow>
        <FormRow label="Corp. Terminate Date">
          <FieldInput type="date" className="max-w-[200px]" />
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
          {ownership.map((row, index) => (
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
              <FormRow label="Ownership Name" required className={ownership.length > 1 ? "pr-20" : ""}>
                <FieldInput
                  value={row.name}
                  onChange={(e) =>
                    setOwnership((rows) =>
                      rows.map((r) => (r.id === row.id ? { ...r, name: e.target.value } : r))
                    )
                  }
                />
              </FormRow>
              <FormRow label="Ownership Percentage" required>
                <FieldInput
                  value={row.percentage}
                  onChange={(e) =>
                    setOwnership((rows) =>
                      rows.map((r) => (r.id === row.id ? { ...r, percentage: e.target.value } : r))
                    )
                  }
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
                <FormRow label="Effective Date" required>
                  <FieldInput
                    type="date"
                    value={row.effectiveDate}
                    onChange={(e) =>
                      setOwnership((rows) =>
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
          ))}
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
          {contacts.map((row, index) => (
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
              <FormRow label="User" required className={contacts.length > 1 ? "pr-20" : ""}>
                <FieldSelect
                  value={row.user}
                  onChange={(e) =>
                    setContacts((rows) =>
                      rows.map((r) => (r.id === row.id ? { ...r, user: e.target.value } : r))
                    )
                  }
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </FieldSelect>
              </FormRow>
              <FormRow label="Phone Number" required>
                <FieldInput
                  type="tel"
                  value={row.phone}
                  onChange={(e) =>
                    setContacts((rows) =>
                      rows.map((r) => (r.id === row.id ? { ...r, phone: e.target.value } : r))
                    )
                  }
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
                <FormRow label="Email" required>
                  <FieldInput
                    type="email"
                    value={row.email}
                    onChange={(e) =>
                      setContacts((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, email: e.target.value } : r))
                      )
                    }
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
          ))}
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
