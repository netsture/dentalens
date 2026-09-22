import { useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  Database,
  Palette,
  Plug,
  Save,
  Shield,
  User,
} from "lucide-react";

const tabs = [
  { id: "practice", label: "Practice", icon: Building2 },
  { id: "account", label: "Account", icon: User },
  { id: "appointments", label: "Appointments", icon: Database },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Plug },
] as const;

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={`field ${full ? "md:col-span-2" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 md:col-span-2 border-b border-border last:border-0">
      <div>
        <p className="text-[12px] font-semibold text-foreground">{label}</p>
        {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`w-9 h-5 rounded-full relative border-none cursor-pointer transition-colors ${
          on ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            on ? "left-4.5 right-0.5 left-auto" : "left-0.5"
          }`}
          style={{ left: on ? "18px" : "2px" }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("practice");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-[16px] font-bold">Settings</h1>
          <p className="text-[11px] text-muted-foreground">
            Manage practice, account, billing, and app preferences.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="panel flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border bg-secondary shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 h-9 text-[11px] font-semibold whitespace-nowrap border-none cursor-pointer border-b-2 ${
                  tab === t.id
                    ? "bg-card text-primary border-primary"
                    : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 overflow-auto flex-1">
          {tab === "practice" && (
            <div className="space-y-4 max-w-4xl">
              <h3 className="text-[13px] font-bold">Practice Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Practice Name"><input defaultValue="DentSaas Clinic" /></Field>
                <Field label="Legal Entity Name"><input defaultValue="DentSaas LLC" /></Field>
                <Field label="Tax ID / EIN"><input defaultValue="00-0000000" /></Field>
                <Field label="NPI Number"><input defaultValue="1234567890" /></Field>
                <Field label="Phone"><input defaultValue="215-224-4343" /></Field>
                <Field label="Email"><input type="email" defaultValue="info@gmail.com" /></Field>
                <Field label="Website"><input defaultValue="https://dentsaas.com" /></Field>
                <Field label="Timezone">
                  <select defaultValue="est">
                    <option value="est">Eastern (EST)</option>
                    <option value="cst">Central (CST)</option>
                    <option value="mst">Mountain (MST)</option>
                    <option value="pst">Pacific (PST)</option>
                  </select>
                </Field>
                <Field label="Office Address" full>
                  <textarea rows={2} defaultValue="6100 N 5TH ST, #2, Philadelphia, Pennsylvania, 19120" />
                </Field>
              </div>
              <h3 className="text-[13px] font-bold pt-2">Working Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Start Time"><input type="time" defaultValue="08:00" /></Field>
                <Field label="End Time"><input type="time" defaultValue="18:00" /></Field>
                <Field label="Working Days">
                  <select defaultValue="mon-fri">
                    <option value="mon-fri">Monday – Friday</option>
                    <option value="mon-sat">Monday – Saturday</option>
                    <option value="all">All Week</option>
                  </select>
                </Field>
                <Field label="Default Appointment Duration">
                  <select defaultValue="30">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {tab === "account" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              <Field label="First Name"><input defaultValue="Samir" /></Field>
              <Field label="Last Name"><input defaultValue="Admin" /></Field>
              <Field label="Email"><input type="email" defaultValue="admin@gmail.com" /></Field>
              <Field label="Phone"><input defaultValue="+1 215 000 0000" /></Field>
              <Field label="Role">
                <select defaultValue="admin">
                  <option value="admin">Administrator</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Front Desk</option>
                </select>
              </Field>
              <Field label="Language">
                <select defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </Field>
            </div>
          )}

          {tab === "appointments" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              <Field label="Default View">
                <select defaultValue="day">
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </Field>
              <Field label="Slot Interval">
                <select defaultValue="15">
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                </select>
              </Field>
              <Field label="Buffer Between Appointments (min)"><input type="number" defaultValue={5} /></Field>
              <ToggleRow label="Allow Online Booking" description="Patients can self-schedule from the portal." defaultChecked />
              <ToggleRow label="Require Insurance Verification" />
              <ToggleRow label="Send Reminder Emails" defaultChecked />
              <ToggleRow label="Send Reminder SMS" defaultChecked />
            </div>
          )}

          {tab === "billing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              <Field label="Current Plan">
                <select defaultValue="pro">
                  <option value="starter">Starter – $49/mo</option>
                  <option value="pro">Pro – $149/mo</option>
                  <option value="enterprise">Enterprise – Custom</option>
                </select>
              </Field>
              <Field label="Billing Cycle">
                <select defaultValue="monthly">
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual (save 20%)</option>
                </select>
              </Field>
              <Field label="Currency">
                <select defaultValue="usd">
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                </select>
              </Field>
              <Field label="Tax Rate (%)"><input type="number" defaultValue={6} /></Field>
              <Field label="Billing Email" full><input type="email" defaultValue="billing@gmail.com" /></Field>
            </div>
          )}

          {tab === "notifications" && (
            <div className="max-w-2xl">
              <ToggleRow label="New Appointment Booked" defaultChecked />
              <ToggleRow label="Appointment Cancelled" defaultChecked />
              <ToggleRow label="Patient Check-in" />
              <ToggleRow label="Payment Received" defaultChecked />
              <ToggleRow label="Claim Status Updates" defaultChecked />
              <ToggleRow label="Weekly Practice Summary" description="Receive a digest every Monday." defaultChecked />
            </div>
          )}

          {tab === "security" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              <Field label="Current Password"><input type="password" placeholder="••••••••" /></Field>
              <Field label="New Password"><input type="password" placeholder="••••••••" /></Field>
              <Field label="Session Timeout (minutes)">
                <select defaultValue="30">
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </Field>
              <Field label="Password Policy">
                <select defaultValue="strong">
                  <option value="basic">Basic (8+ chars)</option>
                  <option value="strong">Strong (12+ mixed)</option>
                  <option value="hipaa">HIPAA Recommended</option>
                </select>
              </Field>
              <ToggleRow label="Two-Factor Authentication" description="Require a code in addition to password." defaultChecked />
              <ToggleRow label="Audit Log" description="Track all changes for compliance." defaultChecked />
              <ToggleRow label="IP Whitelist" />
            </div>
          )}

          {tab === "appearance" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              <Field label="Date Format">
                <select defaultValue="mdy">
                  <option value="mdy">MM/DD/YYYY</option>
                  <option value="dmy">DD/MM/YYYY</option>
                  <option value="ymd">YYYY-MM-DD</option>
                </select>
              </Field>
              <Field label="Time Format">
                <select defaultValue="12">
                  <option value="12">12-hour</option>
                  <option value="24">24-hour</option>
                </select>
              </Field>
              <ToggleRow label="Compact Sidebar by Default" />
              <ToggleRow label="Show Onboarding Tips" defaultChecked />
            </div>
          )}

          {tab === "integrations" && (
            <div className="max-w-2xl">
              <ToggleRow label="Google Calendar Sync" description="Two-way sync for appointments." />
              <ToggleRow label="Stripe Payments" description="Accept patient payments online." defaultChecked />
              <ToggleRow label="Twilio SMS" description="Send appointment reminders via SMS." defaultChecked />
              <ToggleRow label="Mailchimp" />
              <ToggleRow label="QuickBooks" description="Export accounting data." />
              <div className="field mt-3">
                <label>API Webhook URL</label>
                <input placeholder="https://your-app.com/webhooks/dentsaas" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
