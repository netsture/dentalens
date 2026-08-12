import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileCheck2,
  FileText,
  KeyRound,
  Phone,
  Scale,
  Search,
  Shield,
  Smile,
  Stethoscope,
  Wallet,
} from "lucide-react";

const platformFeatures = [
  {
    title: "Patient Scheduling",
    desc: "Book visits by chair and provider, see who is waiting or seated, and keep every location’s dayboard in sync.",
    icon: CalendarDays,
    tone: "bg-blue-100 text-blue-700",
  },
  {
    title: "Clinical Charting",
    desc: "Record findings tooth by tooth, track perio measurements, and keep the chart ready for the next visit.",
    icon: Smile,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    title: "Dental Billing",
    desc: "Post procedures, apply fees, and show patients a clear balance without leaving the front desk workflow.",
    icon: Wallet,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    title: "Insurance Claims",
    desc: "Build dental claims from completed work, attach what payers need, and track status until payment posts.",
    icon: FileCheck2,
    tone: "bg-blue-100 text-blue-800",
  },
  {
    title: "Eligibility Checks",
    desc: "Confirm coverage before the appointment so the team knows benefits, remaining maximums, and patient share.",
    icon: ClipboardCheck,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    title: "Imaging & Docs",
    desc: "Keep X-rays, consent forms, and clinical files with the patient record for quick review chairside.",
    icon: Camera,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Treatment Planner",
    desc: "Group recommended procedures into phases, estimate cost, and share a plan patients can understand.",
    icon: Stethoscope,
    tone: "bg-blue-100 text-blue-600",
  },
  {
    title: "Analytics & Reports",
    desc: "Monitor daily production, collections, and chair utilization so owners see what drives growth.",
    icon: FileText,
    tone: "bg-sky-100 text-sky-800",
  },
  {
    title: "Practice Setup",
    desc: "Configure corporation, offices, providers, and fee lists once — then reuse them across the whole platform.",
    icon: Shield,
    tone: "bg-blue-50 text-blue-800",
  },
];

const pmsCards = [
  {
    title: "Multi-Chair Scheduler",
    desc: "Assign patients to chairs and providers in one view. Color-coded status helps the front desk move the day without confusion.",
    icon: CalendarDays,
  },
  {
    title: "Odontogram Charting",
    desc: "Mark restorations, missing teeth, and planned work on a visual chart so clinical and billing teams share the same truth.",
    icon: Smile,
  },
  {
    title: "Imaging & Cloud PACS",
    desc: "Upload and open dental images beside the chart. Adjust view settings so doctors can diagnose without switching tools.",
    icon: Camera,
  },
];

const rcmCards = [
  {
    title: "Real-Time Eligibility",
    desc: "Look up active coverage and benefit limits in seconds so treatment conversations stay accurate at check-in.",
    icon: Search,
  },
  {
    title: "Claim Scrubbing & Attachments",
    desc: "Catch missing codes and required images before send. Cleaner claims mean fewer returns and faster payment.",
    icon: FileCheck2,
  },
  {
    title: "Payment Posting & Ledger",
    desc: "Apply insurance payments to the right procedures, update write-offs, and keep the patient ledger current.",
    icon: Wallet,
  },
];

const backOffice = [
  {
    title: "Eligibility & Benefits",
    desc: "Review plan details and remaining benefits ahead of visits so chairs stay productive and surprises stay low.",
    icon: ClipboardCheck,
  },
  {
    title: "CDT Coding & Billing",
    desc: "Map clinical work to the right CDT codes and prepare charges that match what was actually delivered.",
    icon: FileText,
  },
  {
    title: "Claims Follow-Up",
    desc: "Work unpaid and denied claims on a schedule — call, correct, and resubmit until the aging list shrinks.",
    icon: Phone,
  },
  {
    title: "Adjustment & Adjudication",
    desc: "Process contractual adjustments and patient statements after payers respond so books stay balanced.",
    icon: Wallet,
  },
  {
    title: "Fee Schedules & UCR",
    desc: "Keep office fees and carrier contracts aligned so estimates and billed amounts match what you expect.",
    icon: Scale,
  },
  {
    title: "Credentialing Support",
    desc: "Track provider enrollments and renewals so doctors stay in-network and claims are not delayed.",
    icon: KeyRound,
  },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-[12px] ${
          light ? "bg-white text-blue-700" : "bg-blue-600 text-white"
        }`}
      >
        DL
      </div>
      <span className={`font-bold text-[17px] tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        DentaLens<span className={light ? "text-white/70" : "text-blue-600"}>.ai</span>
      </span>
    </Link>
  );
}

