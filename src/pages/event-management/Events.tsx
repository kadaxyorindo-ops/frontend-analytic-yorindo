import { useEffect, useMemo, useState } from "react";
import { Calendar, FilePlus2, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch } from "@/store/store";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { createEventRemote, deleteEventRemote, fetchEvents, updateEventRemote } from "@/store/eventSlice";
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
type SortOption =
  | "newest-created"
  | "oldest-created"
  | "event-date-newest"
  | "event-date-oldest"
  | "title-asc"
  | "title-desc";

const statusParamForTab = (tab: TabType) => {
  if (tab === "All") return undefined;
  if (tab === "Draft") return "draft";
  if (tab === "Published") return "registration";
  if (tab === "Ongoing") return "ongoing";
  return "cancelled";
};

const toBackendStatus = (value: string) => {
  if (value === "published") return "registration";
  if (value === "closed") return "cancelled";
  return value;
};

const splitDateTime = (isoValue?: string) => {
  if (!isoValue) return { date: "", time: "" };
  const dateObj = new Date(isoValue);
  if (Number.isNaN(dateObj.getTime())) {
    return { date: "", time: "" };
  }
  const pad = (num: number) => String(num).padStart(2, "0");
  return {
    date: `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
      dateObj.getDate(),
    )}`,
    time: `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`,
  };
};

const sortQueryForOption = (sortOption: SortOption) => {
  if (sortOption === "oldest-created") {
    return { sortBy: "createdAt" as const, sortOrder: "asc" as const };
  }
  if (sortOption === "event-date-newest") {
    return { sortBy: "eventDate" as const, sortOrder: "desc" as const };
  }
  if (sortOption === "event-date-oldest") {
    return { sortBy: "eventDate" as const, sortOrder: "asc" as const };
  }
  if (sortOption === "title-asc") {
    return { sortBy: "title" as const, sortOrder: "asc" as const };
  }
  if (sortOption === "title-desc") {
    return { sortBy: "title" as const, sortOrder: "desc" as const };
  }

  return { sortBy: "createdAt" as const, sortOrder: "desc" as const };
};

