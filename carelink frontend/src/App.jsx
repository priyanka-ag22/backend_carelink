import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { PatientProvider } from './context/PatientContext';
import Spinner from './components/Spinner';

const Dashboard        = lazy(() => import('./pages/Dashboard'));
const PatientReg       = lazy(() => import('./pages/PatientRegistration'));
const ClaimSubmission  = lazy(() => import('./pages/ClaimSubmission'));
const Patients         = lazy(() => import('./pages/Patients'));
const Doctors          = lazy(() => import('./pages/Doctors'));
const Appointments     = lazy(() => import('./pages/Appointments'));
const MedicalRecords   = lazy(() => import('./pages/MedicalRecords'));
const AISymptomAnalyzer = lazy(() => import('./pages/AISymptomAnalyzer'));
const Settings         = lazy(() => import('./pages/Settings'));
const NotFound         = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <PatientProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="d-flex align-items-center justify-content-center" style={{ minHeight:'100vh' }}><Spinner size="lg" message="Loading…" /></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"         element={<Dashboard />} />
              <Route path="/register-patient"  element={<PatientReg />} />
              <Route path="/submit-claim"      element={<ClaimSubmission />} />
              <Route path="/patients"          element={<Patients />} />
              <Route path="/doctors"           element={<Doctors />} />
              <Route path="/appointments"      element={<Appointments />} />
              <Route path="/medical-records"   element={<MedicalRecords />} />
              <Route path="/ai-analyzer"       element={<AISymptomAnalyzer />} />
              <Route path="/settings"          element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </PatientProvider>
  );
}

export default App;
