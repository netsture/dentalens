import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  Shield,
  Stethoscope,
  Store,
  Users,
} from "lucide-react";
import { AddCorporationForm } from "@/components/AddCorporationForm";
import { ManageCorporationPanel } from "@/components/ManageCorporationPanel";

type MenuKey =
  | "corporation"
  | "office"
  | "provider"
  | "insurance"
  | "ada"
  | "store"
  | "credentialing"
  | "rules"
  | "communication"
  | "corporate";

type SubKey = string;

type MenuItem = {
  key: MenuKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: { key: SubKey; label: string }[];
};

const menus: MenuItem[] = [
  {
    key: "corporation",
    label: "Corporation",
    icon: Building2,
    items: [
      { key: "corp-add", label: "Add Corporation" },
      { key: "corp-manage", label: "Manage Corporation" },
    ],
  },
  {
    key: "office",
    label: "Office",
    icon: MapPin,
    items: [
      { key: "office-add", label: "Add New Office" },
      { key: "office-manage", label: "Manage Offices" },
      { key: "office-hours", label: "Working Hours" },
    ],
  },
  {
    key: "provider",
    label: "Provider",
    icon: Stethoscope,
    items: [
      { key: "provider-add", label: "Add New Provider" },
      { key: "provider-manage", label: "Manage Provider" },
    ],
  },
  {
    key: "insurance",
    label: "Insurance",
    icon: Shield,
    items: [
      { key: "ins-carriers", label: "Carriers" },
      { key: "ins-plans", label: "Plans" },
      { key: "ins-fee", label: "Fee Schedules" },
    ],
  },
  {
    key: "ada",
    label: "ADA Codes",
    icon: Settings2,
    items: [
      { key: "ada-list", label: "Procedure Codes" },
      { key: "ada-categories", label: "Categories" },
      { key: "ada-favorites", label: "Favorites" },
    ],
  },
  {
    key: "store",
    label: "Dental Store",
    icon: Store,
    items: [
      { key: "store-catalog", label: "Catalog" },
      { key: "store-orders", label: "Orders" },
      { key: "store-vendors", label: "Vendors" },
    ],
  },
  {
    key: "credentialing",
    label: "Credentialing",
    icon: Shield,
    items: [
      { key: "cred-licenses", label: "Licenses" },
      { key: "cred-npi", label: "NPI / Taxonomy" },
      { key: "cred-expiring", label: "Expiring Documents" },
    ],
  },
  {
    key: "rules",
    label: "Business Rule",
    icon: Settings2,
    items: [
      { key: "rules-scheduling", label: "Scheduling Rules" },
      { key: "rules-billing", label: "Billing Rules" },
      { key: "rules-clinical", label: "Clinical Rules" },
    ],
  },
  {
    key: "communication",
    label: "Communication / Directory",
    icon: MessageSquare,
    items: [
      { key: "comm-templates", label: "Message Templates" },
      { key: "comm-directory", label: "Staff Directory" },
      { key: "comm-reminders", label: "Reminder Settings" },
    ],
  },
  {
    key: "corporate",
    label: "Corporate Area",
    icon: Users,
    items: [
      { key: "corp-area-roles", label: "Roles & Access" },
      { key: "corp-area-audit", label: "Audit Log" },
      { key: "corp-area-branding", label: "Branding" },
    ],
  },
];

const providers = [
  { name: "Dr. Hart", npi: "1174557870", specialty: "General Dentistry", location: "SOUTH", status: "Active" },
  { name: "Dr. Greg Moses", npi: "1487923341", specialty: "Restorative", location: "CENT", status: "Active" },
  { name: "Dr. Rollins Thomas", npi: "1029384756", specialty: "Orthodontics", location: "MAIN", status: "Active" },
  { name: "Dr. Patel", npi: "1982736451", specialty: "Periodontics", location: "SOUTH", status: "Inactive" },
];

const offices = [
  { code: "CENT", name: "City Center", phone: "215-555-0100", timezone: "EST", status: "Open" },
  { code: "SOUTH", name: "Bright Smiles South", phone: "215-555-0142", timezone: "EST", status: "Open" },
  { code: "MAIN", name: "Bright Smiles Main", phone: "215-555-0199", timezone: "EST", status: "Open" },
];

const carriers = [
  { name: "Cigna", plans: 12, fee: "Office UCR", status: "Active" },
  { name: "Delta Dental", plans: 8, fee: "Delta PPO", status: "Active" },
  { name: "Aetna", plans: 5, fee: "Aetna Dental", status: "Active" },
  { name: "MetLife", plans: 3, fee: "MetLife PDP", status: "Draft" },
];

