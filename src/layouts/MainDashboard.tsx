import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom"; 
import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";

type MainDashboardProps = {
  children?: ReactNode;
};

const MainDashboard = ({ children }: MainDashboardProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* CONTENT */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-48"
        }`}
      >
        <Navbar />

        <div className="p-6">{children ?? <Outlet />}</div>
      </div>
    </div>
  );
};

export default MainDashboard;
