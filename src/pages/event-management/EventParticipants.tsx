import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "@/services/api";
import { formatDate } from "@/utils/formatters";

type RegistrationParticipant = {
  _id: string;
  companyEmail?: string;
  personalEmail?: string;
  fullName?: string;
};

type EventRegistrationItem = {
  _id: string;
  participantId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected" | "checked_in" | string;
  participant?: RegistrationParticipant;
  companySnapshot?: {
    companyId?: string | null;
    name?: string | null;
  };
  jobTitleSnapshot?: {
    refId?: string | null;
    name?: string | null;
  };
  approval?: {
    approvedAt?: string;
    approvedBy?: string;
  };
  checkIn?: {
    checkedInAt?: string;
    checkedInBy?: string;
    isAttended?: boolean;
    scanMethod?: string;
  };
};

const getStatusBadge = (status: EventRegistrationItem["status"]) => {
  const normalized = status?.toLowerCase();
  if (normalized === "checked_in") {
    return { label: "Checked-in", className: "bg-[#E6F9F0] text-[#22C55E]" };
  }
  if (normalized === "approved") {
    return { label: "Approved", className: "bg-[#EAF1FF] text-[#3B82F6]" };
  }
  if (normalized === "rejected") {
    return { label: "Rejected", className: "bg-[#FEF2F2] text-[#EF4444]" };
  }
  if (normalized === "pending") {
    return { label: "Pending", className: "bg-[#FFF7ED] text-[#F59E0B]" };
  }
  return { label: status ?? "-", className: "bg-[#F3F4F6] text-[#6B7280]" };
};

const EventParticipants = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<EventRegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const loadRegistrations = async () => {
      setIsLoading(true);
      setError("");

      const cacheBuster = `ts=${Date.now()}`;
      const result = await api.get<{ items: EventRegistrationItem[] }>(
        `/api/v1/events/${eventId}/registrations?${cacheBuster}`,
      );

      setIsLoading(false);

      if (result.error || !result.data) {
        setError(result.message);
        setItems([]);
        return;
      }

      setItems(result.data.items ?? []);
    };

    void loadRegistrations();
  }, [eventId]);

  const filtered = useMemo(() => {
    if (!eventId) return [];
    const haystackSearch = search.trim().toLowerCase();
    const scoped = items;
    if (!haystackSearch) return scoped;

    return scoped.filter((registration) => {
      const participant = registration.participant;
      const haystack = [
        participant?.fullName,
        participant?.companyEmail,
        participant?.personalEmail,
        registration.companySnapshot?.name,
        registration.jobTitleSnapshot?.name,
        registration.status,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(haystackSearch);
    });
  }, [eventId, items, search]);

  const counts = useMemo(() => {
    return filtered.reduce(
      (acc, registration) => {
        const normalized = registration.status?.toLowerCase();
        if (normalized === "pending") acc.pending += 1;
        else if (normalized === "approved") acc.approved += 1;
        else if (normalized === "rejected") acc.rejected += 1;
        else if (normalized === "checked_in") acc.checked_in += 1;
        else acc.other += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, checked_in: 0, other: 0 },
    );
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
              Participants
            </p>
            <h1 className="text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">
              Daftar Participant
            </h1>
            <p className="text-sm leading-7 text-[#5B6B7F]">
              Total: <span className="font-semibold text-[#0A2647]">{filtered.length}</span>{" "}
              <span className="text-[#94A3B8]">
                • Pending {counts.pending} • Approved {counts.approved} • Checked-in{" "}
                {counts.checked_in}
              </span>
            </p>
          </div>

          <div className="w-full max-w-md rounded-[20px] border border-[#E3EAF5] bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
              Search
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-[16px] border border-[#DCE5F2] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <Search size={16} className="text-[#7B8CA3]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, company, email, industri…"
                className="w-full bg-transparent text-sm text-[#0A2647] outline-none placeholder:text-[#94A3B8]"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] px-6 py-5 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[24px] border border-[#D7E1F0] bg-white shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F8FAFD] text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Company Email</th>
                <th className="px-6 py-4">Personal Email</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF7]">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-28 rounded bg-slate-200" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-44 rounded bg-slate-200" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-44 rounded bg-slate-200" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-36 rounded bg-slate-200" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 rounded bg-slate-200" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-28 rounded-full bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#6B7280]">
                    Tidak ada participant untuk event ini.
                  </td>
                </tr>
              ) : (
                filtered.map((registration) => {
                  const participant = registration.participant;
                  const { label, className } = getStatusBadge(registration.status);

                  return (
                    <tr key={registration._id} className="hover:bg-[#F8FAFF]">
                      <td className="px-6 py-4 font-semibold text-[#0A2647]">
                        {participant?.fullName ?? "-"}
                        <div className="mt-1 text-xs font-medium text-[#7B8CA3]">
                          ID: {registration.participantId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#0A2647]">{participant?.companyEmail ?? "-"}</td>
                      <td className="px-6 py-4 text-[#0A2647]">{participant?.personalEmail ?? "-"}</td>
                      <td className="px-6 py-4 text-[#0A2647]">
                        {registration.companySnapshot?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-[#0A2647]">
                        {registration.jobTitleSnapshot?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-[#0A2647]">
                        {registration.createdAt ? formatDate(registration.createdAt) : "-"}
                        {registration.checkIn?.checkedInAt ? (
                          <div className="mt-1 text-xs text-[#7B8CA3]">
                            Check-in: {formatDate(registration.checkIn.checkedInAt)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventParticipants;