const adaCodes = [
  { code: "D0120", description: "Periodic oral evaluation", category: "Diagnostic", fee: "$65.00" },
  { code: "D1110", description: "Prophylaxis - adult", category: "Preventive", fee: "$97.00" },
  { code: "D2740", description: "Crown - porcelain/ceramic", category: "Restorative", fee: "$1,225.00" },
  { code: "D6240", description: "Pontic - porcelain fused to high noble metal", category: "Prosthodontics", fee: "$1,118.00" },
];

const dashboardCards: {
  menuKey: MenuKey;
  title: string;
  count: number;
  unit: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  manageKey: SubKey;
  addKey: SubKey;
  addLabel: string;
}[] = [
  {
    menuKey: "corporation",
    title: "Corporation",
    count: 5,
    unit: "entities",
    description: "Legal entities, NPI, and billing profiles for the practice.",
    icon: Building2,
    manageKey: "corp-manage",
    addKey: "corp-add",
    addLabel: "Add Corporation",
  },
  {
    menuKey: "office",
    title: "Office",
    count: offices.length,
    unit: "locations",
    description: "Practice locations, phones, timezones, and working hours.",
    icon: MapPin,
    manageKey: "office-manage",
    addKey: "office-add",
    addLabel: "Add Office",
  },
  {
    menuKey: "provider",
    title: "Provider",
    count: providers.length,
    unit: "clinicians",
    description: "Doctors and specialists used for scheduling and billing.",
    icon: Stethoscope,
    manageKey: "provider-manage",
    addKey: "provider-add",
    addLabel: "Add Provider",
  },
  {
    menuKey: "insurance",
    title: "Insurance",
    count: carriers.length,
    unit: "carriers",
    description: "Payers, plans, and fee schedules used at checkout.",
    icon: Shield,
    manageKey: "ins-carriers",
    addKey: "ins-plans",
    addLabel: "View Plans",
  },
];

function findMenu(sub: string): { menu: MenuItem; item: { key: string; label: string } } | null {
  for (const menu of menus) {
    const item = menu.items.find((i) => i.key === sub);
    if (item) return { menu, item };
  }
  return null;
}

function PanelShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="panel flex flex-col min-h-0 flex-1 overflow-hidden">
      <div className="panel-header">
        <div>
          <div className="panel-title">{title}</div>
          {description && <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="p-3 overflow-auto flex-1">{children}</div>
    </div>
  );
}

function SetupDashboard({
  onNavigate,
}: {
  onNavigate: (key: SubKey, menuKey: MenuKey) => void;
}) {
  return (
    <PanelShell
      title="Setup Dashboard"
      description="Overview of corporation, offices, providers and insurance."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.menuKey}
              className="border border-border rounded-[3px] bg-background p-3 flex flex-col gap-2 min-h-[148px] hover:border-primary/40"
            >
              <button
                type="button"
                onClick={() => onNavigate(card.manageKey, card.menuKey)}
                className="flex items-start gap-2.5 text-left bg-transparent border-none p-0 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-[3px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </div>
                  <div className="text-[18px] font-bold text-foreground leading-tight mt-0.5">
                    {card.count}
                    <span className="text-[10px] font-semibold text-muted-foreground ml-1.5 uppercase tracking-wide">
                      {card.unit}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
              </button>
              <p className="text-[11px] text-muted-foreground leading-snug flex-1">{card.description}</p>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  className="btn flex-1"
                  onClick={() => onNavigate(card.addKey, card.menuKey)}
                >
                  {card.addLabel}
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={() => onNavigate(card.manageKey, card.menuKey)}
                >
                  Manage
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PanelShell>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, i) => (
                <td key={i} className={i === 0 ? "font-semibold" : ""}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddProviderForm() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="field">
        <label>Prefix</label>
        <select defaultValue="Dr.">
          <option>Dr.</option>
          <option>Mr.</option>
          <option>Ms.</option>
        </select>
      </div>
      <div className="field">
        <label>Specialty</label>
        <select defaultValue="General Dentistry">
          <option>General Dentistry</option>
          <option>Orthodontics</option>
          <option>Periodontics</option>
          <option>Oral Surgery</option>
        </select>
      </div>
      <div className="field">
        <label>First Name</label>
        <input defaultValue="Alex" />
      </div>
      <div className="field">
        <label>Last Name</label>
        <input defaultValue="Hart" />
      </div>
      <div className="field">
        <label>NPI</label>
        <input defaultValue="1174557870" />
      </div>
      <div className="field">
        <label>Location</label>
        <select defaultValue="SOUTH">
          <option value="CENT">CENT : City Center</option>
          <option value="SOUTH">SOUTH - Bright Smiles South</option>
          <option value="MAIN">MAIN - Bright Smiles Main</option>
        </select>
      </div>
      <div className="field md:col-span-2">
        <label>Email</label>
        <input type="email" defaultValue="ahart@dentsaas.com" />
      </div>
      <div className="md:col-span-2 flex justify-end gap-2 pt-1">
        <button type="button" className="btn">Cancel</button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setSaved(true);
            window.setTimeout(() => setSaved(false), 1500);
          }}
        >
          <Plus className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Provider"}
        </button>
      </div>
    </div>
  );
}

