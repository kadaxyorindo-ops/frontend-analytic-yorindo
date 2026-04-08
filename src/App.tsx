import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import MainDashboard from "@/layouts/MainDashboard";
import EventDashboard from "@/layouts/EventDashboard";
import DashboardHome from "@/pages/DashboardHome";
import Events from "@/pages/event-management/Events";
import EventDetail from "@/pages/event-management/EventDetail";
import EventAnalyticsPage from "@/pages/event-management/EventAnalyticsPage";
import SurveyAnalyticsPage from "@/pages/event-management/SurveyAnalyticsPage";
import FeedbackAnalyticsPage from "@/pages/event-management/FeedbackAnalyticsPage";
import ParticipantsPage from "@/pages/event-management/ParticipantsPage";
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
import RegistrationForm from "@/pages/registration-visitor/index";
import VisitorEventRegistrationPage from "@/pages/event-registration/VisitorEventRegistrationPage";
import RegistrationReviewPage from "@/pages/event-registration/RegistrationReviewPage";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/visitor" element={<RegistrationForm />} />
        <Route path="/register/:slug" element={<VisitorEventRegistrationPage />} />
        <Route path="/register/:slug/review" element={<RegistrationReviewPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Navigate to="/events" replace />} />
          <Route element={<MainDashboard />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/events" element={<Events />} />
            <Route path="/exhibitors" element={<Exhibitors />} />
            <Route path="/attendees" element={<Attendees />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/events/:eventId" element={<EventDashboard />}>
            <Route index element={<EventDetail />} />
            <Route path="event-analytics" element={<EventAnalyticsPage />} />
            <Route path="survey-analytics" element={<SurveyAnalyticsPage />} />
            <Route path="feedback-analytics" element={<FeedbackAnalyticsPage />} />
            <Route path="participants" element={<ParticipantsPage />} />
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
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
