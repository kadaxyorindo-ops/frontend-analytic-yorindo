import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BarChart3, RefreshCw, Sparkles } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/services/api";
import { formatNumber, formatShortDate } from "@/utils/formatters";

type AnalyticsOverview = {
  eventId: string;
  month: string;
  summary: {
    eventId: string;
    totalInvitations: number;
    totalRegistrations: number;
    totalApproved: number;
    totalAttendance: number;
    attendanceRate: number;
  };
  statusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
    checked_in: number;
  };
  registrationsOverTime: Array<{ date: string; count: number }>;
  topIndustries: Array<{ name: string; count: number }>;
  topCities: Array<{ name: string; count: number }>;
};

type AnalyticsInsights = {
  summary: string;
  highlights: string[];
  recommendations: string[];
};

type CachedInsights = {
  cachedAt: string;
  data: AnalyticsInsights;
};

const formatMonthLabel = (month: string) => {
  const date = new Date(`${month}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const COLORS = ["#F59E0B", "#22C55E", "#EF4444", "#3B82F6"];

const getInsightsCacheKey = (eventId: string) => `ems_event_insights_${eventId}`;

const readCachedInsights = (eventId: string): CachedInsights | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(getInsightsCacheKey(eventId));
    if (!raw) return null;
    return JSON.parse(raw) as CachedInsights;
  } catch {
    return null;
  }
};

const writeCachedInsights = (eventId: string, payload: CachedInsights) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(getInsightsCacheKey(eventId), JSON.stringify(payload));
  } catch {
    // ignore cache errors
  }
};

const EventAnalytics = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewError, setOverviewError] = useState("");
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [insightsCachedAt, setInsightsCachedAt] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const loadOverview = async () => {
      setIsLoadingOverview(true);
      setOverviewError("");

      const cacheBuster = `ts=${Date.now()}`;
      const result = await api.get<AnalyticsOverview>(
        `/api/v1/analytics/events/${eventId}/overview?${cacheBuster}`,
      );

      setIsLoadingOverview(false);

      if (result.error) {
        setOverviewError(result.message);
        setOverview(null);
        return;
      }

      setOverview(result.data ?? null);
    };

    void loadOverview();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    const cached = readCachedInsights(eventId);
    setInsights(cached?.data ?? null);
    setInsightsCachedAt(cached?.cachedAt ?? null);
    setInsightsError("");
  }, [eventId]);

  const refreshInsights = async () => {
    if (!eventId) return;

    setIsLoadingInsights(true);
    setInsightsError("");

    const cacheBuster = `ts=${Date.now()}`;
    const result = await api.get<AnalyticsInsights>(
      `/api/v1/analytics/events/${eventId}/insights?${cacheBuster}`,
    );

    setIsLoadingInsights(false);

    if (result.error) {
      setInsightsError(result.message);
      return;
    }

    if (!result.data) {
      setInsights(null);
      setInsightsCachedAt(null);
      return;
    }

    setInsights(result.data);
    const cachedAt = new Date().toISOString();
    setInsightsCachedAt(cachedAt);
    writeCachedInsights(eventId, { cachedAt, data: result.data });
  };

  const statusData = useMemo(() => {
    const breakdown = overview?.statusBreakdown;
    if (!breakdown) return [];
    return [
      { name: "Pending", value: breakdown.pending },
      { name: "Approved", value: breakdown.approved },
      { name: "Rejected", value: breakdown.rejected },
      { name: "Checked-in", value: breakdown.checked_in },
    ];
  }, [overview?.statusBreakdown]);

  const trendData = useMemo(() => {
    return (overview?.registrationsOverTime ?? []).map((item) => ({
      ...item,
      label: formatShortDate(item.date),
    }));
  }, [overview?.registrationsOverTime]);

  const maxIndustry = Math.max(1, ...(overview?.topIndustries ?? []).map((item) => item.count));
  const maxCity = Math.max(1, ...(overview?.topCities ?? []).map((item) => item.count));

  if (!eventId) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#D7E1F0] bg-white px-6 py-10 text-center text-sm text-[#6B7280]">
        Event ID tidak ditemukan di URL.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
              Event Analytics
            </p>
            <h1 className="text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">
              Overview
            </h1>
            <p className="text-sm leading-7 text-[#5B6B7F]">
              {overview?.month ? `Bulan: ${formatMonthLabel(overview.month)}` : "Ringkasan performa event."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A2647] text-white shadow-[0_10px_22px_rgba(10,38,71,0.18)]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0A2647]">AI Insights</h2>
              <p className="text-xs text-[#7B8CA3]">
                Ringkasan cepat + rekomendasi
                {insightsCachedAt ? (
                  <span className="text-[#94A3B8]"> • cached</span>
                ) : null}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refreshInsights()}
            disabled={isLoadingInsights}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-semibold text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh insights"
          >
            <RefreshCw size={16} className={isLoadingInsights ? "animate-spin" : ""} />
            {insights ? "Refresh" : "Load"}
          </button>
        </div>

        {insightsError ? (
          <div className="mt-5 rounded-[18px] border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-4 text-sm text-[#991B1B]">
            {insightsError}
          </div>
        ) : null}

        {isLoadingInsights ? (
          <div className="mt-5 space-y-4 animate-pulse">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-5/6 rounded bg-slate-200" />
                  <div className="h-3 w-4/6 rounded bg-slate-200" />
                  <div className="h-3 w-3/6 rounded bg-slate-200" />
                </div>
              </div>
              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <div className="h-3 w-40 rounded bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-5/6 rounded bg-slate-200" />
                  <div className="h-3 w-4/6 rounded bg-slate-200" />
                  <div className="h-3 w-3/6 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        ) : insights ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm leading-7 text-[#5B6B7F]">{insights.summary}</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <h3 className="text-sm font-semibold text-[#0A2647]">Highlights</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#5B6B7F]">
                  {insights.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <h3 className="text-sm font-semibold text-[#0A2647]">Recommendations</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#5B6B7F]">
                  {insights.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-[#6B7280]">
            Klik <span className="font-semibold text-[#0A2647]">Load</span> untuk mengambil AI insights.
          </p>
        )}
      </div>

      {overviewError ? (
        <div className="rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] px-6 py-5 text-sm text-[#991B1B]">
          {overviewError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {isLoadingOverview || !overview ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`summary-skeleton-${index}`}
              className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)] animate-pulse"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-2/3 rounded bg-slate-200" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
                Invitations
              </p>
              <p className="mt-3 text-3xl font-bold text-[#0A2647]">
                {formatNumber(overview.summary.totalInvitations)}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
                Registrations
              </p>
              <p className="mt-3 text-3xl font-bold text-[#0A2647]">
                {formatNumber(overview.summary.totalRegistrations)}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
                Approved
              </p>
              <p className="mt-3 text-3xl font-bold text-[#0A2647]">
                {formatNumber(overview.summary.totalApproved)}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
                Attendance
              </p>
              <p className="mt-3 text-3xl font-bold text-[#0A2647]">
                {formatNumber(overview.summary.totalAttendance)}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
                Attendance Rate
              </p>
              <p className="mt-3 text-3xl font-bold text-[#0A2647]">
                {overview.summary.attendanceRate.toFixed(1)}%
              </p>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)] lg:col-span-2">
          <div className="flex items-center gap-3">
            <BarChart3 size={18} className="text-[#2F5BFF]" />
            <h2 className="text-lg font-semibold text-[#0A2647]">Registrations Over Time</h2>
          </div>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={4} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Registrations" stroke="#2F5BFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
          <h2 className="text-lg font-semibold text-[#0A2647]">Status Breakdown</h2>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
          <h2 className="text-lg font-semibold text-[#0A2647]">Top Industries</h2>
          <div className="mt-5 space-y-3">
            {(overview?.topIndustries ?? []).length === 0 ? (
              <p className="text-sm text-[#6B7280]">Belum ada data.</p>
            ) : (
              (overview?.topIndustries ?? []).map((item) => (
                <div key={item.name} className="rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#0A2647]">{item.name}</p>
                    <p className="text-sm font-semibold text-[#0A2647]">{formatNumber(item.count)}</p>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-2 rounded-full bg-[#2F5BFF]"
                      style={{ width: `${Math.round((item.count / maxIndustry) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
          <h2 className="text-lg font-semibold text-[#0A2647]">Top Cities</h2>
          <div className="mt-5 space-y-3">
            {(overview?.topCities ?? []).length === 0 ? (
              <p className="text-sm text-[#6B7280]">Belum ada data.</p>
            ) : (
              (overview?.topCities ?? []).map((item) => (
                <div key={item.name} className="rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#0A2647]">{item.name}</p>
                    <p className="text-sm font-semibold text-[#0A2647]">{formatNumber(item.count)}</p>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-2 rounded-full bg-[#22C55E]"
                      style={{ width: `${Math.round((item.count / maxCity) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