function SectionContent({
  sub,
  onNavigate,
  onDashboard,
}: {
  sub: string;
  onNavigate: (key: SubKey, menuKey: MenuKey) => void;
  onDashboard: () => void;
}) {
  const meta = findMenu(sub);

  if (sub === "corp-add") {
    return (
      <PanelShell
        title="Add New Corporation"
        description="Create a corporation profile for practice setup and billing."
        actions={
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <button
              type="button"
              className="hover:text-primary bg-transparent border-none p-0 cursor-pointer"
              onClick={() => onNavigate("corp-manage", "corporation")}
            >
              Back
            </button>
            <span>|</span>
            <button
              type="button"
              className="hover:text-primary bg-transparent border-none p-0 cursor-pointer"
              onClick={onDashboard}
            >
              Back To Practice Setup
            </button>
            <span>|</span>
            <Link to="/dashboard" className="hover:text-primary">
              Back To Dashboard
            </Link>
          </div>
        }
      >
        <AddCorporationForm onCancel={() => onNavigate("corp-manage", "corporation")} />
      </PanelShell>
    );
  }

  if (sub === "corp-manage") {
    return (
      <PanelShell
        title="Manage Corporation"
        description="All corporations with search, filter and column sorting."
      >
        <ManageCorporationPanel onAdd={() => onNavigate("corp-add", "corporation")} />
      </PanelShell>
    );
  }

  if (sub === "provider-add") {
    return (
      <PanelShell title="Add New Provider" description="Create a provider profile for scheduling and billing.">
        <AddProviderForm />
      </PanelShell>
    );
  }

  if (sub === "provider-manage") {
    return (
      <PanelShell
        title="Manage Provider"
        description="Active providers across all offices."
        actions={
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="h-7 pl-7 pr-2 text-[11px] border border-border rounded-[3px] bg-background outline-none focus:border-primary w-44" placeholder="Search provider..." />
          </div>
        }
      >
        <DataTable
          headers={["Provider", "NPI", "Specialty", "Location", "Status"]}
          rows={providers.map((p) => [p.name, p.npi, p.specialty, p.location, p.status])}
        />
      </PanelShell>
    );
  }

  if (sub.startsWith("office")) {
    return (
      <PanelShell title={meta?.item.label || "Offices"} description="Practice office locations and hours.">
        <DataTable
          headers={["Code", "Office", "Phone", "Timezone", "Status"]}
          rows={offices.map((o) => [o.code, o.name, o.phone, o.timezone, o.status])}
        />
      </PanelShell>
    );
  }

  if (sub.startsWith("ins-")) {
    return (
      <PanelShell title={meta?.item.label || "Insurance"} description="Carriers, plans and fee schedules.">
        <DataTable
          headers={["Carrier", "Plans", "Fee Schedule", "Status"]}
          rows={carriers.map((c) => [c.name, String(c.plans), c.fee, c.status])}
        />
      </PanelShell>
    );
  }

  if (sub.startsWith("ada")) {
    return (
      <PanelShell title={meta?.item.label || "ADA Codes"} description="Procedure codes used in charting and billing.">
        <DataTable
          headers={["Code", "Description", "Category", "UCR Fee"]}
          rows={adaCodes.map((a) => [a.code, a.description, a.category, a.fee])}
        />
      </PanelShell>
    );
  }

  const icons: Record<string, typeof Building2> = {
    corporation: Building2,
    office: MapPin,
    provider: Stethoscope,
    insurance: Shield,
    ada: Settings2,
    store: Store,
    credentialing: Shield,
    rules: Settings2,
    communication: Users,
    corporate: Building2,
  };
  const Icon = icons[meta?.menu.key || "corporation"] || Building2;

  return (
    <PanelShell
      title={meta?.item.label || "Practice Setup"}
      description={`${meta?.menu.label || "Setup"} configuration panel`}
    >
      <div className="flex flex-col items-start gap-3 max-w-xl">
        <div className="w-10 h-10 rounded-[3px] bg-primary/10 text-primary grid place-items-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold">{meta?.item.label}</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Configure {meta?.item.label?.toLowerCase()} for the practice. This is a frontend demo panel with
            editable fields and fixture data.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          <div className="field">
            <label>Display Name</label>
            <input defaultValue={meta?.item.label} />
          </div>
          <div className="field">
            <label>Status</label>
            <select defaultValue="active">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="field md:col-span-2">
            <label>Notes</label>
            <textarea rows={3} defaultValue={`Notes for ${meta?.item.label}`} />
          </div>
        </div>
        <button type="button" className="btn btn-primary">Save Changes</button>
      </div>
    </PanelShell>
  );
}

