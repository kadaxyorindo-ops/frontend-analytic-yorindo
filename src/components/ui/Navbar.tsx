import { Bell, Settings, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { user } = useAuth();
  const displayName = user?.name ?? "Guest";
  const roleLabel = user?.role ? user.role.replace("_", " ") : "Visitor";

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded"></div>
        <span className="font-semibold">EO Company</span>
      </div>

      {/* Center Left */}
      <div className="font-bold">EVENT ANALYTICS</div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Bell size={20} />
        <Settings size={20} />
        <HelpCircle size={20} />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-sm">
            <div className="font-medium">{displayName}</div>
            <div className="text-gray-500">{roleLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
