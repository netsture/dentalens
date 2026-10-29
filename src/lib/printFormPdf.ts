import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import { PRINT_FORM_GROUPS, type FormLang, type PrintFormItem } from "@/lib/printForms";

export type PrintPdfPatient = {
  id: string;
  name: string;
  dob: string;
};

const MARGIN = 22;
const HEADER_H = 118;
const FOOTER_H = 52;
const DISCLAIMER =
  "All licensed practitioners enter electronic notes using their unique login and password. Electronic signatures are on file with the practice.";

function pad(value: string, size: number) {
  return value.replace(/\D/g, "").padStart(size, "0").slice(-size);
}

export function barcodeValue(patientId: string, formCode: string) {
  return `000153000${pad(patientId, 6)}00${pad(formCode, 4)}01`;
}

function formatNow() {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(now.getMonth() + 1)}-${p(now.getDate())}-${now.getFullYear()} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}

function ageFromDob(dob: string) {
  const parts = dob.split(/[-/]/).map((part) => Number(part));
  if (parts.length !== 3 || parts.some((n) => !n)) return "";
  const monthFirst = parts[2] > 31;
  const month = monthFirst ? parts[0] : parts[1];
  const day = monthFirst ? parts[1] : parts[2];
  const year = monthFirst ? parts[2] : parts[0];
  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return `${age} Yrs`;
}

function makeBarcodePng(value: string) {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    displayValue: true,
    fontSize: 10,
    height: 38,
    margin: 0,
    width: 1.15,
    background: "#ffffff",
    lineColor: "#000000",
  });
  return canvas.toDataURL("image/png");
}

function drawHeader(doc: jsPDF, patient: PrintPdfPatient, formCode: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const left = MARGIN;
  const age = ageFromDob(patient.dob);
  const rows: [string, string][] = [
    ["CORP. NAME:", "SIGNATURE SMILE PC"],
    ["PATIENT:", `#${patient.id}   ${patient.name.toUpperCase()}`],
    ["D.O.B.:", `${patient.dob}${age ? ` [${age}]` : ""}`],
    ["INSURANCE:", "AETNA PPO IA(PPO)"],
  ];

  let y = 28;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(label, left, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, left + 78, y);
    y += 11;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("OFFICE NAME:", left, y);
  doc.setFont("helvetica", "bold");
  doc.text("TEST Dr. B,  OFFICE ADDRESS : add line 1,line2,Fort Washington, PA, 19034", left + 78, y);
  y += 11;
  doc.setFont("helvetica", "normal");
  doc.text(`Date Time: ${formatNow()}`, left, y);
  y += 11;
  doc.setFontSize(6.5);
  const disclaimer = doc.splitTextToSize(`Disclaimer: ${DISCLAIMER}`, pageW - MARGIN * 2 - 8);
  doc.text(disclaimer, left, y);

  const barcode = makeBarcodePng(barcodeValue(patient.id, formCode));
  doc.addImage(barcode, "PNG", pageW - MARGIN - 196, 14, 196, 42);
}

function drawFooter(doc: jsPDF, patient: PrintPdfPatient, formCode: string, pageNo: number, pageCount: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const barcode = makeBarcodePng(barcodeValue(patient.id, formCode));
  doc.addImage(barcode, "PNG", MARGIN, pageH - 48, 196, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Pg ${pageNo} of ${pageCount}`, pageW - MARGIN, pageH - 16, { align: "right" });
}

function title(doc: jsPDF, text: string, y: number) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(text, pageW / 2, y, { align: "center" });
  return y + 16;
}

function subtitle(doc: jsPDF, text: string, y: number) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(text, pageW / 2, y, { align: "center" });
  return y + 12;
}

function checkRow(doc: jsPDF, x: number, y: number, label: string) {
  doc.rect(x, y - 6, 8, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(label, x + 12, y);
}

function dottedLine(doc: jsPDF, x1: number, y: number, x2: number) {
  doc.setLineDashPattern([0.8, 1.4], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
}

function signatureBlock(doc: jsPDF, y: number, leftLabel: string, rightLabel = "Date :") {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${leftLabel} :`, MARGIN, y);
  doc.line(MARGIN + doc.getTextWidth(`${leftLabel} : `), y, pageW - 160, y);
  doc.text(rightLabel, pageW - 150, y);
  doc.line(pageW - 150 + doc.getTextWidth(rightLabel) + 4, y, pageW - MARGIN, y);
}

