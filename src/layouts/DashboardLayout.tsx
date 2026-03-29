import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Wireframe */}
      <aside className="w-[260px] bg-white border-r-2 border-dashed border-slate-300 flex flex-col fixed inset-y-0 z-20">
        <div className="h-20 border-b border-dashed border-slate-300 flex items-center justify-center px-6">
          <span className="text-slate-400 font-mono">[Logo Component]</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/events" 
            className={`h-12 border border-dashed rounded-lg flex items-center px-4 font-mono text-sm transition-colors ${
              isActive('/events') 
                ? 'bg-slate-100 border-slate-400 text-slate-700' 
                : 'border-slate-300 text-slate-400 hover:bg-slate-50'
            }`}
          >
            [Nav: Events]
          </Link>
          <Link 
            to="/communication" 
            className={`h-12 border border-dashed rounded-lg flex items-center px-4 font-mono text-sm transition-colors ${
              isActive('/communication') 
                ? 'bg-slate-100 border-slate-400 text-slate-700' 
                : 'border-slate-300 text-slate-400 hover:bg-slate-50'
            }`}
          >
            [Nav: Communication]
          </Link>
          <Link 
            to="/settings" 
            className={`h-12 border border-dashed rounded-lg flex items-center px-4 font-mono text-sm transition-colors ${
              isActive('/settings') 
                ? 'bg-slate-100 border-slate-400 text-slate-700' 
                : 'border-slate-300 text-slate-400 hover:bg-slate-50'
            }`}
          >
            [Nav: Settings]
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[260px]">
        {/* Topbar Wireframe */}
        <header className="h-20 bg-white border-b-2 border-dashed border-slate-300 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="w-full max-w-md relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events or organizers..."
              className="w-full h-10 bg-slate-100 border border-dashed border-slate-300 rounded-lg px-4 text-sm font-mono outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-mono text-xs cursor-help">?</div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-500 font-mono text-xs hover:bg-slate-300 transition-colors cursor-pointer">
                  U
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto border-2 border-dashed border-slate-300 bg-white min-h-[500px] rounded-xl p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}