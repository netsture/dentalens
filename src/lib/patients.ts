export type SearchPatient = {
  id: string;
  name: string;
  phone: string;
  dob: string;
  status: string;
};

export const SEARCH_PATIENTS: SearchPatient[] = [
  { id: "1494", name: "Melissa Que", phone: "(419) 731-5344", dob: "01-01-1990", status: "Active" },
  { id: "16665", name: "Denise Wingard", phone: "215-555-0142", dob: "03-12-1984", status: "Active" },
  { id: "17001", name: "JOHNSONN ELLA", phone: "484-903-7236", dob: "02-27-2012", status: "Active" },
  { id: "17002", name: "BRAKE ZOIEY", phone: "201-616-6586", dob: "08-28-2012", status: "Active" },
  { id: "17003", name: "MCNUTT PHEONIX", phone: "484-597-1934", dob: "02-19-2012", status: "Active" },
  { id: "17004", name: "CURRY NEVAEH", phone: "484-554-6555", dob: "02-15-2005", status: "New" },
  { id: "17005", name: "DELGADO GENESIS", phone: "862-247-7212", dob: "03-03-2010", status: "Active" },
  { id: "17006", name: "BALSECA SAMUEL", phone: "201-552-0729", dob: "05-12-2009", status: "New" },
  { id: "17007", name: "ESCOBAR TEJADA DARA", phone: "484-375-5283", dob: "02-01-2013", status: "Inactive" },
  { id: "375000", name: "MORELL ALBERTO", phone: "215-555-0188", dob: "12-13-1949", status: "Active" },
  { id: "854666", name: "TEJADA RODRIGUEZ MAURICIO", phone: "215-555-0190", dob: "12-30-2001", status: "Active" },
  { id: "855107", name: "VASQUEZ LOUITES", phone: "215-555-0191", dob: "06-08-1964", status: "Active" },
  { id: "900889", name: "REESE TERRY", phone: "215-555-0192", dob: "01-08-1974", status: "Active" },
  { id: "100500", name: "SMITH ZEFFELI", phone: "215-555-0193", dob: "03-04-1980", status: "Active" },
  { id: "854924", name: "MURTHY LYDIA", phone: "215-555-0194", dob: "05-20-1964", status: "Active" },
  { id: "854760", name: "CROSSON RHONDA", phone: "215-555-0195", dob: "10-19-1975", status: "Active" },
  { id: "851982", name: "JOHNSON", phone: "215-555-0196", dob: "03-12-1984", status: "Active" },
];

export function getPatientById(id: string) {
  return SEARCH_PATIENTS.find((patient) => patient.id === id);
}

export function searchPatients(query: string, limit = 8): SearchPatient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_PATIENTS.filter((patient) =>
    [patient.id, patient.name, patient.phone, patient.dob].some((value) => value.toLowerCase().includes(q))
  ).slice(0, limit);
}
