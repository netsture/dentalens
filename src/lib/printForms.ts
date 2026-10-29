export type FormLang = "en" | "es";

export type PrintFormItem = {
  code: string;
  en: string;
  es: string;
};

export type PrintFormGroup = {
  code: string;
  en: string;
  es: string;
  items: PrintFormItem[];
};

export function findPrintForm(code: string) {
  for (const group of PRINT_FORM_GROUPS) {
    const item = group.items.find((form) => form.code === code);
    if (item) return { group, item };
  }
  return null;
}

export const PRINT_FORM_GROUPS: PrintFormGroup[] = [
  {
    code: "10",
    en: "PATIENT AND OFFICE FORMS",
    es: "FORMULARIOS DEL PACIENTE Y OFICINA",
    items: [
      { code: "1000", en: "PATIENT REGISTRATION", es: "REGISTRO DEL PACIENTE" },
      { code: "1005", en: "MEDICAL HISTORY", es: "HISTORIA MÉDICA" },
      { code: "1010", en: "HIPAA NOTICE OF PRIVACY PRACTICES", es: "AVISO HIPAA DE PRÁCTICAS DE PRIVACIDAD" },
      { code: "1015", en: "OFFICE FINANCIAL POLICY", es: "POLÍTICA FINANCIERA DE LA OFICINA" },
    ],
  },
  {
    code: "20",
    en: "DENTAL EXAMINATIONS",
    es: "EXÁMENES DENTALES",
    items: [
      { code: "2000", en: "DENTAL EXAMINATION-GENERAL", es: "EXAMEN DENTAL GENERAL" },
      { code: "2001", en: "PERIODONTAL SCREENING AND RECORDING (PSR)", es: "TAMIZAJE Y REGISTRO PERIODONTAL (PSR)" },
      { code: "2010", en: "PERIODONTAL EXAMINATION-COMPREHENSIVE", es: "EXAMEN PERIODONTAL COMPLETO" },
      { code: "2015", en: "PROGRESS NOTE", es: "NOTA DE PROGRESO" },
    ],
  },
  {
    code: "25",
    en: "SLEEP APNEA RELATED",
    es: "RELACIONADO CON APNEA DEL SUEÑO",
    items: [
      { code: "2500", en: "STOP-BANG SLEEP APNEA QUESTIONNAIRE", es: "CUESTIONARIO STOP-BANG DE APNEA DEL SUEÑO" },
      { code: "2505", en: "SOAP NOTES FOR DOCUMENTING SLEEP APNEA", es: "NOTAS SOAP PARA DOCUMENTAR APNEA DEL SUEÑO" },
      { code: "2510", en: "SLEEP TEST REFERRAL TO LVPG", es: "REFERENCIA DE PRUEBA DE SUEÑO A LVPG" },
      { code: "2515", en: "INCOMING REFERRAL FORM FOR ORAL APPLIANCE THERAPY", es: "FORMULARIO DE REFERENCIA PARA TERAPIA CON APARATO ORAL" },
    ],
  },
  {
    code: "30",
    en: "PATIENT RECORDS",
    es: "REGISTROS DEL PACIENTE",
    items: [
      { code: "3000", en: "PATIENT CHART SUMMARY", es: "RESUMEN DE LA HISTORIA CLÍNICA" },
      { code: "3005", en: "HEALTH HISTORY UPDATE", es: "ACTUALIZACIÓN DE HISTORIA DE SALUD" },
      { code: "3010", en: "MEDICATION LIST", es: "LISTA DE MEDICAMENTOS" },
      { code: "3015", en: "TREATMENT RECORD", es: "REGISTRO DE TRATAMIENTO" },
    ],
  },
  {
    code: "40",
    en: "CONSENT FORMS",
    es: "FORMULARIOS DE CONSENTIMIENTO",
    items: [
      { code: "4000", en: "GENERAL CONSENT FOR TREATMENT", es: "CONSENTIMIENTO GENERAL PARA TRATAMIENTO" },
      { code: "4005", en: "INFORMED CONSENT - EXTRACTION", es: "CONSENTIMIENTO INFORMADO - EXTRACCIÓN" },
      { code: "4010", en: "INFORMED CONSENT - ROOT CANAL", es: "CONSENTIMIENTO INFORMADO - ENDODONCIA" },
      { code: "4015", en: "INFORMED CONSENT - CROWN / BRIDGE", es: "CONSENTIMIENTO INFORMADO - CORONA / PUENTE" },
    ],
  },
  {
    code: "42",
    en: "ORAL & MAXILLOFACIAL SURGERY",
    es: "CIRUGÍA ORAL Y MAXILOFACIAL",
    items: [
      { code: "4200", en: "ORAL SURGERY PRE-OP INSTRUCTIONS", es: "INSTRUCCIONES PREOPERATORIAS DE CIRUGÍA ORAL" },
      { code: "4205", en: "POST-OPERATIVE INSTRUCTIONS", es: "INSTRUCCIONES POSTOPERATORIAS" },
      { code: "4210", en: "EXTRACTION CONSENT", es: "CONSENTIMIENTO DE EXTRACCIÓN" },
      { code: "4215", en: "BIOPSY REQUEST", es: "SOLICITUD DE BIOPSIA" },
    ],
  },
  {
    code: "45",
    en: "PEDO PAPERWORK",
    es: "DOCUMENTOS PEDIÁTRICOS",
    items: [
      { code: "4500", en: "PEDIATRIC MEDICAL HISTORY", es: "HISTORIA MÉDICA PEDIÁTRICA" },
      { code: "4505", en: "PARENT / GUARDIAN CONSENT", es: "CONSENTIMIENTO DE PADRE / TUTOR" },
      { code: "4510", en: "BEHAVIOR MANAGEMENT CONSENT", es: "CONSENTIMIENTO DE MANEJO DE CONDUCTA" },
      { code: "4515", en: "NITROUS OXIDE CONSENT", es: "CONSENTIMIENTO DE ÓXIDO NITROSO" },
    ],
  },
];
