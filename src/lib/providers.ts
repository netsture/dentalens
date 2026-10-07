export type Provider = {
  id: string;
  no: number;
  type: string;
  name: string;
  npi: string;
  patientCount: number;
  status: "Active";
};

export type DoctorScheduleRow = {
  id: string;
  providerId: string;
  patientId: string;
  patientName: string;
  checkIn: string;
  chair: string;
  status: string;
};

export const providers: Provider[] = [
  { id: "p1", no: 1, type: "Doctor", name: "Delozier Amee (Savani 1)", npi: "1678901234", patientCount: 2, status: "Active" },
  { id: "p2", no: 2, type: "Doctor", name: "Thomas Jasmine", npi: "1567890123", patientCount: 2, status: "Active" },
  { id: "p3", no: 3, type: "Doctor", name: "Patel Khushmbu", npi: "1456789012", patientCount: 1, status: "Active" },
  { id: "p4", no: 4, type: "Doctor", name: "Savani Niranjan", npi: "1780067529", patientCount: 0, status: "Active" },
  { id: "p5", no: 5, type: "Doctor", name: "Parasana Pratyush", npi: "1345678901", patientCount: 0, status: "Active" },
];

export const doctorSchedule: DoctorScheduleRow[] = [
  { id: "s1", providerId: "p1", patientId: "17001", patientName: "JOHNSONN ELLA", checkIn: "09:00", chair: "1", status: "Confirmed" },
  { id: "s2", providerId: "p1", patientId: "17002", patientName: "BRAKE ZOIEY", checkIn: "09:30", chair: "2", status: "Waiting" },
  { id: "s3", providerId: "p2", patientId: "17003", patientName: "MCNUTT PHEONIX", checkIn: "10:00", chair: "3", status: "Confirmed" },
  { id: "s4", providerId: "p2", patientId: "16665", patientName: "Denise Wingard", checkIn: "10:40", chair: "1", status: "Allocated" },
  { id: "s5", providerId: "p3", patientId: "17005", patientName: "DELGADO GENESIS", checkIn: "11:10", chair: "4", status: "New" },
];

export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}

export function getProviderSchedule(providerId: string) {
  return doctorSchedule.filter((row) => row.providerId === providerId);
}
