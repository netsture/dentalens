# dentsaas Product Specification

## Product

dentsaas is a frontend-only dental practice management demo inspired by dense CareStack/Dentrix workflows. It combines scheduling, patient records, clinical charting, treatment planning, billing, documents, reporting, and practice settings.

All records are realistic fixtures. Authentication and density preferences may use `localStorage`; no server is required.

## Global application shell

### Top bar

- Height: 44px.
- Left: sidebar toggle and DentSaas `DL` logo.
- Context blocks: clinic, branch, fiscal period.
- Right: quick search, notification count, message count, fullscreen and user avatar.
- Profile popup: user details, role, density selector, Settings, My Profile and Logout.

### Quick-action bar

Directly below the top bar, 30px high, primary dark blue/teal background.

Actions:

- Patient
- Alert
- Form
- Prescription
- Note
- Lab
- Recall
- Message
- Print

Patient and Recall navigate to their relevant screens. Other actions may open demo feedback or a modal.

### Sidebar

Expanded width: 240px. Collapsed width: 52px. Include menu search.

Groups and items:

**Practice**

- Dashboard — `/dashboard`
- Practice Setup — `/practice-setup`

**Scheduling**

- Appointment Book — `/appointment/book`
- Find Slot — `/appointment/find-slot`
- Online Requests — `/appointment/online`
- Short Call — `/appointment/short-call`
- Unscheduled Tx — `/appointment/unscheduled`
- Recalls — `/appointment/recalls`

**Patients**

- Patient Search — `/patient`
- Patient Overview — `/patient/overview`
- Insurance — `/patient/insurance`
- Clinical Chart — `/patient/clinical`
- Treatment Planner — `/patient/treatment`
- Authorizations — `/patient/authorizations`

**Financial**

- Patient Billing — `/patient/billing`
- Documents — `/documents`
- Analytics & Reports — `/report`

**Administration**

- Settings — `/settings`

### Status bar

20px bottom bar containing connection status, location/operator details, latency, density and current time.

## Authentication

Route: `/login`

Provide a polished split login screen and demo account quick-fill.

Demo credentials:

- Administrator: `admin@gmail.com` / `demo123`
- Doctor account may also be offered.

Unauthenticated protected routes redirect to login. Successful login redirects to the requested page or dashboard.

## Practice Setup

Route: `/practice-setup` (optional `?section=` query)

Breadcrumb: Dashboard / Practice Setup.

Left aside panel (same pattern as Patient Overview) with expandable groups and submenus:

- Corporation
- Office
- Provider (`Add New Provider`, `Manage Provider`)
- Insurance
- ADA Codes
- Dental Store
- Credentialing
- Business Rule
- Communication / Directory
- Corporate Area

No top horizontal menu. Default section: Manage Provider. Selecting a submenu loads the matching setup panel.

## Dashboard

Route: `/dashboard`

Required:

- KPI cards: total patients, today’s appointments, pending claims, monthly revenue.
- Searchable/filterable today schedule.
- Appointment status badges.
- Recent activity list.
- Links to Appointment Book and Billing.

## Appointment Book

Route: `/appointment/book`

Required:

- Desktop day scheduler with time rows and operatory/provider columns.
- Date previous/next and Today controls.
- Provider and status filters.
- Search by patient or appointment type.
- Grid/list switch.
- Color states: confirmed, allocated, message/waiting, blocked.
- Selecting an appointment opens its detail panel.
- Empty slot opens booking modal.
- Booking modal includes patient, provider, operatory, start/end and visit type.
- Legend and Print/Settings actions.

## Scheduling tools

All scheduling tools share filters for search, location, provider/status and date.

### Find Slot

Route: `/appointment/find-slot`

Table columns: date, time, provider, operatory, duration and action.

### Online Requests

Route: `/appointment/online`

Table columns: request, patient, visit type, preferred time and status. Include a Book Selected action.

### Short Call

Route: `/appointment/short-call`

Table columns: patient, phone, available days, preferred time and visit type.

### Unscheduled Treatments

Route: `/appointment/unscheduled`

Table columns: patient, code, procedure, tooth/area, estimate and status.

### Recalls

Route: `/appointment/recalls`

Table columns: patient, recall type, procedure, due date and status.

All five screens require text search, visible fixture data, an Add action and Contact Selected action.

## Patient directory

Route: `/patient`

Required:

- Search by patient name, ID or phone.
- Status filtering.
- Columns: ID, patient, phone, DOB, last visit, balance and status.
- Add Patient action that opens the **Add New Patient** modal.
- Top quick-action `Patient` opens `/patient?add=1` and auto-opens the modal.
- Per-row Billing and Appointment actions.

## Add New Patient modal

Theme-styled centered modal (`panel` + `panel-header` + `field` grid + `btn` / `btn-primary`).

Required fields/sections:

