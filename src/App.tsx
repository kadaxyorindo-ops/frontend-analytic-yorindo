import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "@/pages/auth/Login";

function HomeBlank() {
  return <div className="min-h-screen bg-white" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomeBlank />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
