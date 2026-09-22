# dentsaas Implementation Guide

## Required stack

```json
{
  "runtime": "React 19 + TypeScript",
  "bundler": "Vite 7",
  "router": "React Router DOM 7",
  "styling": "Tailwind CSS 4",
  "icons": "lucide-react"
}
```

Required scripts:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```

Use path alias `@/*` for `src/*`.

## Recommended source structure

```text
src/
  App.tsx
  main.tsx
  components/
    ProtectedRoute.tsx
    TableToolbar.tsx
    ReportDataTable.tsx
    layout/
      DashboardLayout.tsx
      Topbar.tsx
      Sidebar.tsx
      Statusbar.tsx
  lib/
    auth.tsx
    filterPanelStore.ts
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    AppointmentBookPage.tsx
    SchedulerToolsPage.tsx
    PatientPage.tsx
    PatientWorkspacePage.tsx
    PatientBillingPage.tsx
    DocumentsPage.tsx
    ReportPage.tsx
    SettingsPage.tsx
  styles/
    globals.css
```

Splitting into feature folders is allowed, but routes and behavior must remain the same.

## Routing map

```tsx
<Route path="/login" element={<LoginPage />} />
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/practice-setup" element={<PracticeSetupPage />} />
  <Route path="/appointment/book" element={<AppointmentBookPage />} />
  <Route path="/appointment/find-slot" element={<SchedulerToolsPage />} />
  <Route path="/appointment/online" element={<SchedulerToolsPage />} />
  <Route path="/appointment/short-call" element={<SchedulerToolsPage />} />
  <Route path="/appointment/unscheduled" element={<SchedulerToolsPage />} />
  <Route path="/appointment/recalls" element={<SchedulerToolsPage />} />
  <Route path="/patient" element={<PatientPage />} />
  <Route path="/patient/overview" element={<PatientWorkspacePage />} />
  <Route path="/patient/insurance" element={<PatientWorkspacePage />} />
  <Route path="/patient/clinical" element={<PatientWorkspacePage />} />
  <Route path="/patient/treatment" element={<PatientWorkspacePage />} />
  <Route path="/patient/recalls" element={<PatientWorkspacePage />} />
  <Route path="/patient/authorizations" element={<PatientWorkspacePage />} />
  <Route path="/patient/billing" element={<PatientBillingPage />} />
  <Route path="/documents" element={<DocumentsPage />} />
  <Route path="/report" element={<ReportPage />} />
  <Route path="/settings" element={<SettingsPage />} />
</Route>
```

- `src/components/AddPatientModal.tsx` — Add New Patient CareStack-style form.
- `src/components/AddInsuranceModal.tsx` — Add New Insurance to Family form.
- Shared CSS classes in `globals.css`: `.cs-modal-*`, `.cs-form-row`, `.cs-btn-tan`, `.cs-link`, `.cs-or`.

## Shared implementation rules

- Use functional React components.
- Keep fixture data near its page or in a typed fixture module.
- Use TypeScript unions for statuses and section keys.
- Derive filtered rows with `useMemo`.
- Use `useState` for local demo interactions.
- Save feedback should reset after approximately 1.5–2 seconds.
- Avoid dependencies unless the specified stack cannot perform the task.
- Do not fetch remote APIs.
- Do not create fake backend endpoints.
- Avoid links to nonexistent routes.

## Shared shell

`ProtectedRoute` must:

1. Read the current user from auth context.
2. Redirect unauthenticated users to `/login`, retaining the requested path.
3. Render authenticated routes inside `DashboardLayout`.

`DashboardLayout` order:

1. Topbar
2. Quick-action bar
3. Flex row containing global Sidebar and scrollable console body
4. Statusbar

## Scheduler implementation

### Appointment model

```ts
type Appointment = {
  id: string;
  sideId: string;
  start: string;
  end: string;
  patient: string;
  type: string;
  status: "confirmed" | "allocated" | "message" | "blocked";
  plan?: string;
  phone?: string;
};
```

Use at least:

- 3 doctors.
- 6 operatories/sides.
- Half-hour rows from 08:00 through 17:00.
- 8 normal appointments and 2 blocked periods.

`SchedulerToolsPage` may detect its mode from the final path segment and reuse one shell for all five tools.

## Patient fixtures

Use at minimum:

- Denise Wingard, #16665, balance $948.80.
- Melissa Que, #1494, active patient, Dr. Hart, penicillin allergy.
- JOHNSONN ELLA.
- BRAKE ZOIEY.
- MCNUTT PHEONIX.
- CURRY NEVAEH.
- DELGADO GENESIS.
- BALSECA SAMUEL.

Patient workspace can be a fixed demo patient until a backend is introduced, but navigation must be complete and coherent.

## Odontogram

- Render 16 upper and 16 lower teeth.
- Upper numbers: 1–16.
- Lower numbers: 32–17.
- Each tooth is a button with number and simplified crown/root shape.
- Maintain selected/planned tooth numbers in local state.
- Initial planned example: 3, 14, 19, 20 and 29.

## Billing fixtures

Include transaction examples:

- Invoice #5131.
- Claim #1136.
- Patient account payment #5193.
- Invoice #5192.
- Claim #1155.
- Insurance payment #5229.
- EFT note.
- Invoice #5254 with core buildup and crown.
- Patient payment #5255.
- Claim #1171.
- Insurance payment #5384.
- Voided payment #5355.

Expandable line items use:

- Procedure description.
- Site.
- Provider.
- Insurance amount.
- Patient amount.
- Total.

## Reports

Use query parameter `section`.

Sections:

```text
patient-overview
patient-new
patient-aging
appt-daily
appt-doctor
appt-noshow
billing-collections
billing-claims
billing-revenue
```

Report table functionality:

- Global search.
- Per-column text/select/number/date filters where relevant.
- Clear filters.
- Scrollable table with sticky header.

## Verification

Install and build:

```powershell
npm install
npm run build
```

Run locally:

```powershell
npm run dev
```

Manual acceptance checklist:

- Login works with demo administrator.
- Sidebar expands/collapses and menu search works.
- Every sidebar item opens the correct route.
- Appointment date controls, filtering, grid/list and booking modal work.
- All scheduler tools show distinct datasets.
- Patient workspace side navigation changes content.
- Teeth can be selected.
- Billing rows expand and filters work.
- Report sections and filters work.
- Settings tabs, toggles and Save feedback work.
- Layout remains usable at 1366×768 and at a narrow tablet width.
- `npm run build` exits successfully.

## AI completion policy

The implementing agent must fix its own TypeScript, build and introduced lint failures. It must not declare completion after only scaffolding files or adding menu labels.