const Events = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { events, isLoading, pagination, error } = useEvents();
  const { isAuthenticated, isInitializing } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [sortOption, setSortOption] = useState<SortOption>("newest-created");
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [authNotice, setAuthNotice] = useState("");
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const pageLimit = 5;

  // --- State Baru buat Create Event ---
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
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
    // Fetch master data industries
    const loadIndustries = async () => {
      const result = await api.get<any>("/api/v1/industries");
      if (!result.error && result.data) {
        // Sesuaikan dengan struktur response backend lu (biasanya data.items atau data)
        const items = Array.isArray(result.data)
          ? result.data
          : (result.data as any).items || [];
        setIndustries(items);

        // Set default industry kalau ada data
        if (items.length > 0) {
          setNewEvent((prev) => ({
            ...prev,
            industryId: prev.industryId || items[0]._id,
            industryName: prev.industryName || items[0].name,
          }));
        }
      }
    };

    void loadIndustries();
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      setAuthNotice("Silakan login dulu untuk melihat data event.");
      return;
    }
    setAuthNotice("");
    const sortQuery = sortQueryForOption(sortOption);
    void dispatch(
      fetchEvents({
        page: 1,
        limit: pageLimit,
        status: statusParamForTab(activeTab),
        sortBy: sortQuery.sortBy,
        sortOrder: sortQuery.sortOrder,
      }),
    );
  }, [activeTab, dispatch, isAuthenticated, isInitializing, pageLimit, sortOption]);

  const resetForm = () => {
    setNewEvent({
      title: "",
      location: "",
      eventDate: "",
      description: "",
      eventTime: "",
      status: "draft",
      industryId: industries[0]?._id || "",
      industryName: industries[0]?.name || "General",
    });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingEventId(null);
    setCreateError("");
    setPageSuccess("");
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (event: any) => {
    const { date, time } = splitDateTime(event.event_date);
    setModalMode("edit");
    setEditingEventId(event.id);
    setCreateError("");
    setPageSuccess("");
    setNewEvent({
      title: event.title ?? "",
      location: event.location ?? "",
      eventDate: date,
      description: event.description ?? "",
      eventTime: time,
      status: event.status?.toLowerCase?.() ?? "draft",
      industryId: event.industry?.refId ?? industries[0]?._id ?? "",
      industryName: event.industry?.name ?? industries[0]?.name ?? "General",
    });
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!isAuthenticated) {
      setCreateError("Silakan login dulu untuk menghapus event.");
      return;
    }
    setPageError("");
    setPageSuccess("");
    const confirmed = window.confirm(
      `Hapus permanen event "${title}"? Data event dan registrasinya akan ikut terhapus.`,
    );
    if (!confirmed) return;
    const result = await dispatch(deleteEventRemote(eventId));
    if (deleteEventRemote.rejected.match(result)) {
      setPageError(result.payload ?? "Gagal menghapus event. Periksa izin akses.");
      return;
    }
    setPageSuccess(`Event "${title}" berhasil dihapus.`);
  };

  // Logic handle create
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.eventDate) {
      setCreateError("Isi semua field yang wajib ya!");
      return;
    }

    setIsSubmitting(true);
    setCreateError("");
    setPageError("");
    setPageSuccess("");
    setPageError("");
    setPageSuccess("");

    if (!isAuthenticated) {
      setCreateError("Silakan login dulu untuk membuat event.");
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
      };

      const result = await dispatch(createEventRemote(payload));

      if (createEventRemote.fulfilled.match(result)) {
        setShowModal(false);
        resetForm();
        setPageSuccess(`Event "${newEvent.title.trim()}" berhasil dibuat.`);
        navigate(`/events/${result.payload.event_id}`);
        return;
      }

      if (createEventRemote.rejected.match(result)) {
        setCreateError(result.payload ?? "Gagal membuat event. Periksa izin akses.");
        return;
      }

      setCreateError("Gagal membuat event. Periksa koneksi atau izin akses.");
    } catch {
      setCreateError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId) return;
    if (!newEvent.title.trim() || !newEvent.eventDate) {
      setCreateError("Isi semua field yang wajib ya!");
      return;
    }

    setIsSubmitting(true);
    setCreateError("");
    setPageError("");
    setPageSuccess("");

    try {
      const combinedDateTime = new Date(
        `${newEvent.eventDate}T${newEvent.eventTime || "00:00"}`,
      ).toISOString();
      const updatePayload = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || null,
        category: "General",
        industry: {
          refId: newEvent.industryId || null,
          name: newEvent.industryName || null,
        },
        eventDate: combinedDateTime,
        location: newEvent.location.trim() || null,
        status: toBackendStatus(newEvent.status),
      };

      const result = await dispatch(
        updateEventRemote({ eventId: editingEventId, updates: updatePayload }),
      );

      if (updateEventRemote.fulfilled.match(result)) {
        setShowModal(false);
        setEditingEventId(null);
        resetForm();
        setPageSuccess(`Event "${newEvent.title.trim()}" berhasil diperbarui.`);
        return;
      }

      if (updateEventRemote.rejected.match(result)) {
        setCreateError(result.payload ?? "Gagal memperbarui event. Periksa izin akses.");
        return;
      }

      setCreateError("Gagal memperbarui event. Periksa koneksi atau izin akses.");
    } catch {
      setCreateError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        event_date: event.event_date,
        location: event.location,
        description: event.description,
        industry: event.industry,
        progress: Math.min(Math.max(pct, 0), 100),
      };
    });
  }, [events]);

  const filteredEvents =
    activeTab === "All"
      ? mappedEvents.filter((event) => event.status !== "Closed")
      : mappedEvents.filter((event) => event.status === activeTab);

  const currentEvents = filteredEvents;

  useEffect(() => {
    setVisibleCards([]);
    const timer = setTimeout(() => {
      setVisibleCards(currentEvents.map((_, index) => index));
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, currentEvents.length]);

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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
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
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as SortOption)}
            className="rounded-[14px] border border-[#D7E1F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#43556E] outline-none transition focus:border-[#2F5BFF]"
          >
            <option value="newest-created">Terbaru dibuat</option>
            <option value="oldest-created">Terlama dibuat</option>
            <option value="event-date-newest">Tanggal event terbaru</option>
            <option value="event-date-oldest">Tanggal event terlama</option>
            <option value="title-asc">Abjad A-Z</option>
            <option value="title-desc">Abjad Z-A</option>
          </select>
        </div>

        {/* Tombol Create di Ujung Kanan */}
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-[14px] bg-[#0A2647] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#133A6F] active:scale-95"
        >
          <Plus size={18} />
          Create New Event
        </button>
      </div>

      {pageError && (
        <div className="rounded-[18px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {pageError}
        </div>
      )}

      {pageSuccess && (
        <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {pageSuccess}
        </div>
      )}

      {/* Grid Events */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-[24px] bg-slate-200" />
          ))
        ) : authNotice ? (
          <div className="col-span-full rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
            {authNotice}
          </div>
        ) : error ? (
          <div className="col-span-full rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
            {error}
          </div>
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
              <div className="flex items-start justify-between">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[event.status]}`}>
                  {event.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(event)}
                    className="rounded-full border border-[#E2E8F0] p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A2647]"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    className="rounded-full border border-[#E2E8F0] p-2 text-[#EF4444] hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
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
        <button
          disabled={(pagination.page ?? 1) <= 1 || isLoading}
          onClick={() => {
            const sortQuery = sortQueryForOption(sortOption);
            void dispatch(
              fetchEvents({
                page: Math.max((pagination.page ?? 1) - 1, 1),
                limit: pageLimit,
                status: statusParamForTab(activeTab),
                sortBy: sortQuery.sortBy,
                sortOrder: sortQuery.sortOrder,
              }),
            );
          }}
          className="rounded-xl border p-2 px-4 text-sm disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm font-medium">
          Page {pagination.page ?? 1} of {pagination.totalPages ?? 1}
        </span>
        <button
          disabled={(pagination.page ?? 1) >= (pagination.totalPages ?? 1) || isLoading}
          onClick={() => {
            const sortQuery = sortQueryForOption(sortOption);
            void dispatch(
              fetchEvents({
                page: Math.min((pagination.page ?? 1) + 1, pagination.totalPages ?? 1),
                limit: pageLimit,
                status: statusParamForTab(activeTab),
                sortBy: sortQuery.sortBy,
                sortOrder: sortQuery.sortOrder,
              }),
            );
          }}
          className="rounded-xl border p-2 px-4 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* --- MODAL CREATE EVENT --- */}
      {showModal && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#F1F5F9] p-2 text-[#0A2647]">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A2647]">
                    {modalMode === "edit" ? "Edit Event" : "Create Event"}
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    {modalMode === "edit"
                      ? "Update detail event yang dipilih."
                      : "Fill in the details for your new event."}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0A2647]">
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={modalMode === "edit" ? handleUpdateEvent : handleCreateEvent} className="p-8 space-y-5">
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
                    disabled={modalMode === "create"}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="closed">Closed</option>
                  </select>
                  {modalMode === "create" && (
                    <p className="text-xs text-[#94A3B8]">
                      Event baru otomatis dibuat sebagai draft, lalu status bisa diubah saat edit.
                    </p>
                  )}
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
                  {isSubmitting
                    ? "Processing..."
                    : modalMode === "edit"
                      ? "Save Changes"
                      : "Publish Event"}
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
