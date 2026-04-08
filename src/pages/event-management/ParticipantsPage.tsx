import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import { getEventParticipants, type EventParticipantListResponse } from "@/services/eventWorkspaceService";
import { formatDate, formatNumber } from "@/utils/formatters";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "checked_in", label: "Checked In" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function ParticipantsPage() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<EventParticipantListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      const response = await getEventParticipants({
        eventId,
        page,
        limit: 10,
        search,
        status,
      });

      if (response.error || !response.data) {
        setError(response.message || "Gagal memuat participants.");
        setResult(null);
        setIsLoading(false);
        return;
      }

      setResult(response.data);
      setIsLoading(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [eventId, page, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const counters = useMemo(
    () => [
      { label: "Total", value: result?.meta.totalCount ?? 0 },
      { label: "Pending", value: result?.meta.pendingCount ?? 0 },
      { label: "Approved", value: result?.meta.approvedCount ?? 0 },
      { label: "Checked In", value: result?.meta.checkedInCount ?? 0 },
    ],
    [result],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[#D7E1F0] bg-[#F8FAFD] p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF3FF] text-[#0A2647]">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
                  Participants
                </p>
                <p className="text-lg font-bold text-[#0A2647]">
                  Daftar peserta dari database registration
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative min-w-[260px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7B8CA3]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau company..."
                className="h-12 w-full rounded-[16px] border border-[#DCE5F2] bg-white pl-11 pr-4 text-sm text-[#0A2647] outline-none transition focus:border-[#AFC4F6] focus:ring-2 focus:ring-[#DCE7FF]"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as (typeof statusOptions)[number]["value"])}
              className="h-12 rounded-[16px] border border-[#DCE5F2] bg-white px-4 text-sm font-semibold text-[#0A2647] outline-none transition focus:border-[#AFC4F6] focus:ring-2 focus:ring-[#DCE7FF]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {counters.map((counter) => (
          <div
            key={counter.label}
            className="rounded-[22px] border border-[#D7E1F0] bg-white p-5 shadow-[0_12px_28px_rgba(10,38,71,0.06)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
              {counter.label}
            </p>
            <p className="mt-3 text-[1.9rem] font-bold tracking-[-0.04em] text-[#0A2647]">
              {formatNumber(counter.value)}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-[18px] bg-[#F4F7FC]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[20px] border border-dashed border-[#D7E1F0] bg-[#F8FAFD] px-6 py-10 text-center text-sm text-[#6B7280]">
            {error}
          </div>
        ) : result?.items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5ECF6] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                    <th className="px-3 py-3">Participant</th>
                    <th className="px-3 py-3">Company</th>
                    <th className="px-3 py-3">Industry</th>
                    <th className="px-3 py-3">Position</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.registrationId} className="border-b border-[#EEF3FA] last:border-b-0">
                      <td className="px-3 py-4 align-top">
                        <p className="font-semibold text-[#0A2647]">{item.fullName}</p>
                        <p className="mt-1 text-sm text-[#6F8098]">
                          {item.companyEmail || item.personalEmail || "-"}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-sm text-[#43556E]">{item.companyName}</td>
                      <td className="px-3 py-4 text-sm text-[#43556E]">{item.industryName}</td>
                      <td className="px-3 py-4 text-sm text-[#43556E]">{item.jobTitleName}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#0A2647]">
                          {item.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-[#43556E]">
                        {item.createdAt ? formatDate(item.createdAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF3FA] pt-5">
              <p className="text-sm text-[#6F8098]">
                Menampilkan {result.items.length} dari {formatNumber(result.pagination.total)} participants
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="rounded-[12px] border border-[#D7E1F0] bg-white px-4 py-2 text-sm font-semibold text-[#43556E] transition hover:border-[#C9D7F3] hover:text-[#0A2647] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-2 text-sm font-semibold text-[#0A2647]">
                  {page} / {Math.max(result.pagination.totalPages, 1)}
                </span>
                <button
                  type="button"
                  disabled={page >= result.pagination.totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(result.pagination.totalPages, value + 1))
                  }
                  className="rounded-[12px] border border-[#D7E1F0] bg-white px-4 py-2 text-sm font-semibold text-[#43556E] transition hover:border-[#C9D7F3] hover:text-[#0A2647] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#D7E1F0] bg-[#F8FAFD] px-6 py-10 text-center text-sm text-[#6B7280]">
            Belum ada participant untuk filter ini.
          </div>
        )}
      </section>
    </div>
  );
}
