import { useEffect, useMemo, useState } from "react";
import { Calendar, FilePlus2, MapPin } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch } from "@/store/store";
import { useEvents } from "@/hooks/useEvents";
import { fetchEvents, addEvent } from "@/store/eventSlice";
import { formatDate } from "@/utils/formatters";

type EventStatus = "Published" | "Ongoing" | "Draft" | "Closed";

const statusColor: Record<EventStatus, string> = {
  Published: "bg-[#E6F9F0] text-[#22C55E]",
  Ongoing: "bg-[#EAF1FF] text-[#3B82F6]",
  Draft: "bg-[#F3F4F6] text-[#6B7280]",
  Closed: "bg-[#F3F4F6] text-[#9CA3AF]",
};

const tabs = ["All", "Draft", "Published", "Ongoing", "Closed"] as const;
type TabType = (typeof tabs)[number];

const Events = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, isLoading } = useEvents();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    void dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    setVisibleCards([]);
    const timer = setTimeout(() => {
      setVisibleCards(currentEvents.map((_, index) => index));
    }, 100);

    return () => clearTimeout(timer);
  }, [currentPage, activeTab]);

  const eventsPerPage = 9;

  const mappedEvents = useMemo(() => {
    return events.map((event) => {
      const pct = event.max_capacity > 0 ? Math.round((event.registered_count / event.max_capacity) * 100) : 0;

      const statusLabel: EventStatus =
        event.status === "published"
          ? "Published"
          : event.status === "closed"
            ? "Closed"
            : event.status === "draft"
              ? "Draft"
              : "Ongoing";

      return {
        id: event.event_id,
        title: event.title,
        status: statusLabel,
        date: formatDate(event.event_date),
        location: event.location,
        progress: Math.min(Math.max(pct, 0), 100),
      };
    });
  }, [events]);

  const filteredEvents =
    activeTab === "All" ? mappedEvents : mappedEvents.filter((event) => event.status === activeTab);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / eventsPerPage));
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);
  return (
    <div className="min-h-screen space-y-8 rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">Event Workspace</p>
          <h1 className="text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">Event Management</h1>
          <p className="max-w-2xl text-sm leading-7 text-[#5B6B7F]">
            Kelola event yang sudah dibuat, cek progres registrasi, buka detail event, dan masuk ke form builder registration langsung dari daftar event.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-[22px] border border-[#E3EAF5] bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-[#0A2647] text-white shadow-[0_10px_18px_rgba(10,38,71,0.16)]"
                : "bg-[#EDF3FF] text-[#5B6B7F] hover:bg-[#DCE7FF] hover:text-[#0A2647]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)] animate-pulse"
            >
              <div className="h-6 w-24 rounded-full bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
              <div className="mt-6 h-8 w-full rounded bg-slate-200" />
            </div>
          ))
        ) : currentEvents.length === 0 ? (
          <div className="col-span-full rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
            Belum ada event untuk ditampilkan.
          </div>
        ) : (
          currentEvents.map((event, index) => (
            <div
              key={event.id}
              className={`rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(10,38,71,0.12)] ${
                visibleCards.includes(index) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[event.status]}`}>
                {event.status}
              </span>

              <h2 className="mt-4 text-lg font-semibold text-[#0A2647]">{event.title}</h2>

              <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  {event.location}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-[#6B7280]">
                  <span>Registration</span>
                  <span>{event.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-2 rounded-full bg-[#3B82F6] transition-all duration-700"
                    style={{ width: `${event.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center justify-center rounded-[14px] border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-semibold text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:bg-[#F5F8FF]"
                >
                  View Detail
                </Link>
                <Link
                  to={`/events/${event.id}/registration-form`}
                  className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#0A2647] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(10,38,71,0.16)] transition hover:bg-[#133A6F]"
                >
                  <FilePlus2 size={16} />
                  Create Form Builder Registration
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="rounded-[12px] border border-[#D7E1F0] bg-white px-4 py-2 text-sm font-medium text-[#43556E] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .slice(Math.max(currentPage - 2, 0), Math.max(currentPage + 1, 3))
          .map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-[12px] px-4 py-2 text-sm font-semibold ${
                currentPage === page
                  ? "bg-[#0A2647] text-white"
                  : "bg-[#EAF1FF] text-[#0A2647] hover:bg-[#DCE7FF]"
              }`}
            >
              {page}
            </button>
          ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="rounded-[12px] border border-[#D7E1F0] bg-white px-4 py-2 text-sm font-medium text-[#43556E] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Events;