export default function PracticeSetupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSub = searchParams.get("section") || "";
  const isDashboard = !activeSub;
  const activeMeta = isDashboard ? null : findMenu(activeSub);
  const activeMenu = activeMeta?.menu.key ?? null;

  const [expanded, setExpanded] = useState<MenuKey | null>(() => activeMenu);

  useEffect(() => {
    setExpanded(activeMenu);
  }, [activeMenu]);

  const selectSub = (key: SubKey, menuKey: MenuKey) => {
    setSearchParams({ section: key }, { replace: false });
    setExpanded(menuKey);
  };

  const selectDashboard = () => {
    setSearchParams({}, { replace: false });
    setExpanded(null);
  };

  const toggleGroup = (key: MenuKey) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link to="/dashboard" className="inline-flex items-center gap-1 hover:text-primary">
          <Home className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Practice Setup</span>
        {isDashboard ? (
          <>
            <span>/</span>
            <span className="text-primary font-semibold">Setup Dashboard</span>
          </>
        ) : activeMeta ? (
          <>
            <span>/</span>
            <span className="text-primary font-semibold">{activeMeta.item.label}</span>
          </>
        ) : null}
      </div>

      <div className="panel px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-[16px] font-bold">Practice Setup</h1>
          <p className="text-[11px] text-muted-foreground">Corporation, offices, providers, insurance and codes</p>
        </div>
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        <aside className="panel w-[230px] shrink-0 p-2 overflow-auto hidden md:flex md:flex-col">
          <div className="menu-group-title">Setup Menu</div>
          <button
            type="button"
            onClick={selectDashboard}
            className={`sidebar-item w-full text-left border-none cursor-pointer mb-0.5 ${
              isDashboard ? "active" : "bg-transparent text-foreground hover:bg-secondary-hover"
            }`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${isDashboard ? "" : "text-muted-foreground"}`} />
            <span className="truncate flex-1 text-left">Dashboard</span>
          </button>
          {menus.map((menu) => {
            const Icon = menu.icon;
            const open = expanded === menu.key;
            const groupActive = activeMenu === menu.key;
            return (
              <div key={menu.key} className="flex flex-col gap-0.5 mb-0.5 pr-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(menu.key)}
                  className={`sidebar-item w-full text-left border-none cursor-pointer !pr-2.5 ${
                    groupActive && !open ? "active" : "bg-transparent text-foreground hover:bg-secondary-hover"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${groupActive ? "" : "text-muted-foreground"}`} />
                  <span className="truncate flex-1 text-left">{menu.label}</span>
                  {open ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-1 opacity-80" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-1 opacity-80" />
                  )}
                </button>
                {open &&
                  menu.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectSub(item.key, menu.key)}
                      className={`sidebar-item w-full text-left border-none cursor-pointer !pl-6 !pr-4 mr-1 ${
                        activeSub === item.key
                          ? "active"
                          : "bg-transparent text-foreground hover:bg-secondary-hover"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          activeSub === item.key ? "bg-primary-foreground" : "bg-muted-foreground/55"
                        }`}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
              </div>
            );
          })}
        </aside>

        <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <div className="md:hidden mb-2">
            <div className="field">
              <label>Section</label>
              <select
                value={activeSub}
                onChange={(e) => {
                  const key = e.target.value;
                  if (!key) {
                    selectDashboard();
                    return;
                  }
                  const meta = findMenu(key);
                  if (meta) selectSub(key, meta.menu.key);
                }}
              >
                <option value="">Dashboard</option>
                {menus.map((menu) => (
                  <optgroup key={menu.key} label={menu.label}>
                    {menu.items.map((item) => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          {isDashboard ? (
            <SetupDashboard onNavigate={selectSub} />
          ) : (
            <SectionContent sub={activeSub} onNavigate={selectSub} onDashboard={selectDashboard} />
          )}
        </main>
      </div>
    </div>
  );
}
