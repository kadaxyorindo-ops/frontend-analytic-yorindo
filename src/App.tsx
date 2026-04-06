import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "@/components/ProtectedRoute"
import { restoreUser } from "@/store/authSlice"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import EventListPage from "@/pages/EventListPage"
import CreateEventPage from "@/pages/CreateEventPage"
import EditEventPage from "@/pages/EditEventPage"
import RegistrationFormPage from "@/pages/RegistrationFormPage"
import SurveyFormPage from "@/pages/SurveyFormPage"
import AnalyticsDashboardPage from "@/pages/AnalyticsDashboardPage"

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(restoreUser())
  }, [dispatch])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/edit/:id" element={<EditEventPage />} />
        <Route
          path="/events/:eventId/registration-form"
          element={<RegistrationFormPage />}
        />
        <Route path="/events/:eventId/survey-form" element={<SurveyFormPage />} />
        <Route path="/events/:eventId/analytics" element={<AnalyticsDashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
        <Route
          path="/dashboard"
          element={
            <div className="flex min-h-screen items-center justify-center bg-neutral-100">
              <div className="card text-center">
                <h1>Super Admin Dashboard</h1>
                <p className="mt-2 text-sm text-neutral-500">Coming Soon</p>
              </div>
            </div>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
