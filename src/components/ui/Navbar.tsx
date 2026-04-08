import {
  ArrowLeft,
  CircleUserRound,
  LogOut,
  PanelLeft,
  Search,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type NavbarProps = {
  backTo?: {
    to: string;
    label?: string;
  };
  onToggleSidebar?: () => void;
};

const Navbar = ({ backTo, onToggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name ?? "Guest";
  const roleLabel =
    user?.role === "super_admin"
      ? "Super Admin"
      : user?.role === "event_operator"
        ? "Event Operator"
        : user?.role === "communication_operator"
          ? "Communication Operator"
          : user?.role === "survey_analyst"
            ? "Survey Analyst"
            : "Visitor";

  return (
    <header className="sticky top-0 z-30 border-b border-[#D7E1F0] bg-white/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          {onToggleSidebar ? (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE5F2] bg-white text-[#5B6B7F] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
              title="Toggle sidebar"
            >
              <PanelLeft size={18} />
            </button>
          ) : null}
          {backTo ? (
            <Link
              to={backTo.to}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE5F2] bg-white text-[#5B6B7F] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
              title={backTo.label ?? "Back"}
            >
              <ArrowLeft size={18} />
            </Link>
          ) : null}
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A2647] text-sm font-bold text-white shadow-[0_10px_22px_rgba(10,38,71,0.18)]">
            <CircleUserRound size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-[#0A2647]">Yorindo EMS</p>
            <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              Yorindo EMS
            </p>
          </div>
        </div>

        <div className="hidden text-center text-sm font-bold uppercase tracking-[0.22em] text-[#0A2647] md:block">
          Management Event
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE5F2] bg-white text-[#5B6B7F] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
            title="Search"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE5F2] bg-white text-[#5B6B7F] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-[#DCE5F2] bg-white px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CBD5E1] text-sm font-semibold text-white">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden text-sm leading-tight sm:block">
              <div className="font-semibold text-[#0A2647]">{displayName}</div>
              <div className="text-[#7B8CA3]">{roleLabel}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE5F2] bg-white text-[#5B6B7F] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