export default function HomePage() {
  useEffect(() => {
    const prev = { overflow: document.body.style.overflow, height: document.body.style.height };
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.height = prev.height;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-slate-600">
            <a href="#solutions" className="hover:text-blue-700">Solutions</a>
            <a href="#services" className="hover:text-blue-700">Services</a>
            <a href="#pricing" className="hover:text-blue-700">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="h-9 px-3.5 rounded-lg text-[13px] font-semibold text-blue-700 border border-blue-200 bg-white hover:bg-blue-50 inline-flex items-center"
            >
              Log In
            </Link>
            <Link
              to="/login"
              className="h-9 px-3.5 rounded-lg text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50/60 to-white pointer-events-none" />
        <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[280px] h-[280px] rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
              Dental Practice Management Service
            </p>
            <h1 className="text-[34px] md:text-[44px] font-black leading-[1.1] tracking-tight text-slate-900">
              Clarity for every chair,{" "}
              <span className="text-blue-700">claim, and chart</span>
            </h1>
            <p className="mt-4 text-[15px] text-slate-600 leading-relaxed max-w-lg">
              DentaLens.ai helps dental teams schedule patients, document care, bill accurately, and
              follow insurance — from the front desk to the back office in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="h-11 px-5 rounded-lg text-[14px] font-bold text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center shadow-md shadow-blue-600/25"
              >
                Start Free Trial
              </Link>
              <a
                href="#solutions"
                className="h-11 px-5 rounded-lg text-[14px] font-bold text-blue-700 border-2 border-blue-600 bg-white hover:bg-blue-50 inline-flex items-center"
              >
                Explore Features
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-slate-600">
              {["Built for dental clinics", "Front desk + clinical", "Billing & insurance", "Try with demo login"].map(
                (t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-blue-200 bg-white shadow-xl shadow-blue-200/50 overflow-hidden">
              <div className="h-9 bg-blue-600 flex items-center gap-1.5 px-3">
                <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span className="ml-2 text-[10px] font-semibold text-white/90">Today at DentaLens.ai</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  ["Appointments", "42", "bg-blue-50 text-blue-800"],
                  ["In Chair", "11", "bg-sky-50 text-sky-800"],
                  ["Claims Pending", "28", "bg-blue-100 text-blue-900"],
                  ["Collected", "$4.8K", "bg-sky-100 text-sky-900"],
                ].map(([label, value, tone]) => (
                  <div key={label} className={`rounded-xl p-3 ${tone}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</div>
                    <div className="text-[22px] font-black mt-1">{value}</div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3">
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-blue-600"
                        style={{ height: `${h}%`, opacity: 0.55 + i * 0.06 }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-700/70 mt-2 font-medium">This week’s production trend</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="py-16 md:py-20 bg-blue-50/50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-[26px] md:text-[32px] font-black tracking-tight text-slate-900">
              Tools that match how dental practices work
            </h2>
            <p className="mt-2 text-[14px] text-slate-600">
              Each module below is built for dental staff — not rebranded accounting software.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-blue-100 bg-white p-5 hover:shadow-md hover:border-blue-300 hover:shadow-blue-100 transition-shadow"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${f.tone}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="mt-3 text-[14px] font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-[12.5px] text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div>
            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              Clinical & Front Desk
            </span>
            <h2 className="mt-3 text-[24px] font-black tracking-tight text-slate-900">Practice Management</h2>
            <p className="mt-1.5 text-[13px] text-slate-600">
              Keep the schedule, tooth chart, and images connected for every patient visit.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {pmsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-900">{card.title}</h3>
                      <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
              Billing & Insurance
            </span>
            <h2 className="mt-3 text-[24px] font-black tracking-tight text-slate-900">Revenue Cycle Suite</h2>
            <p className="mt-1.5 text-[13px] text-slate-600">
              From benefit check to claim payment — reduce delays and patient confusion.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {rcmCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-900">{card.title}</h3>
                      <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-20 bg-blue-50/40 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-[26px] md:text-[32px] font-black tracking-tight text-slate-900">
              Back-office support when you need extra hands
            </h2>
            <p className="mt-2 text-[14px] text-slate-600">
              Pair the software with services that keep eligibility, coding, and unpaid claims moving.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {backOffice.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-blue-100 bg-white p-5 text-center hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 transition-shadow"
                >
                  <div className="w-10 h-10 mx-auto rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-3 text-[14px] font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-[12.5px] text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-[26px] md:text-[32px] font-black tracking-tight text-slate-900">
            One team login for every office you run
          </h2>
          <p className="mt-2 text-[14px] text-slate-600 max-w-2xl mx-auto">
            Grow from a single clinic to a multi-location group without mixing patient lists, schedules, or reporting.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              ["Shared playbooks", "Reuse forms and note templates while each office keeps its own calendar."],
              ["Practice identity", "Store legal names, NPIs, and office details under each corporation profile."],
              ["Staff directory", "Give providers and front desk users access only to the locations they serve."],
              ["Access control", "Limit sensitive billing and setup screens by role so data stays protected."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <h3 className="text-[13px] font-bold text-blue-900">{t}</h3>
                <p className="mt-1 text-[12px] text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-sky-900 text-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-[26px] md:text-[32px] font-black tracking-tight">
              Connect the systems your clinic already uses
            </h2>
            <p className="mt-3 text-[14px] text-blue-100 leading-relaxed">
              Use straightforward APIs to link imaging vendors, payment tools, and other partners without
              custom glue code for every office.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-blue-100">
              {[
                "Create and update patient records",
                "Push appointment status changes",
                "Receive claim and payment updates",
                "Secure token-based access",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-sky-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-blue-400/20 bg-blue-950/80 p-4 font-mono text-[11px] leading-relaxed text-sky-100 overflow-x-auto">
            <pre>{`POST /api/v1/patients
Authorization: Bearer dl_live_***

{
  "firstName": "Denise",
  "lastName": "Wingard",
  "dob": "1984-03-12",
  "locationId": "SOUTH"
}`}</pre>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 md:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[28px] md:text-[34px] font-black tracking-tight">
            See DentaLens.ai with your own workflow
          </h2>
          <p className="mt-3 text-[14px] text-blue-100">
            Open the live demo, walk through patients and the appointment book, then decide if it fits your practice.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="h-11 px-6 rounded-lg text-[14px] font-bold bg-white text-blue-700 hover:bg-blue-50 inline-flex items-center"
            >
              Get Started
            </Link>
            <a
              href="#solutions"
              className="h-11 px-6 rounded-lg text-[14px] font-bold border-2 border-white/50 text-white hover:bg-white/10 inline-flex items-center"
            >
              View Features
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-blue-100 bg-blue-50/30 py-12">
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-3 text-[12.5px] text-slate-600 leading-relaxed">
              DentaLens.ai is a dental practice management service for clinics that want scheduling,
              charting, and billing in one clear console.
            </p>
          </div>
          {[
            { title: "Product", links: ["Scheduler", "Charting", "Billing", "Claims"] },
            { title: "Platform", links: ["Security", "API", "Integrations", "Status"] },
            { title: "Company", links: ["About", "Careers", "Contact", "Support"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-blue-700">{col.title}</h4>
              <ul className="mt-3 space-y-1.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#solutions" className="text-[13px] text-slate-700 hover:text-blue-700">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-10 pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} DentaLens.ai · Dental Practice Management Service</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-700">Privacy Policy</a>
            <a href="#" className="hover:text-blue-700">Terms</a>
            <Link to="/login" className="hover:text-blue-700">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
