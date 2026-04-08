import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import MainDashboard from "@/layouts/MainDashboard";
import EventDashboard from "@/layouts/EventDashboard";
import DashboardHome from "@/pages/DashboardHome";
import Events from "@/pages/event-management/Events";
import EventDetail from "@/pages/event-management/EventDetail";
import EventParticipants from "@/pages/event-management/EventParticipants";
import EventAnalytics from "@/pages/event-management/EventAnalytics";
import SurveyAnalytics from "@/pages/event-management/SurveyAnalytics";
import FeedbackAnalytics from "@/pages/event-management/FeedbackAnalytics";
import Attendees from "@/pages/Attendees";
import Exhibitors from "@/pages/Exhibitors";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import CreateEventPage from "@/pages/CreateEventPage";
import EditEventPage from "@/pages/EditEventPage";
import RegistrationFormPage from "@/pages/RegistrationFormPage";
import SurveyFormPage from "@/pages/SurveyFormPage";
import { NotFound } from "@/pages/NotFound";
import RegistrationForm from "@/pages/registration-visitor/index";
import VisitorEventRegistrationPage from "@/pages/event-registration/VisitorEventRegistrationPage";
import RegistrationReviewPage from "@/pages/event-registration/RegistrationReviewPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/visitor" element={<RegistrationForm />} />
        <Route path="/register/:slug" element={<VisitorEventRegistrationPage />} />
        <Route path="/register/:slug/review" element={<RegistrationReviewPage />} />
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
          <Route path="participants" element={<EventParticipants />} />
          <Route path="analytics" element={<EventAnalytics />} />
          <Route path="survey-analytics" element={<SurveyAnalytics />} />
          <Route path="feedback-analytics" element={<FeedbackAnalytics />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
