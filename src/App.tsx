import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RegistrationForm from './pages/registration-visitor/index'
import VisitorEventRegistrationPage from "./pages/event-registration/VisitorEventRegistrationPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* default page */}
        <Route path="/" element={<RegistrationForm />} />

        {/* public visitor route using slug (no eventId in URL) */}
        <Route path="/register/:slug" element={<VisitorEventRegistrationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import MainDashboard from "@/layouts/MainDashboard";
import DashboardHome from "@/pages/DashboardHome";
import Events from "@/pages/event-management/Events";
import EventDetail from "@/pages/event-management/EventDetail";
import Attendees from "@/pages/Attendees";
import Exhibitors from "@/pages/Exhibitors";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import CreateEventPage from "@/pages/CreateEventPage";
import EditEventPage from "@/pages/EditEventPage";
import RegistrationFormPage from "@/pages/RegistrationFormPage";
import SurveyFormPage from "@/pages/SurveyFormPage";
import AnalyticsDashboardPage from "@/pages/AnalyticsDashboardPage";
import { NotFound } from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Navigate to="/events" replace />} />
        <Route element={<MainDashboard />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/exhibitors" element={<Exhibitors />} />
          <Route path="/attendees" element={<Attendees />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/edit/:id" element={<EditEventPage />} />
        <Route
          path="/events/:eventId/registration-form"
          element={<RegistrationFormPage />}
        />
        <Route
          path="/events/:eventId/survey-form"
          element={<SurveyFormPage />}
        />
        <Route
          path="/events/:eventId/analytics"
          element={<AnalyticsDashboardPage />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
