import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
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
import { Sparkles } from "lucide-react";
import {
  getEventAnalyticsInsight,
  getEventAnalyticsOverview,
  type EventAnalyticsInsight,
  type EventAnalyticsOverview,
} from "@/services/eventWorkspaceService";
import { formatNumber, formatShortDate } from "@/utils/formatters";
import { useParams } from "react-router-dom";

const PIE_COLORS = ["#0A2647", "#2F5BFF", "#84A6FF", "#C9D7F3", "#E7EEFF"];

function SummarySkeleton() {
  return (
    <div className="rounded-[24px] border border-[#D7E1F0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F2F7FF_100%)] p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-28 rounded-full bg-slate-200" />
        <div className="h-8 w-1/2 rounded-2xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-xl bg-slate-200" />
          <div className="h-4 w-5/6 rounded-xl bg-slate-200" />
          <div className="h-4 w-4/6 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function EventAnalyticsPage() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [overview, setOverview] = useState<EventAnalyticsOverview | null>(null);
  const [insight, setInsight] = useState<EventAnalyticsInsight | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);
  const [error, setError] = useState("");
  const [insightError, setInsightError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      setIsLoadingOverview(true);
      setError("");

      const result = await getEventAnalyticsOverview(eventId);

      if (result.error || !result.data) {
        setError(result.message || "Gagal memuat event analytics.");
        setOverview(null);
        setIsLoadingOverview(false);
        return;
      }

      setOverview(result.data);
      setIsLoadingOverview(false);
    };

    void load();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const loadInsight = async () => {
      setIsLoadingInsight(true);
      setInsightError("");

      const result = await getEventAnalyticsInsight(eventId);

      if (result.error || !result.data) {
        setInsight(null);
        setInsightError(result.message || "AI summary belum tersedia.");
        setIsLoadingInsight(false);
        return;
      }

      setInsight(result.data);
      setIsLoadingInsight(false);
    };

    void loadInsight();
  }, [eventId]);

  const statusChartData = useMemo(() => {
    if (!overview) return [];

    return Object.entries(overview.statusBreakdown).map(([status, count]) => ({
      name: status.replaceAll("_", " "),
      value: count,
    }));
  }, [overview]);

  if (isLoadingOverview) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[24px] border border-[#D7E1F0] bg-white shadow-[0_12px_28px_rgba(10,38,71,0.05)]"
            />
          ))}
        </div>
        <SummarySkeleton />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
        {error || "Event analytics tidak tersedia."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Registrations",
            value: formatNumber(overview.summary.totalRegistrations),
          },
          {
            label: "Approved",
            value: formatNumber(overview.summary.totalApproved),
          },
          {
            label: "Attendance",
            value: formatNumber(overview.summary.totalAttendance),
          },
          {
            label: "Attendance Rate",
            value: `${overview.summary.attendanceRate.toFixed(1)}%`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
              {item.label}
            </p>
            <p className="mt-4 text-[2rem] font-bold tracking-[-0.04em] text-[#0A2647]">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {isLoadingInsight ? (
        <SummarySkeleton />
      ) : (
        <section className="rounded-[24px] border border-[#D7E1F0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F2F7FF_100%)] p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#0A2647]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
                AI Summary
              </p>
              <p className="text-lg font-bold text-[#0A2647]">Event analytics brief</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-[#43556E]">
            {insight?.summary || insightError || "AI summary belum tersedia."}
          </p>

          {insight?.highlights?.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {insight.highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[#DCE5F2] bg-white p-4 text-sm leading-6 text-[#43556E]"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : null}

          {insight?.recommendations?.length ? (
            <div className="mt-5 rounded-[20px] border border-[#DCE5F2] bg-white p-5">
              <p className="text-sm font-semibold text-[#0A2647]">Recommended actions</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-[#43556E]">
                {insight.recommendations.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-lg font-bold text-[#0A2647]">Registrations Over Time</p>
          <p className="mt-1 text-sm text-[#6F8098]">
            Distribusi registrasi harian untuk bulan {overview.month}.
          </p>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview.registrationsOverTime}>
                <CartesianGrid stroke="#E7EEF8" strokeDasharray="4 4" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0A2647"
                  strokeWidth={3}
                  dot={{ fill: "#2F5BFF", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-lg font-bold text-[#0A2647]">Status Breakdown</p>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={108}>
                  {statusChartData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-lg font-bold text-[#0A2647]">Top Industries</p>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.topIndustries}>
                <CartesianGrid stroke="#E7EEF8" strokeDasharray="4 4" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2F5BFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-lg font-bold text-[#0A2647]">Top Cities</p>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.topCities}>
                <CartesianGrid stroke="#E7EEF8" strokeDasharray="4 4" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0A2647" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
