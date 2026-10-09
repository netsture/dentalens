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
  no: number;
  patientId: string;
  patientName: string;
  gender: string;
  dob: string;
  age: string;
  checkIn: string;
  chair: string;
  status: string;
  realtimeAction: string;
  examTx: string;
  eodVerify: string;
  insurance: string;
  insuranceDetail?: string;
  oralSurgeryIns: string;
  alert?: boolean;
};

export const providers: Provider[] = [
  { id: "p1", no: 1, type: "Doctor", name: "Delozier Amee (Savani 1)", npi: "1678901234", patientCount: 2, status: "Active" },
  { id: "p2", no: 2, type: "Doctor", name: "Thomas Jasmine", npi: "1567890123", patientCount: 3, status: "Active" },
  { id: "p3", no: 3, type: "Doctor", name: "Patel Khushmbu", npi: "1456789012", patientCount: 1, status: "Active" },
  { id: "p4", no: 4, type: "Doctor", name: "Savani Niranjan", npi: "1780067529", patientCount: 0, status: "Active" },
  { id: "p5", no: 5, type: "Doctor", name: "Parasana Pratyush", npi: "1345678901", patientCount: 0, status: "Active" },
];

export const doctorSchedule: DoctorScheduleRow[] = [
  {
    id: "s1",
    providerId: "p1",
    no: 1,
    patientId: "17001",
    patientName: "JOHNSONN ELLA",
    gender: "Female",
    dob: "02-27-2012",
    age: "14 YRS",
    checkIn: "09:00 AM",
    chair: "1",
    status: "Confirmed",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s2",
    providerId: "p1",
    no: 2,
    patientId: "17002",
    patientName: "BRAKE ZOIEY",
    gender: "Female",
    dob: "08-28-2012",
    age: "14 YRS",
    checkIn: "09:30 AM",
    chair: "2",
    status: "Waiting",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
  },
  {
    id: "s3",
    providerId: "p2",
    no: 1,
    patientId: "854924",
    patientName: "MURTHY LYDIA",
    gender: "Female",
    dob: "05-20-1964",
    age: "62 YRS",
    checkIn: "04:05 PM",
    chair: "2",
    status: "Checking Out",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s4",
    providerId: "p2",
    no: 2,
    patientId: "854760",
    patientName: "CROSSON RHONDA",
    gender: "Female",
    dob: "10-19-1975",
    age: "50 YRS",
    checkIn: "03:53 PM",
    chair: "3",
    status: "Checkout Completed",
    realtimeAction: "AFTER C/OUT PROC",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s5",
    providerId: "p2",
    no: 3,
    patientId: "851982",
    patientName: "JOHNSON",
    gender: "Female",
    dob: "03-12-1984",
    age: "42 YRS",
    checkIn: "02:16 PM",
    chair: "2",
    status: "Checkout Completed",
    realtimeAction: "AFTER C/OUT PROC",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "FIDELIO INSURANCE COMPANY (PPO)",
    insuranceDetail: "[PRIMARY-AS SELF] AVL: $1,462.00",
    oralSurgeryIns: "NA",
    alert: true,
  },
  {
    id: "s6",
    providerId: "p3",
    no: 1,
    patientId: "17005",
    patientName: "DELGADO GENESIS",
    gender: "Female",
    dob: "03-03-2010",
    age: "16 YRS",
    checkIn: "11:10 AM",
    chair: "4",
    status: "New",
    realtimeAction: "MODIFY",
    examTx: "EXAM TXPLAN",
    eodVerify: "AWAITING PROC",
    insurance: "(CASH)",
    oralSurgeryIns: "NA",
  },
];

export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}

export function getProviderSchedule(providerId: string) {
  return doctorSchedule.filter((row) => row.providerId === providerId);
}
