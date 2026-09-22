# DentSaas Frontend Clone Pack

આ folder બીજા PC પર Cursor AI દ્વારા DentSaas frontend ફરીથી બનાવવા માટેનો portable blueprint છે.

## કેવી રીતે ઉપયોગ કરવો

1. નવો ખાલી project folder બનાવો.
2. આ આખો `cursor_ai` folder તેમાં copy કરો.
3. Cursor Agent mode ખોલો.
4. `MASTER_PROMPT.md`નું content prompt તરીકે paste કરો.
5. Agentને બધા documents વાંચવા અને implementation પૂર્ણ થાય ત્યાં સુધી કામ કરવા દો.
6. અંતે `npm run build` અને browser verification કરાવો.

## Documents

- `MASTER_PROMPT.md` — Cursorમાં સીધો run કરવાનો મુખ્ય prompt.
- `PRODUCT_SPEC.md` — routes, menus, screens અને required interactions.
- `DESIGN_SYSTEM.md` — exact visual language, spacing, colors અને reusable UI.
- `IMPLEMENTATION_GUIDE.md` — architecture, files, mock data અને verification workflow.
- `CHANGE_REQUEST_TEMPLATE.md` — ભવિષ્યમાં changes લખવા માટે editable template.

## Change કેવી રીતે કરવો

1. પહેલાં સંબંધિત document update કરો.
2. `CHANGE_REQUEST_TEMPLATE.md`માં requested changes લખો.
3. Cursorમાં ફરી `MASTER_PROMPT.md` run કરો.
4. Prompt સાથે લખો: `Apply all requirements, including CHANGE_REQUEST_TEMPLATE.md, to the existing app.`

## મહત્વપૂર્ણ

AI માત્ર description પરથી દરેક pixel હંમેશા સરખો બનાવી શકે તેવી guarantee નથી. સૌથી નજીકનું clone મેળવવા:

- આ documents edit કરતી વખતે exact dimensions અને behavior જાળવો.
- શક્ય હોય તો original screenshots/videos પણ નવા PC પર આપો.
- Existing project ઉપલબ્ધ હોય તો source code સાથે copy કરવું સૌથી ચોક્કસ રીત છે.
- Agentને scope ઘટાડવા, backend ઉમેરવા અથવા design “modernize” કરવાની મંજૂરી આપશો નહીં.

### Theme-first design rule

- Default: હંમેશા DentSaas theme layout (`panel`, `field`, `btn`, tokens) વાપરો.
- Reference image attach કરવું માત્ર = બીજું design ન લાગુ કરો.
- જ્યારે તમે સ્પષ્ટ કહો કે reference image પ્રમાણે redesign કરો, ત્યારે જ visual design બદલો.
- અન્યથા fields/structure referenceમાંથી લો, styling theme માં રાખો.

આ package frontend-only છે. API, database, payment gateway અથવા production authentication implement કરવાના નથી.
