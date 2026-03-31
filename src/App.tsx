import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import { Events } from "@/pages/events/Events";
import { Communication } from "@/pages/communication/Communication";
import { Settings } from "@/pages/settings/Settings";
import { NotFound } from "@/pages/NotFound";
import {Participants} from "@/components/Participant";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/communication" element={<Communication />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/participants" element={<Participants />} />
        
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;