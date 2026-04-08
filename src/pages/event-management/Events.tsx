import { useMemo, useState, useEffect } from "react";
import { Calendar, MapPin, Plus, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch } from "@/store/store";
import { useEvents } from "@/hooks/useEvents";
import { fetchEvents, addEvent } from "@/store/eventSlice";
import { formatDate } from "@/utils/formatters";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const { events, isLoading } = useEvents();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [showModal, setShowModal] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [newEvent, setNewEvent] = useState({
    title: "",
    eventDate: "",
    location: "",
    industryName: "",
    industryRefId: "",
    description: "",
  });

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.eventDate || !newEvent.location.trim()) {
      setCreateError("Isi semua field yang wajib ya!");
      return;
    }

    if (!user?.id) {
      setCreateError("Sesi login berakhir. Silakan login ulang.");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      // 1. Payload sesuai saran Backend (Zod Schema)
      const payload = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || null,
        location: newEvent.location.trim(),
        eventDate: new Date(newEvent.eventDate).toISOString(),
        status: "draft", 
        category: "General",
        industry: {
          refId: newEvent.industryRefId.trim() || null, 
          name: newEvent.industryName.trim() || null, 
        },
        createdBy: user?.id,
      };

      const result = await api.post<any>("/api/v1/events", payload);

      if (result.error) {
        setCreateError(`Gagal: ${result.message}`);
        setIsCreating(false);
        return;
      }

      if (result.data) {
        const rawData = result.data;
        // 2. Mapping agar sesuai interface Event di Redux
        const normalizedNewEvent = {
          event_id: rawData._id,
          title: rawData.title,
          event_date: rawData.event_date || rawData.eventDate,
          location: typeof rawData.location === 'string' ? rawData.location : rawData.location?.name,
          status: "draft",
          exhibitor_id: rawData.exhibitor_id ?? "super_admin",
          description: rawData.description ?? "",
          max_capacity: rawData.max_capacity ?? 0,
          registered_count: 0,
        };

        dispatch(addEvent(normalizedNewEvent as any));
      }

      // 3. Reset UI
      setIsCreating(false);
      setShowModal(false);
      setNewEvent({ title: "", eventDate: "", location: "", industryName: "", industryRefId: "", description: "" });
      alert("Event berhasil dibuat! 🚀"); // Pindahkan alert ke sini
    } catch (err) {
      setCreateError("Terjadi kesalahan sistem.");
      setIsCreating(false);
    }
  };

  useEffect(() => {
    void dispatch(fetchEvents());
  }, [dispatch]);

  const eventsPerPage = 9;

  const mappedEvents = useMemo(() => {
    return events.map((event) => {
      const pct =
        event.max_capacity > 0
          ? Math.round((event.registered_count / event.max_capacity) * 100)
          : 0;

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
    activeTab === "All"
      ? mappedEvents
      : mappedEvents.filter((event) => event.status === activeTab);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + eventsPerPage
  );

  // ✅ SCROLL ANIMATION EFFECT
  useEffect(() => {
    setVisibleCards([]);
    const timer = setTimeout(() => {
      setVisibleCards(currentEvents.map((_, i) => i));
    }, 100);

    return () => clearTimeout(timer);
  }, [currentPage, activeTab]);

  return (
    <div className="bg-[#F3F4F6] min-h-screen px-6 py-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[#0A2647]">
          Events
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#0A2647] hover:bg-[#133A6F] transition text-white px-5 py-2.5 rounded-[12px] shadow-[0_6px_16px_rgba(10,38,71,0.2)]"
        >
          <Plus size={16} />
          Create Event
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-[12px] text-sm transition
              ${
                activeTab === tab
                  ? "bg-[#0A2647] text-white shadow"
                  : "bg-[#EAF1FF] text-[#5B6B7F] hover:bg-[#DCE7FF]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-[#FFFFFF] p-6 rounded-[24px] border border-[#D7E1F0] shadow-[0_12px_32px_rgba(10,38,71,0.08)] animate-pulse"
            >
              <div className="h-6 w-24 rounded-full bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 bg-slate-200 rounded" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
              </div>
              <div className="mt-6 h-8 w-full bg-slate-200 rounded" />
            </div>
          ))
        ) : currentEvents.length === 0 ? (
          <div className="col-span-full rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
            Belum ada event untuk ditampilkan.
          </div>
        ) : (
          currentEvents.map((event, i) => (
          <div
            key={event.id}
            className={`bg-[#FFFFFF] p-6 rounded-[24px] border border-[#D7E1F0]
            shadow-[0_12px_32px_rgba(10,38,71,0.08)]
            transition-all duration-500
            hover:shadow-[0_16px_40px_rgba(10,38,71,0.12)]
            hover:-translate-y-1
            ${
              visibleCards.includes(i)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[event.status]}`}
            >
              {event.status}
            </span>

            <h2 className="mt-4 font-semibold text-lg text-[#0A2647]">
              {event.title}
            </h2>

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

            {/* PROGRESS */}
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1 text-[#6B7280]">
                <span>Registration</span>
                <span>{event.progress}%</span>
              </div>

              <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3B82F6] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${event.progress}%` }}
                />
              </div>
            </div>

            <Link
              to={`/events/${event.id}`}
              className="mt-6 block w-full border border-[#F97316] text-[#F97316] py-2 rounded-[12px] text-sm hover:bg-[#FFF7ED] transition text-center"
            >
              Detail Event
            </Link>
          </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          className="px-3 py-1 border border-[#D7E1F0] rounded-[10px]"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(currentPage - 2, currentPage + 1)
          .map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-[10px]
                ${
                  currentPage === page
                    ? "bg-[#0A2647] text-white"
                    : "bg-[#EAF1FF] text-[#0A2647]"
                }`}
            >
              {page}
            </button>
          ))}

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, totalPages)
            )
          }
          className="px-3 py-1 border border-[#D7E1F0] rounded-[10px]"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="w-full max-w-lg rounded-[24px] border border-[#D7E1F0] bg-[#FFFFFF] p-6 shadow-[0_12px_32px_rgba(10,38,71,0.2)] relative">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#7B8CA3]"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-[#0A2647] mb-4">
              Create New Event
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(event) =>
                  setNewEvent((current) => ({ ...current, title: event.target.value }))
                }
                disabled={isCreating}
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
              />

              <input
                type="datetime-local"
                value={newEvent.eventDate}
                onChange={(event) =>
                  setNewEvent((current) => ({ ...current, eventDate: event.target.value }))
                }
                disabled={isCreating}
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
              />

              <input
                placeholder="Location"
                value={newEvent.location}
                onChange={(event) =>
                  setNewEvent((current) => ({ ...current, location: event.target.value }))
                }
                disabled={isCreating}
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
              />

              <input
                placeholder="Industry Name (opsional)"
                value={newEvent.industryName}
                onChange={(event) =>
                  setNewEvent((current) => ({ ...current, industryName: event.target.value }))
                }
                disabled={isCreating}
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
              />
              <input
                placeholder="Industry Ref ID (opsional)"
                value={newEvent.industryRefId}
                onChange={(event) =>
                  setNewEvent((current) => ({ ...current, industryRefId: event.target.value }))
                }
                disabled={isCreating}
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
              />
            </div>
            <textarea
              placeholder="Event Description (opsional)"
              value={newEvent.description}
              onChange={(event) =>
                setNewEvent((current) => ({ ...current, description: event.target.value }))
              }
              disabled={isCreating}
              rows={4} // Tinggi awal box (sekitar 4 baris)
              className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A2647] placeholder:text-[#7B8CA3] text-sm"
            />

            {createError ? (
              <p className="mt-4 text-sm text-red-600">{createError}</p>
            ) : null}
            {isCreating ? (
              <p className="mt-3 text-sm text-[#6B7280]">Menyimpan event...</p>
            ) : null}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-[#D7E1F0] rounded-[12px]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateEvent}
                disabled={isCreating}
                className="px-4 py-2 bg-[#0A2647] text-white rounded-[12px] disabled:opacity-60"
              >
                {isCreating ? "Saving..." : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
