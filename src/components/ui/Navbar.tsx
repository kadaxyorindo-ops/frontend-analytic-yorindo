import {
  ArrowLeft,
} from "lucide-react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type NavbarProps = {
  backTo?: {
    to: string;
    label?: string;
  };
  onToggleSidebar?: () => void;
};

const Navbar = ({ backTo }: NavbarProps) => {
  const location = useLocation();
  const { user } = useAuth();
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

  const pageTitle =
    (matchPath("/dashboard", location.pathname) && "Dashboard") ||
    (matchPath("/events", location.pathname) && "Event Management") ||
    (matchPath("/events/:eventId", location.pathname) && "Event Detail") ||
    (matchPath("/events/:eventId/participants", location.pathname) && "Participants") ||
    (matchPath("/events/:eventId/analytics", location.pathname) && "Event Analytics") ||
    (matchPath("/events/:eventId/survey-analytics", location.pathname) && "Survey Analytics") ||
    (matchPath("/events/:eventId/feedback-analytics", location.pathname) &&
      "Feedback Analytics") ||
    (matchPath("/events/:eventId/registration-form", location.pathname) &&
      "Registration Form Builder") ||
    (matchPath("/events/:eventId/survey-form", location.pathname) && "Survey Form") ||
    "Yorindo EMS";

  return (
    <header className="sticky top-0 z-30 border-b border-[#D7E1F0] bg-white/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          {backTo ? (
            <Link
              to={backTo.to}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE5F2] bg-white text-[#5B6B7F] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
              title={backTo.label ?? "Back"}
            >
              <ArrowLeft size={18} />
            </Link>
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-[1.25rem] font-bold tracking-[-0.03em] text-[#0A2647]">
              {pageTitle}
            </p>
            <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              Yorindo EMS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#DCE5F2] bg-white px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CBD5E1] text-sm font-semibold text-white">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden text-sm leading-tight sm:block">
              <div className="font-semibold text-[#0A2647]">{displayName}</div>
              <div className="text-[#7B8CA3]">{roleLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
