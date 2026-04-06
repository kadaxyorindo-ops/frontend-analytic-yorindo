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