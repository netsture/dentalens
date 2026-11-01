export type PatientAppointmentRow = {
  id: string;
  patientId: string;
  office: string;
  apptDate: string;
  time: string;
  provider: string;
  speciality: string;
  aptColumn: string;
  todaysTx: string;
  remarks: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

const PATIENT_APPOINTMENTS: PatientAppointmentRow[] = [
  {
    id: "apt-17006-1",
    patientId: "17006",
    office: "TEST DR. B",
    apptDate: "01-09-2026",
    time: "12:30 PM",
    provider: "PATEL JOSEPH (DOCTOR)",
    speciality: "GENERAL DENTISTRY",
    aptColumn: "6",
    todaysTx: "RECALL",
    remarks: "",
    status: "CONFIRMED",
    createdBy: "LIVEADMIN",
    createdAt: "01-05-2026 10:43 AM",
    updatedBy: "LIVEADMIN",
    updatedAt: "01-05-2026 10:46 AM",
  },
  {
    id: "apt-17006-2",
    patientId: "17006",
    office: "TEST DR. B",
    apptDate: "01-08-2026",
    time: "11:00 AM",
    provider: "PATEL JOSEPH (DOCTOR)",
    speciality: "GENERAL DENTISTRY",
    aptColumn: "6",
    todaysTx: "RECALL",
    remarks: "",
    status: "CONFIRMED",
    createdBy: "LIVEADMIN",
    createdAt: "01-08-2026 11:11 AM",
    updatedBy: "LIVEADMIN",
    updatedAt: "01-08-2026 11:11 AM",
  },
  {
    id: "apt-17006-3",
    patientId: "17006",
    office: "TEST DR. B",
    apptDate: "01-01-2026",
    time: "01:00 PM",
    provider: "TEST2024 TEST2024 (DOCTOR)",
    speciality: "GENERAL DENTISTRY",
    aptColumn: "2",
    todaysTx: "RECALL",
    remarks: "",
    status: "CONFIRMED",
    createdBy: "LIVEADMIN",
    createdAt: "01-01-2026 11:06 AM",
    updatedBy: "LIVEADMIN",
    updatedAt: "01-01-2026 11:06 AM",
  },
  {
    id: "apt-17006-4",
    patientId: "17006",
    office: "TEST DR. B",
    apptDate: "10-30-2021",
    time: "12:00 PM",
    provider: "JOHN STEPHEN (DOCTOR)",
    speciality: "GENERAL DENTISTRY",
    aptColumn: "1",
    todaysTx: "EXAM, CLEANING",
    remarks: "TEST COLLECT: $5.00",
    status: "NOT ARRIVED",
    createdBy: "LIVEADMIN",
    createdAt: "10-30-2021 02:09 AM",
    updatedBy: "LIVEADMIN",
    updatedAt: "10-30-2021 02:09 AM",
  },
  {
    id: "apt-17006-5",
    patientId: "17006",
    office: "TEST DR. B",
    apptDate: "01-08-2021",
    time: "10:00 AM",
    provider: "PATEL JOSEPH (DOCTOR)",
    speciality: "GENERAL DENTISTRY",
    aptColumn: "2",
    todaysTx: "EXAM, CLEANING",
    remarks: "TEST",
    status: "CONFIRMED",
    createdBy: "LIVEADMIN",
    createdAt: "01-08-2021 10:38 AM",
    updatedBy: "LIVEADMIN",
    updatedAt: "01-08-2021 10:50 AM",
  },
  {
    id: "apt-1494-1",
    patientId: "1494",
    office: "TEST DR. B",
    apptDate: "09-29-2026",
    time: "09:20 AM",
    provider: "HART (DOCTOR)",
    speciality: "GENERAL DENTISTRY",
    aptColumn: "3",
    todaysTx: "RECALL",
    remarks: "",
    status: "CONFIRMED",
    createdBy: "LIVEADMIN",
    createdAt: "09-01-2026 09:00 AM",
    updatedBy: "LIVEADMIN",
    updatedAt: "09-01-2026 09:00 AM",
  },
  {
    id: "apt-17001-1",
    patientId: "17001",
    office: "DUNCAN",
    apptDate: "10-10-2026",
    time: "09:00 AM",
    provider: "ROLLINS THOMAS (DOCTOR)",
    speciality: "ORTHODONTICS",
    aptColumn: "1",
    todaysTx: "EVAL",
    remarks: "",
    status: "CONFIRMED",
    createdBy: "LIVEADMIN",
    createdAt: "10-08-2026 08:12 AM",
    updatedBy: "LIVEADMIN",
    updatedAt: "10-08-2026 08:12 AM",
  },
];

export function getAppointmentsByPatientId(patientId: string) {
  return PATIENT_APPOINTMENTS.filter((row) => row.patientId === patientId);
}
