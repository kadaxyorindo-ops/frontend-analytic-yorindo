import { useState } from "react";
import { Calendar, MapPin, Plus, X } from "lucide-react";

type EventStatus = "Published" | "Ongoing" | "Draft";

type Event = {
  title: string;
  status: EventStatus;
  date: string;
  location: string;
  progress: number;
};

const statuses: EventStatus[] = ["Published", "Ongoing", "Draft"];

const events: Event[] = Array.from({ length: 87 }, (_, i) => ({
  title: `Event ${i + 1}`,
  status: statuses[i % 3],
  date: "15 April 2026",
  location: "Jakarta, Indonesia",
  progress: Math.floor(Math.random() * 100),
}));

const statusColor: Record<EventStatus, string> = {
  Published: "bg-[#E6F9F0] text-[#22C55E]",
  Ongoing: "bg-[#EAF1FF] text-[#3B82F6]",
  Draft: "bg-[#F3F4F6] text-[#6B7280]",
};

const tabs = ["All", "Draft", "Published", "Ongoing"] as const;
type TabType = (typeof tabs)[number];

const Events = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [showModal, setShowModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    status: "Draft" as EventStatus,
  });

  const handleCreateEvent = () => {
    console.log(newEvent);
    setShowModal(false);
  };

  const eventsPerPage = 9;

  const filteredEvents =
    activeTab === "All"
      ? events
      : events.filter((event) => event.status === activeTab);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + eventsPerPage
  );

  const maxVisiblePages = 3;

  let startPage = Math.max(currentPage - 1, 1);
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  return (
    <div className="bg-[#F3F4F6] min-h-screen p-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0A2647]">
          Events
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#0A2647] hover:bg-[#133A6F] transition text-white px-4 py-2 rounded-[12px] shadow-[0_6px_16px_rgba(10,38,71,0.2)]"
        >
          <Plus size={16} />
          Create Event
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-[12px] text-sm transition
              ${
                activeTab === tab
                  ? "bg-[#0A2647] text-white"
                  : "bg-[#EAF1FF] text-[#5B6B7F] hover:bg-[#DCE7FF]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-6">
        {currentEvents.map((event, i) => (
          <div
            key={i}
            className="bg-[#FFFFFF] p-6 rounded-[24px] border border-[#D7E1F0]
            shadow-[0_12px_32px_rgba(10,38,71,0.08)]
            hover:shadow-[0_16px_40px_rgba(10,38,71,0.12)]
            hover:-translate-y-1 transition"
          >
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[event.status]}`}
            >
              {event.status}
            </span>

            <h2 className="mt-4 font-semibold text-lg text-[#0A2647]">
              {event.title}
            </h2>

            <div className="mt-3 space-y-2 text-sm text-[#6B7280]">
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
              {/* ======ini persentase registration===== */}
              <div className="flex justify-between text-xs mb-1">
                <span>Registration</span>
                <span>{event.progress}%</span>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${event.progress}%` }}
                />
              </div>
            </div>

            <button className="mt-6 w-full border border-[#F97316] text-[#F97316] py-2 rounded-[12px] text-sm hover:bg-[#FFF7ED] transition">
              View Analytics
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          className="px-3 py-1 border border-[#D7E1F0] rounded-[10px]"
        >
          Prev
        </button>

        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map((page) => (
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
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
              />

              <input
                placeholder="Location"
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    location: e.target.value,
                  })
                }
              />

              <select
                className="w-full border border-[#D7E1F0] rounded-[12px] px-3 py-2"
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    status: e.target.value as EventStatus,
                  })
                }
              >
                <option>Draft</option>
                <option>Published</option>
                <option>Ongoing</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-[#D7E1F0] rounded-[12px]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-[#0A2647] text-white rounded-[12px]"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;