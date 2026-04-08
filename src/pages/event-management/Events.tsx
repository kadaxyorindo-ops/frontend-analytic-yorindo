import { useEffect, useMemo, useState } from "react";
import { Calendar, FilePlus2, MapPin, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "@/store/store";
import { useEvents } from "@/hooks/useEvents";
import { fetchEvents } from "@/store/eventSlice";
import { formatDate } from "@/utils/formatters";
import { api } from "@/services/api";

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
  const { user } = useSelector((state: RootState) => state.auth); // Ambil user buat createdBy

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);

  // --- State Baru buat Create Event ---
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    location: "",
    eventDate: "",
    description: "",
    eventTime: "",
    status: "draft",
    industryId: "", // Simpan ID di sini
    industryName: "General", // Simpan Nama di sini
  });

  useEffect(() => {
    void dispatch(fetchEvents());
    
    // Fetch master data industries
    const loadIndustries = async () => {
      const result = await api.get<any>("/api/v1/industries");
      if (!result.error && result.data) {
        // Sesuaikan dengan struktur response backend lu (biasanya data.items atau data)
        const items = Array.isArray(result.data) ? result.data : (result.data as any).items || [];
        setIndustries(items);
        
        // Set default industry kalau ada data
        if (items.length > 0) {
          setNewEvent(prev => ({ ...prev, industryId: items[0]._id, industryName: items[0].name }));
        }
      }
    };
    
    void loadIndustries();
  }, [dispatch]);

  // Logic handle create
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.eventDate || !newEvent.location.trim()) {
      setCreateError("Isi semua field yang wajib ya!");
      return;
    }

    setIsSubmitting(true);
    setCreateError("");

    // Ambil ID secara fleksibel (antisipasi field _id dari API asli)
    const userId = user?.id || (user as any)?._id;

    // PENTING: createdBy WAJIB berupa MongoDB ObjectId (24 karakter hex)
    const isValidObjectId = /^[a-f\d]{24}$/i.test(userId || "");

    if (!userId || !isValidObjectId) {
      setCreateError(`ID User tidak valid (${userId || 'Kosong'}). Pastikan login mengembalikan MongoDB ObjectId yang benar.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const combinedDateTime = new Date(`${newEvent.eventDate}T${newEvent.eventTime || "00:00"}`).toISOString();

      // Payload disesuaikan MATI-MATIAN dengan CreateEventBodySchema di backend
      const payload = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || null,
        location: newEvent.location.trim() || null,
        eventDate: combinedDateTime,
        category: "General",
        industry: {
          refId: newEvent.industryId || null, 
          name: newEvent.industryName || null
        },
        registrationForm: { 
          fields: [], // Zod cuma minta fields: []
        }, 
        createdBy: userId,
      };

      // --- DEBUGGING: CEK PAYLOAD DI CONSOLE ---
      console.log("🚀 [DEBUG] Sending Request Body:", JSON.stringify(payload, null, 2));
      // ----------------------------------------

      const result = await api.post<any>("/api/v1/events", payload);

      if (result.error) {
        // Debugging: Munculkan detail Zod issues biar kelihatan field mana yang salah
        console.error("❌ [DEBUG] Backend/Zod Error Detail:", result.data);

        // Perbaikan handling detail error agar tidak muncul "Gagal: null"
        const detail = Array.isArray(result.data)
          ? result.data.map((err: any) => `${err.path.join(".")}: ${err.message}`).join(", ")
          : typeof result.data === 'object' && result.data !== null 
            ? JSON.stringify(result.data)
            : result.message || "Validation Error (422)";

        setCreateError(`Gagal: ${detail}`);
        return;
      } else {
        console.log("✅ [DEBUG] Success Response:", result.data);
        // BERHASIL
        setShowModal(false);
        
        // Reset form ke awal
        setNewEvent({ 
          title: "", 
          location: "", 
          eventDate: "", 
          description: "", 
          eventTime: "", 
          status: "draft", 
          industryId: industries[0]?._id || "", 
          industryName: industries[0]?.name || "General"
        });
        void dispatch(fetchEvents());
      }
    } catch (err) {
      console.error("🔥 [DEBUG] Catch Error:", err);
      setCreateError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventsPerPage = 9;

  const mappedEvents = useMemo(() => {
    return events.map((event) => {
      const pct = event.max_capacity > 0 ? Math.round((event.registered_count / event.max_capacity) * 100) : 0;

      // Karena sudah di-normalize di eventSlice, kita cukup cek status yang sudah fix
      const statusLabel: EventStatus =
        event.status === "published"
          ? "Published"
          : event.status === "closed"
          ? "Closed"
          : event.status === "draft"
          ? "Draft"
          : "Ongoing";

      return {
        id: event.event_id, // Gunakan event_id yang sudah di-map di slice
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

  useEffect(() => {
    setVisibleCards([]);
    const timer = setTimeout(() => {
      setVisibleCards(currentEvents.map((_, index) => index));
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage, activeTab, currentEvents.length]);

  return (
    <div className="min-h-screen space-y-8 rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">Event Workspace</p>
          <h1 className="text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">Event Management</h1>
          <p className="max-w-2xl text-sm leading-7 text-[#5B6B7F]">
            Kelola event yang sudah dibuat, cek progres registrasi, dan buat event baru langsung dari sini.
          </p>
        </div>
      </div>

      {/* Tabs & Create Button Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#E3EAF5] bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-3">
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

        {/* Tombol Create di Ujung Kanan */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-[14px] bg-[#0A2647] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#133A6F] active:scale-95"
        >
          <Plus size={18} />
          Create New Event
        </button>
      </div>

      {/* Grid Events */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-[24px] bg-slate-200" />
          ))
        ) : currentEvents.length === 0 ? (
          <div className="col-span-full rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
            Belum ada event untuk ditampilkan.
          </div>
        ) : (
          currentEvents.map((event, index) => (
            <div
              key={event.id}
              className={`rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-sm transition-all duration-500 ${
                visibleCards.includes(index) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[event.status]}`}>
                {event.status}
              </span>
              <h2 className="mt-4 text-lg font-semibold text-[#0A2647]">{event.title}</h2>
              <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> {event.location}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-[#6B7280]">
                  <span>Registration</span>
                  <span>{event.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div className="h-2 bg-[#3B82F6]" style={{ width: `${event.progress}%` }} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to={`/events/${event.id}`} className="flex items-center justify-center rounded-[12px] border py-2 text-sm font-semibold">
                  View Detail
                </Link>
                <Link to={`/events/${event.id}/registration-form`} className="flex items-center justify-center gap-2 rounded-[12px] bg-[#0A2647] text-white py-2 text-sm font-semibold">
                  <FilePlus2 size={16} /> Form
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (Biar Tetap Rapi) */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="rounded-xl border p-2 px-4 text-sm">Prev</button>
        <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="rounded-xl border p-2 px-4 text-sm">Next</button>
      </div>

      {/* --- MODAL CREATE EVENT --- */}
      {showModal && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#F1F5F9] p-2 text-[#0A2647]">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A2647]">Create Event</h2>
                  <p className="text-xs text-[#94A3B8]">Fill in the details for your new event.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0A2647]">
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateEvent} className="p-8 space-y-5">
              {createError && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
                  {createError}
                </div>
              )}

              {/* Event Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#43556E]">
                  <Calendar size={16} className="text-[#94A3B8]" />
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter event name"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-50 transition-all"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#43556E]">
                  <MapPin size={16} className="text-[#94A3B8]" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-all"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#43556E]">
                    <Calendar size={16} className="text-[#94A3B8]" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-all"
                    value={newEvent.eventDate}
                    onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#43556E]">
                    <div className="text-[#94A3B8]">🕒</div> {/* Atau import Clock dari lucide */}
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-all"
                    value={newEvent.eventTime}
                    onChange={(e) => setNewEvent({ ...newEvent, eventTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Status & Industry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#43556E]">
                    <div className="text-[#94A3B8]">🏷️</div>
                    Status
                  </label>
                  <select
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-all appearance-none cursor-pointer"
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#43556E]">
                    <div className="text-[#94A3B8]">🏢</div>
                    Industry
                  </label>
                  <select
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-all appearance-none cursor-pointer"
                    value={newEvent.industryId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedName = industries.find(i => i._id === selectedId)?.name || "";
                      setNewEvent({ 
                        ...newEvent, 
                        industryId: selectedId, 
                        industryName: selectedName 
                      });
                    }}
                  >
                    {industries.length > 0 ? (
                      industries.map((ind) => (
                        <option key={ind._id} value={ind._id}>{ind.name}</option>
                      ))
                    ) : (
                      <option value="">Loading industries...</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#43556E]">
                  <div className="text-[#94A3B8]">📝</div>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter event description"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] transition-all resize-none"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-6 py-3 text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#0A2647] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-[#133A6F] disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSubmitting ? "Processing..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;