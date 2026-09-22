# dentsaas Design System

## Theme-first design rule (mandatory)

**Default:** Always implement UI with the dentsaas theme only:

- Use existing classes: `panel`, `panel-header`, `panel-title`, `btn`, `btn-primary`, `btn-ghost`, `field`, `data-table`, `badge`, `sidebar-item`, design tokens from `globals.css`.
- Match spacing, typography, radius (`3px`), and colors already used on Dashboard / Patient / Settings.
- Do **not** invent alternate visual systems (CareStack teal headers, tan/beige action buttons, external form skins, marketing layouts).

**Reference images:**

- Attaching a screenshot alone is **not** permission to restyle the app.
- Only change the visual design to match a reference image when the user **explicitly asks** to redesign / match that image.
- If the user asks to implement a feature and attaches a reference only for structure/fields, keep dentsaas theme styling and adapt field content/layout into theme components.
- After an explicit redesign request, still prefer reusing theme tokens where possible unless the user requires a pixel-faithful alternate look.

**Forms / modals:**

- Use centered overlay + `panel` + `panel-header` + `field` grid + footer `btn` / `btn-primary`.
- Do not introduce one-off CSS theme variants for a single form.

- Compact 10–13px interface typography.
- Thin borders and small 3px corner radius.
- White panels on a cool gray background.
- Dark navy/teal primary navigation.
- Tables, filters and nested panels are the dominant patterns.
- Minimal shadows; hierarchy comes from borders, headers and background shades.

## Technology

- Tailwind CSS v4.
- Global semantic CSS variables.
- Lucide React icons.
- Inter with system-font fallback.

## Exact tokens

```css
:root {
  --background: hsl(220, 20%, 97%);
  --foreground: hsl(220, 40%, 10%);
  --card: hsl(0, 0%, 100%);
  --card-foreground: hsl(220, 40%, 10%);
  --primary: hsl(215, 60%, 26%);
  --primary-hover: hsl(215, 60%, 20%);
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(220, 15%, 93%);
  --secondary-hover: hsl(220, 15%, 88%);
  --secondary-foreground: hsl(220, 30%, 25%);
  --muted: hsl(220, 15%, 93%);
  --muted-foreground: hsl(220, 10%, 40%);
  --accent: hsl(215, 45%, 90%);
  --accent-foreground: hsl(215, 60%, 20%);
  --destructive: hsl(0, 84%, 48%);
  --destructive-foreground: white;
  --border: hsl(220, 15%, 85%);
  --input: hsl(220, 15%, 85%);
  --ring: hsl(215, 60%, 26%);
  --radius: 3px;
}
```

## Density

Provide three density modes:

- Compact: base content font 11.5px, 4px grid gap.
- Standard: 13px, 8px gap.
- Comfortable: 15px, 12px gap.

Default may be Compact. Store selection in `localStorage`.

## Dimensions

- Top bar: 44px.
- Quick-action bar: 30px.
- Status bar: 20px.
- Sidebar: 240px expanded, 52px collapsed.
- Console content padding: 12px.
- Standard control height: 26–30px.
- Sidebar row: 28px.
- Border radius: 3px; 4px only for dialogs and logo.

## Typography

- Body: 11px.
- Input/table text: 11–12px.
- Field label/table header: 9–10px, uppercase, bold, tracked.
- Panel title: 12px bold.
- Page title: 16px bold.
- KPI value: 16–18px bold.
- Avoid large display typography inside the authenticated app.

## Reusable classes/components

### Panel

- White background.
- 1px semantic border.
- 3px radius.
- Optional compact header with secondary background.

### Buttons

- `.btn`: inline flex, 26px height, 10px horizontal padding, 11px semibold.
- Primary: primary background and white text.
- Success: green background for payments/positive actions.
- Ghost: transparent border/background.
- All buttons require hover and cursor states.

### Fields

- Vertical label/control arrangement with 4px gap.
- Label uppercase 10px bold muted color.
- Input/select 28px high, background color, 1px border.
- Focus uses primary border plus subtle 2px ring.
- Textareas may grow vertically.

### Tables

- Full width, collapsed borders, 11.5px text.
- Header background secondary, 10px uppercase labels.
- Header and cells: 5–8px padding.
- Row bottom borders and secondary hover background.
- Sticky headers in scroll containers.
- Keep operational columns visible; horizontal scrolling is preferred to hiding data.

### Badges

- Compact 10px bold label.
- 1–6px padding.
- 3px radius.
- Use semantic pale backgrounds.

### Modal

- Fixed dim overlay.
- Centered white panel with border and restrained shadow.
- 4px radius.
- Header, scrollable body and explicit actions.

## Semantic colors

- Primary/nav/action: dark navy blue.
- Confirmed/success/payment: emerald green.
- Allocated/information: blue.
- Waiting/message/warning: amber.
- Alerts, allergy, debt and negative amount: red.
- Blocked/inactive: slate gray.
- Editable CareStack-style section emphasis may use pale yellow sparingly.

## Scheduler colors

```css
.slot-confirmed {
  background: hsl(152, 55%, 92%);
  border-left: 3px solid hsl(152, 60%, 36%);
}
.slot-allocated {
  background: hsl(210, 80%, 93%);
  border-left: 3px solid hsl(210, 70%, 45%);
}
.slot-message {
  background: hsl(38, 90%, 92%);
  border-left: 3px solid hsl(38, 90%, 48%);
}
.slot-blocked {
  background: hsl(220, 15%, 90%);
  border-left: 3px solid hsl(220, 10%, 50%);
}
```

## Layout rules

- Use `h-screen` and keep the application shell fixed to the viewport.
- Individual data areas scroll; body should not.
- Use `min-h-0` on nested flex/grid containers to avoid overflow bugs.
- Main content uses compact 8–12px gaps.
- Preserve clear separation between global sidebar and patient workspace sidebar.
- Do not use giant cards, excessive rounded corners, glassmorphism, gradients in core screens, or oversized whitespace.

## Accessibility

- Interactive elements must be buttons or links.
- Add useful titles/labels to icon-only controls.
- Maintain visible focus states.
- Do not communicate status using color alone.
- Modal overlays must be closable.
