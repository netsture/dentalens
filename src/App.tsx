import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AppointmentBookPage from "@/pages/AppointmentBookPage";
import PatientPage from "@/pages/PatientPage";
import PatientBillingPage from "@/pages/PatientBillingPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ReportPage from "@/pages/ReportPage";
import SettingsPage from "@/pages/SettingsPage";
import SchedulerToolsPage from "@/pages/SchedulerToolsPage";
import PatientWorkspacePage from "@/pages/PatientWorkspacePage";
import PracticeSetupPage from "@/pages/PracticeSetupPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/practice-setup" element={<PracticeSetupPage />} />
          <Route path="/appointment/book" element={<AppointmentBookPage />} />
          <Route path="/appointment/find-slot" element={<SchedulerToolsPage />} />
          <Route path="/appointment/online" element={<SchedulerToolsPage />} />
          <Route path="/appointment/short-call" element={<SchedulerToolsPage />} />
          <Route path="/appointment/unscheduled" element={<SchedulerToolsPage />} />
          <Route path="/appointment/recalls" element={<SchedulerToolsPage />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/patient/overview" element={<PatientWorkspacePage />} />
          <Route path="/patient/insurance" element={<PatientWorkspacePage />} />
          <Route path="/patient/clinical" element={<PatientWorkspacePage />} />
          <Route path="/patient/treatment" element={<PatientWorkspacePage />} />
          <Route path="/patient/recalls" element={<PatientWorkspacePage />} />
          <Route path="/patient/authorizations" element={<PatientWorkspacePage />} />
          <Route path="/patient/billing" element={<PatientBillingPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