- Relationship to RP radios: Self, Spouse, Dependent Child, Other.
- Name: Prefix, First, Last, More Name Options (middle/preferred).
- Date of Birth, Gender, Patient Type (General/Ortho).
- Referral Source, Location.
- Contact Information: Address, Address Line 2, ZIP + Verify, City, State.
- Mobile, Email.
- Enable Communications checkboxes: Text, Voice, Email Notifications, Marketing Emails, Patient Portal, Postcards.
- Footer: Add More Details, Add Insurance, Add another patient, Add Appointment, Save.
- `Add Insurance` closes patient modal and opens insurance modal for the same responsible party.
- Save adds a New row to the patient list (frontend demo only).
- Do not use external/CareStack-only form skins unless the user explicitly requests a reference redesign.

## Add New Insurance to Family modal

Theme-styled centered modal (`panel` + `field` + footer buttons).

Required:

- Responsible Party display and Add Another Member.
- Subscriber radios: Same as RP, Select From Existing, Add New.
- Subscriber ID Type: Subscriber ID / SSN.
- Required Subscriber ID and Effective Date.
- Employer / draft employer, Carrier / draft carrier, Plan / draft plan.
- Covered member checkbox with Subscriber label.
- Notes textarea and Mark Insurance as Verified.
- Footer: Save and add another insurance, Add Appointment, Save.
- Open from patient modal Add Insurance, Patient Workspace Insurance Add Insurance, and Add menu.

## Patient workspace

Routes:

- `/patient/overview`
- `/patient/insurance`
- `/patient/clinical`
- `/patient/treatment`
- `/patient/recalls`
- `/patient/authorizations`

Persistent header:

- Patient avatar, name, ID, age, gender, status and primary provider.
- Allergy/medical alert badge.
- Appointment, Message and Add buttons.

Persistent patient sidebar:

- Overview
- Insurance
- Clinical Chart
- Treatment Planner
- Recalls
- Authorizations
- Billing
- Documents

### Overview

Panels:

- Patient details
- Account summary
- Alerts and notes

Include DOB, phone, email, provider, location, balances, last/next appointment, recall status, allergy and premedication notice.

### Insurance

Required:

- Plan name, member ID, effective date and active status.
- Subscriber, relationship, eligibility checked date and fee schedule.
- Deductible and maximum benefits table.

### Clinical Chart

Required:

- Adult 32-tooth odontogram in upper/lower arches.
- Tooth numbers.
- Clicking a tooth toggles planned state.
- Legend for planned, existing and healthy.
- Desktop horizontal scrolling if necessary.

### Treatment Planner

Required:

- Treatment procedure table with codes, procedure, tooth, patient estimate, insurance estimate and status.
- Plan total row.
- Fee/insurance summary panel.
- Present Plan action.

### Patient Recalls

Required table: recall type, procedure, due date and status. Include Add.

### Authorizations

Required table: authorization ID, procedure, payer, amount and status. Include Add.

## Patient billing

Route: `/patient/billing`

Required:

- Toolbar: Invoice, Account Payment, Deposit, Statement, Message and Alert.
- Search and transaction type filtering.
- Transaction types: invoice, claim, patient payment, insurance payment, note and void.
- Expandable invoices/payments with procedure allocation rows.
- Columns: date, transaction, details, patient and amount.
- Negative amounts in red.
- Right patient card with search, avatar, patient name and full patient navigation.
- Small calendar.
- Account aging summary with donut indicator and buckets: Past 30, 31–60, 61–90, Over 90 and Total.

Use Denise Wingard fixture data and include multiple transactions from November 2020 through January 2021.

## Documents

Route: `/documents`

Required:

- Search and type filter.
- PDF, image, imaging and document fixtures.
- Columns: document, type, patient, size and date.
- Upload and Download controls.

## Reports

Route: `/report`

Groups:

- Patient: overview, new patients, account aging.
- Appointment: daily schedule, by doctor, no-show/cancel.
- Billing: collections, claims status, revenue trend.

Required:

- Report home cards.
- Query-string section navigation.
- Nested report sidebar.
- KPI cards.
- Searchable/filterable data tables.
- Simple production versus collection bar visualization.

## Settings

Route: `/settings`

Tabs:

- Practice
- Account
- Appointments
- Billing
- Alerts
- Security
- Appearance
- Integrations

Include realistic editable fields, toggle controls and temporary Save Changes confirmation.

## Compatibility and routing

- `/` redirects to `/dashboard`.
- Unknown routes redirect to `/dashboard`.
- All application routes except `/login` are protected.
- Preserve route names exactly unless an explicit future change overrides them.

## Responsive behavior

- Desktop is the primary target at 1366px and above.
- Tables may scroll horizontally rather than losing columns.
- On narrower screens, major grids stack.
- Patient inner sidebar may hide below medium width.
- Main sidebar remains collapsible.
