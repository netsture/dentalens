# Master Cursor Prompt

Copy everything below this line into Cursor Agent mode:

---

Build a complete frontend-only clone of the DentaLens dental practice application described in the `cursor_ai` folder.

Before changing or creating code, read these files completely:

1. `cursor_ai/PRODUCT_SPEC.md`
2. `cursor_ai/DESIGN_SYSTEM.md`
3. `cursor_ai/IMPLEMENTATION_GUIDE.md`
4. `cursor_ai/CHANGE_REQUEST_TEMPLATE.md`

Treat those documents as the source of truth. If `CHANGE_REQUEST_TEMPLATE.md` contains active requirements, they override conflicting older requirements.

## Goal

Create the same dense desktop dental ERP frontend, navigation hierarchy, routes, visual design, mock datasets, and interactive demonstrations specified in the documents. The app must look like one coherent product, not disconnected template pages.

## Required behavior

- Work autonomously until the complete frontend is implemented.
- Inspect the existing repository first and preserve good existing functionality.
- If the repository is empty, scaffold the stack specified in `IMPLEMENTATION_GUIDE.md`.
- Implement every required route and menu entry.
- Keep the application frontend-only with realistic local fixture data.
- Buttons that imply a visible UI action must work: navigation, tabs, filters, search, expansion, modals, date stepping, view switching, selection, toggles, and temporary save feedback.
- Do not add a backend, database, external API, or paid service.
- Do not replace the dense ERP design with a generic dashboard template.
- **Theme-first rule:** Always use the DentaLens theme (`panel`, `field`, `btn`, tokens). Do not implement outside themes. Only restyle to match a reference image when the user explicitly asks for that redesign; otherwise keep theme layout even if a screenshot is attached.
- Do not omit screens because they use mock data.
- Use reusable components for the shell, tables, toolbars, patient workspace, fields, badges, modals, and navigation.
- Preserve compatibility routes listed in `PRODUCT_SPEC.md`.
- Use responsive fallbacks without compromising the desktop-first design.

## Implementation sequence

1. Inspect the repository and map current files against all documents.
2. Set up the design tokens and shared layout.
3. Implement authentication shell and global navigation.
4. Implement scheduling workflows.
5. Implement patient workspace and clinical workflows.
6. Implement billing, documents, reports, and settings.
7. Apply requirements from `CHANGE_REQUEST_TEMPLATE.md`.
8. Run TypeScript/build checks and fix every introduced error.
9. Review all routes in the browser if browser tools are available.

## Completion criteria

Do not stop after creating placeholders. The task is complete only when:

- All routes in `PRODUCT_SPEC.md` render.
- All menu entries navigate to the correct screen.
- The shell and screens follow `DESIGN_SYSTEM.md`.
- Required mock datasets are visible.
- Required interactions work locally.
- The application builds successfully.
- No TypeScript or linter errors were introduced.

At completion, report only:

- Main files created or changed
- Routes implemented
- Verification commands and results
- Any genuine remaining limitation

---