function drawDentalChart(doc: jsPDF, startY: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const x = MARGIN;
  const w = pageW - MARGIN * 2;
  const cols = 16;
  const colW = w / cols;
  const rowH = 14;
  const upperRows = 4;
  const lowerRows = 4;
  const upperH = upperRows * rowH;
  const lowerH = lowerRows * rowH;
  const midY = startY + 18 + upperH;

  const upperNums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
  const upperLets = ["", "", "", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "", "", ""];
  const lowerLets = ["", "", "", "T", "S", "R", "Q", "P", "O", "N", "M", "L", "K", "", "", ""];
  const lowerNums = ["32", "31", "30", "29", "28", "27", "26", "25", "24", "23", "22", "21", "20", "19", "18", "17"];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  upperNums.forEach((n, i) => {
    const cx = x + colW * i + colW / 2;
    if (upperLets[i]) doc.text(upperLets[i], cx, startY, { align: "center" });
    doc.text(n, cx, startY + 11, { align: "center" });
  });

  doc.setLineWidth(0.4);
  doc.rect(x, startY + 16, w, upperH + lowerH);
  for (let i = 1; i < cols; i++) doc.line(x + colW * i, startY + 16, x + colW * i, startY + 16 + upperH + lowerH);
  for (let r = 1; r < upperRows; r++) doc.line(x, startY + 16 + rowH * r, x + w, startY + 16 + rowH * r);
  for (let r = 1; r < lowerRows; r++) doc.line(x, midY + rowH * r, x + w, midY + rowH * r);
  doc.setLineWidth(1.4);
  doc.line(x, midY, x + w, midY);
  doc.line(x + colW * 8, startY + 16, x + colW * 8, startY + 16 + upperH + lowerH);
  doc.setLineWidth(0.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const bottom = startY + 16 + upperH + lowerH;
  lowerNums.forEach((n, i) => {
    const cx = x + colW * i + colW / 2;
    if (lowerLets[i]) doc.text(lowerLets[i], cx, bottom + 11, { align: "center" });
    doc.text(n, cx, bottom + 22, { align: "center" });
  });
  return bottom + 30;
}

function drawDentalExamination(doc: jsPDF, lang: FormLang) {
  const pageW = doc.internal.pageSize.getWidth();
  let y = title(doc, lang === "es" ? "EXAMEN DENTAL" : "DENTAL EXAMINATION", HEADER_H);
  y = subtitle(doc, lang === "es" ? "ODONTOGRAMA" : "DENTAL CHART", y);
  y = drawDentalChart(doc, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(lang === "es" ? "EXAMEN DE TEJIDOS BLANDOS Y PSR" : "SOFT TISSUE ORAL EXAM & PSR", pageW / 2, y, { align: "center" });
  y += 14;

  const tissues = ["LIPS", "CHEEKS", "MUCOSA", "TONGUE", "SALIVARY GLANDS", "LYMPH NODES", "TMJ"];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Normal", MARGIN + 20, y);
  doc.text("Abnormal Remarks", MARGIN + 160, y);
  y += 10;
  tissues.forEach((item) => {
    checkRow(doc, MARGIN, y, item);
    checkRow(doc, MARGIN + 148, y, "");
    dottedLine(doc, MARGIN + 162, y, pageW - MARGIN);
    y += 12;
  });

  y += 6;
  doc.setLineWidth(0.8);
  doc.rect(MARGIN, y, pageW - MARGIN * 2, 14);
  checkRow(doc, MARGIN + 6, y + 10, "THIRD MOLARS / WISDOM TEETH EVALUATION BY ORAL SURGEON");
  y += 20;

  const boxH = 132;
  const splitX = pageW / 2;
  doc.rect(MARGIN, y, pageW - MARGIN * 2, boxH);
  doc.line(splitX, y, splitX, y + boxH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Periodontal Consideration", MARGIN + 6, y + 12);
  ["Healthy", "Gingivitis", "Periodontitis"].forEach((item, i) => checkRow(doc, MARGIN + 8, y + 26 + i * 11, item));
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Treatment", MARGIN + 6, y + 62);
  ["3 Month Recall", "6 Month Recall", "Scaling & Root Planning", "Arestin or other Chemotherapeutic Tx", "Antibiotic Therapy", "Recommended Periodontist Consultation", "Other:"].forEach(
    (item, i) => checkRow(doc, MARGIN + 8, y + 74 + i * 8.5, item)
  );

  doc.setFont("helvetica", "bold");
  doc.text("Occlusion/Ortho Consultation", splitX + 8, y + 12);
  ["Primary", "Mixed", "Permanent", "Edentulous"].forEach((item, i) => checkRow(doc, splitX + 10, y + 28 + i * 12, item));
  ["Class-I", "Class-II", "Class-III", "Cross Bite", "Over Bite", "Overjet", "Crowding"].forEach((item, i) =>
    checkRow(doc, splitX + 90, y + 28 + i * 12, item)
  );
  checkRow(doc, splitX + 10, y + 82, "Recommended Ortho Consultation and Treatment");
  doc.setFont("helvetica", "bold");
  doc.text("Other Remarks:", splitX + 8, y + 100);
  dottedLine(doc, splitX + 78, y + 100, pageW - MARGIN - 6);

  signatureBlock(doc, y + boxH + 22, "Dentist / Hyg Name & Signature");
}

function drawGenericForm(doc: jsPDF, form: PrintFormItem, lang: FormLang) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const name = lang === "es" ? form.es : form.en;
  let y = title(doc, name, HEADER_H);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${form.code}`, pageW / 2, y, { align: "center" });
  y += 16;

  const questions = genericQuestions(form.code, lang);
  questions.forEach((q) => {
    if (y > pageH - FOOTER_H - 40) return;
    if (q.type === "heading") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(q.text, MARGIN, y);
      y += 14;
      return;
    }
    if (q.type === "line") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(q.text, MARGIN, y);
      dottedLine(doc, MARGIN + doc.getTextWidth(q.text) + 6, y, pageW - MARGIN);
      y += 16;
      return;
    }
    checkRow(doc, MARGIN, y, q.text);
    y += 13;
  });

  y = Math.max(y + 10, pageH - FOOTER_H - 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(lang === "es" ? "Notas:" : "Notes:", MARGIN, y);
  y += 8;
  for (let i = 0; i < 4; i++) {
    dottedLine(doc, MARGIN, y + i * 14, pageW - MARGIN);
  }
  signatureBlock(doc, y + 70, lang === "es" ? "Firma" : "Provider Signature");
}

type GenericQ = { type: "heading" | "check" | "line"; text: string };

function genericQuestions(code: string, lang: FormLang): GenericQ[] {
  const es = lang === "es";
  const map: Record<string, GenericQ[]> = {
    "1000": [
      { type: "heading", text: es ? "Información del paciente" : "Patient information" },
      { type: "line", text: es ? "Dirección" : "Address" },
      { type: "line", text: es ? "Teléfono" : "Phone" },
      { type: "line", text: es ? "Correo" : "Email" },
      { type: "line", text: es ? "Contacto de emergencia" : "Emergency contact" },
      { type: "check", text: es ? "Autorizo el tratamiento de rutina" : "I authorize routine dental treatment" },
    ],
    "1005": [
      { type: "heading", text: es ? "Historia médica" : "Medical history" },
      { type: "check", text: "Heart disease / Hypertension" },
      { type: "check", text: "Diabetes" },
      { type: "check", text: "Asthma / Breathing problems" },
      { type: "check", text: "Bleeding problems" },
      { type: "check", text: "Allergies (list):" },
      { type: "line", text: es ? "Medicamentos actuales" : "Current medications" },
    ],
    "1010": [
      { type: "heading", text: "HIPAA" },
      { type: "check", text: es ? "He recibido el aviso de privacidad" : "I have received the Notice of Privacy Practices" },
      { type: "check", text: es ? "Autorizo el uso de información de salud para tratamiento" : "I authorize use of health information for treatment" },
    ],
    "2500": [
      { type: "heading", text: "STOP-BANG" },
      { type: "check", text: "Snoring: Do you snore loudly?" },
      { type: "check", text: "Tired: Do you often feel tired during the day?" },
      { type: "check", text: "Observed: Has anyone observed you stop breathing?" },
      { type: "check", text: "Pressure: Do you have high blood pressure?" },
      { type: "check", text: "BMI more than 35?" },
      { type: "check", text: "Age over 50?" },
      { type: "check", text: "Neck circumference large?" },
      { type: "check", text: "Gender male?" },
    ],
    "4000": [
      { type: "heading", text: es ? "Consentimiento de tratamiento" : "Consent for treatment" },
      { type: "check", text: es ? "Entiendo el plan de tratamiento propuesto" : "I understand the proposed treatment plan" },
      { type: "check", text: es ? "Se me explicaron riesgos y alternativas" : "Risks and alternatives were explained" },
      { type: "check", text: es ? "Doy consentimiento para el tratamiento" : "I consent to treatment" },
    ],
    "4010": [
      { type: "heading", text: es ? "Consentimiento de endodoncia" : "Root canal consent" },
      { type: "check", text: es ? "Entiendo que el diente puede requerir corona" : "I understand the tooth may need a crown" },
      { type: "check", text: es ? "Se explicaron riesgos de infección o fractura" : "Infection and fracture risks were explained" },
    ],
  };
  return (
    map[code] ?? [
      { type: "heading", text: es ? "Información clínica" : "Clinical information" },
      { type: "check", text: es ? "Revisado con el paciente" : "Reviewed with patient" },
      { type: "check", text: es ? "Requiere seguimiento" : "Follow-up required" },
      { type: "line", text: es ? "Hallazgos" : "Findings" },
    ]
  );
}

function drawFormBody(doc: jsPDF, form: PrintFormItem, lang: FormLang) {
  if (form.code === "2000") {
    drawDentalExamination(doc, lang);
    return;
  }
  drawGenericForm(doc, form, lang);
}

export function downloadPrintForms(forms: PrintFormItem[], patient: PrintPdfPatient, lang: FormLang) {
  if (forms.length === 0) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const total = forms.length;
  forms.forEach((form, index) => {
    if (index > 0) doc.addPage();
    drawHeader(doc, patient, form.code);
    drawFormBody(doc, form, lang);
    drawFooter(doc, patient, form.code, index + 1, total);
  });
  const filename =
    forms.length === 1 ? `${forms[0].code}-${patient.id}.pdf` : `print-forms-${patient.id}.pdf`;
  doc.save(filename);
}

export function formsFromCodes(codes: string[]) {
  return codes
    .map((code) => PRINT_FORM_GROUPS.flatMap((group) => group.items).find((item) => item.code === code))
    .filter((item): item is PrintFormItem => Boolean(item));
}
