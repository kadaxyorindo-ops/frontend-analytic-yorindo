import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CheckCheck,
  MessageSquareText,
  SmilePlus,
  Star,
} from "lucide-react";
import { api } from "@/services/api";
import { formatNumber } from "@/utils/formatters";

type FeedbackAnalyticsPayload = {
  eventId: string;
  totalResponses: number;
  commentCount: number;
  averageRatings: {
    overall: number;
    content: number;
    speaker: number;
    flow: number;
    venue: number;
    interest: number;
  };
  willJoinFuture: {
    yes: number;
    no: number;
  };
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentComments: Array<{
    id: string;
    comment: string;
    sentiment: "Positive" | "Neutral" | "Negative";
    summary: string;
    submittedAt: string | null;
  }>;
};

const BAR_COLORS = ["#2F5BFF", "#5D7FFF", "#8EA8FF", "#B9C9FF", "#D7E3FF", "#91C8A4"];

const ratingMeta: Array<{
  key: keyof FeedbackAnalyticsPayload["averageRatings"];
  label: string;
}> = [
  { key: "overall", label: "Overall Experience" },
  { key: "content", label: "Content Quality" },
  { key: "speaker", label: "Speaker" },
  { key: "flow", label: "Event Flow" },
  { key: "venue", label: "Venue" },
  { key: "interest", label: "Interest / Intent" },
];

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <div className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
          {title}
        </p>
        <p className="mt-3 text-3xl font-bold text-[#0A2647]">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#2F5BFF]">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const sentimentStyles: Record<
  FeedbackAnalyticsPayload["recentComments"][number]["sentiment"],
  string
> = {
  Positive: "bg-[#E8F7EE] text-[#166534]",
  Neutral: "bg-[#EFF4FB] text-[#34506B]",
  Negative: "bg-[#FEF2F2] text-[#991B1B]",
};

const toFriendlyErrorMessage = (message: string) => {
  const normalized = message.trim().toLowerCase();

  if (normalized === "failed to fetch" || normalized.includes("fetch")) {
    return "Backend feedback analytics belum tersambung. Pastikan server backend sedang berjalan lalu refresh halaman ini.";
  }

  return message;
};

const FeedbackAnalytics = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [analytics, setAnalytics] = useState<FeedbackAnalyticsPayload | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalytics = async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError("");

    const result = await api.get<FeedbackAnalyticsPayload>(
      `/api/v1/analytics/events/${eventId}/feedback?ts=${Date.now()}`,
    );

    setIsLoading(false);

    if (result.error || !result.data) {
      setAnalytics(null);
      setError(
        toFriendlyErrorMessage(
          result.message || "Feedback analytics tidak tersedia.",
        ),
      );
      return;
    }

    setAnalytics(result.data);
  };

  useEffect(() => {
    if (!eventId) return;
    void loadAnalytics();
  }, [eventId]);

  const ratingChartData = useMemo(() => {
    if (!analytics) return [];

    return ratingMeta.map((item) => ({
      label: item.label,
      score: analytics.averageRatings[item.key],
    }));
  }, [analytics]);

  const participationData = useMemo(() => {
    if (!analytics) return [];

    return [
      { label: "Will Join Again", total: analytics.willJoinFuture.yes },
      { label: "Not Sure / No", total: analytics.willJoinFuture.no },
    ];
  }, [analytics]);

  const sentimentData = useMemo(() => {
    if (!analytics) return [];

    return [
      { label: "Positive", total: analytics.sentimentBreakdown.positive },
      { label: "Neutral", total: analytics.sentimentBreakdown.neutral },
      { label: "Negative", total: analytics.sentimentBreakdown.negative },
    ];
  }, [analytics]);

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
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
            Feedback Analytics
          </p>
          <h1 className="text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">
            Overview
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[#5B6B7F]">
            Ringkasan rating, minat peserta untuk kembali hadir, dan komentar feedback untuk event ini. Data dimuat otomatis saat tab dibuka.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] px-6 py-5 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      {isLoading && !analytics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`feedback-skeleton-${index}`}
              className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)] animate-pulse"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : null}

      {analytics ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Responses"
              value={formatNumber(analytics.totalResponses)}
              icon={MessageSquareText}
            />
            <StatCard
              title="Average Overall"
              value={analytics.averageRatings.overall.toFixed(1)}
              icon={Star}
            />
            <StatCard
              title="Will Join Again"
              value={`${analytics.totalResponses > 0 ? Math.round((analytics.willJoinFuture.yes / analytics.totalResponses) * 100) : 0}%`}
              icon={CheckCheck}
            />
            <StatCard
              title="Comments Submitted"
              value={formatNumber(analytics.commentCount)}
              icon={SmilePlus}
            />
          </div>

          {analytics.totalResponses === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
              Belum ada feedback yang masuk untuk event ini.
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)] lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={18} className="text-[#2F5BFF]" />
                    <h2 className="text-lg font-semibold text-[#0A2647]">
                      Average Ratings
                    </h2>
                  </div>

                  <div className="mt-5 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7EEF8" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={60} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {ratingChartData.map((_, index) => (
                            <Cell key={`rating-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-6">
                  <section className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
                    <h2 className="text-lg font-semibold text-[#0A2647]">
                      Return Interest
                    </h2>
                    <div className="mt-5 space-y-3">
                      {participationData.map((item, index) => (
                        <div
                          key={item.label}
                          className="rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-[#0A2647]">{item.label}</p>
                            <p className="text-sm font-semibold text-[#0A2647]">
                              {formatNumber(item.total)}
                            </p>
                          </div>
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${analytics.totalResponses > 0 ? Math.round((item.total / analytics.totalResponses) * 100) : 0}%`,
                                backgroundColor: BAR_COLORS[index],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
                    <h2 className="text-lg font-semibold text-[#0A2647]">
                      Sentiment Snapshot
                    </h2>
                    <div className="mt-5 space-y-3">
                      {sentimentData.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] px-4 py-3"
                        >
                          <p className="font-semibold text-[#0A2647]">{item.label}</p>
                          <p className="text-sm font-semibold text-[#0A2647]">
                            {formatNumber(item.total)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <section className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
                <div className="flex items-center gap-3">
                  <MessageSquareText size={18} className="text-[#2F5BFF]" />
                  <h2 className="text-lg font-semibold text-[#0A2647]">
                    Recent Feedback Comments
                  </h2>
                </div>

                {analytics.recentComments.length === 0 ? (
                  <p className="mt-5 text-sm text-[#6B7280]">
                    Belum ada komentar tertulis dari peserta.
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {analytics.recentComments.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-[20px] border border-[#E6ECF7] bg-[#F8FAFF] p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${sentimentStyles[item.sentiment]}`}
                          >
                            {item.sentiment}
                          </span>
                          {item.summary ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4A5C74] border border-[#E5ECF6]">
                              {item.summary}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-4 text-sm leading-7 text-[#43556E]">
                          {item.comment}
                        </p>
                        <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-[#8A9AAF]">
                          {item.submittedAt
                            ? new Date(item.submittedAt).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Tanggal tidak tersedia"}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </>
      ) : null}
    </div>
  );
};

export default FeedbackAnalytics;
