import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Info,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { api } from "@/services/api";

// --- Types Based on Backend Reference ---
interface SurveyAnalyticsItem {
  type: "chart" | "text_list";
  data: Record<string, number> | string[];
}

interface EventSurveyAnalyticsResult {
  eventId: string;
  totalDataAnalyzed: number;
  analytics: Record<string, SurveyAnalyticsItem>;
}

type SurveyInsightContent = {
  summary: string;
  keyFindings: string[];
  exhibitorActions: string[];
  opportunityWatchout: string;
};

interface EventSurveyInsightResult {
  eventId?: string;
  insight: SurveyInsightContent | string;
  totalResponses?: number;
}

type CachedInsight = {
  cachedAt: string;
  data: EventSurveyInsightResult;
};

const DEFAULT_VISIBLE_QUESTIONS = 6;
const TEXT_PREVIEW_LIMIT = 20;

const normalizeInsightText = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const extractBulletItems = (lines: string[]) => {
  const items: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(\*|-|•|\d+\.)\s+(.*)$/);
    if (match?.[2]) {
      items.push(match[2].trim());
    } else {
      items.push(line);
    }
  }
  return items;
};

const parseInsightStringToContent = (value: string): SurveyInsightContent => {
  const cleaned = normalizeInsightText(value)
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/[ \t]*#+[ \t]*/g, "")
    .trim();

  const lines = cleaned.split("\n");

  const buckets: Record<keyof SurveyInsightContent, string[]> = {
    summary: [],
    keyFindings: [],
    exhibitorActions: [],
    opportunityWatchout: [],
  };

  const headingMatchers: Array<{
    key: keyof SurveyInsightContent;
    match: (line: string) => boolean;
  }> = [
    { key: "summary", match: (line) => /^(ringkasan|summary)\b/i.test(line) },
    { key: "keyFindings", match: (line) => /^(temuan utama|key findings|highlights)\b/i.test(line) },
    { key: "exhibitorActions", match: (line) => /^(aksi( untuk)? exhibitor|exhibitor actions|rekomendasi)\b/i.test(line) },
    { key: "opportunityWatchout", match: (line) => /^(peluang|waspada|opportunity\s*\/?\s*watchout)\b/i.test(line) },
  ];

  let currentKey: keyof SurveyInsightContent | null = null;
  const preamble: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = headingMatchers.find((matcher) => matcher.match(line.replace(/:$/, "")));
    if (heading) {
      currentKey = heading.key;
      continue;
    }

    if (!currentKey) {
      preamble.push(rawLine);
      continue;
    }

    buckets[currentKey].push(rawLine);
  }

  const preambleText = normalizeInsightText(preamble.join("\n"));
  const summaryText = normalizeInsightText(buckets.summary.join("\n"));

  const fallbackParagraphs = preambleText ? preambleText.split("\n\n") : [];

  const summary = summaryText || fallbackParagraphs[0] || "Ringkasan belum tersedia.";
  const remainder = fallbackParagraphs.slice(1).join("\n\n");

  const keyFindingsRaw = buckets.keyFindings.length ? buckets.keyFindings : remainder ? remainder.split("\n") : [];
  const exhibitorActionsRaw = buckets.exhibitorActions.length ? buckets.exhibitorActions : [];

  const keyFindings = extractBulletItems(keyFindingsRaw).filter(Boolean).slice(0, 8);
  const exhibitorActions = extractBulletItems(exhibitorActionsRaw).filter(Boolean).slice(0, 8);

  const opportunityWatchout =
    normalizeInsightText(buckets.opportunityWatchout.join("\n")) ||
    (fallbackParagraphs.length > 2 ? fallbackParagraphs.slice(2).join("\n\n") : "");

  return {
    summary,
    keyFindings,
    exhibitorActions,
    opportunityWatchout: opportunityWatchout || "",
  };
};

// --- Components ---

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-[24px] p-6 h-64 shadow-sm border border-neutral-100" />
);

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-neutral-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-neutral-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-[#0A2647] mt-1">{value}</p>
    </div>
    <div className="p-3 bg-[#EAF1FF] rounded-2xl text-[#2F5BFF]">
      <Icon size={24} />
    </div>
  </div>
);

const formatChartData = (data: Record<string, number>) => {
  return Object.entries(data).map(([label, total]) => ({ label, total }));
};

const getInsightCacheKey = (eventId: string) => `ems_survey_insights_${eventId}`;

const readCachedInsight = (eventId: string): CachedInsight | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(getInsightCacheKey(eventId));
    if (!raw) return null;
    return JSON.parse(raw) as CachedInsight;
  } catch {
    return null;
  }
};

const writeCachedInsight = (eventId: string, payload: CachedInsight) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(getInsightCacheKey(eventId), JSON.stringify(payload));
  } catch {
    // ignore cache errors
  }
};

const SurveyAnalyticsDashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [analyticsData, setAnalyticsData] = useState<EventSurveyAnalyticsResult | null>(null);
  const [insightData, setInsightData] = useState<EventSurveyInsightResult | null>(null);

  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [insightError, setInsightError] = useState("");
  const [insightCachedAt, setInsightCachedAt] = useState<string | null>(null);

  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_QUESTIONS);
  const [expandedResponses, setExpandedResponses] = useState<Record<string, boolean>>({});

  const insightControllerRef = useRef<AbortController | null>(null);
  const insightRequestIdRef = useRef(0);

  useEffect(() => {
    if (!eventId) {
      setIsLoadingAnalytics(false);
      setAnalyticsData(null);
      setInsightData(null);
      setInsightCachedAt(null);
      setInsightError("");
      setIsLoadingInsight(false);
      setError(null);
      return;
    }
    setVisibleCount(DEFAULT_VISIBLE_QUESTIONS);
    setExpandedResponses({});
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const controller = new AbortController();

    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setError(null);

      try {
        // Prefix: /survey-analytics, Route: /events/:eventId
        const analyticsUrl = `/api/v1/survey-analytics/events/${eventId}`;
        const result = await api.get<EventSurveyAnalyticsResult>(analyticsUrl, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (result.error || !result.data) {
          setAnalyticsData(null);
          setError(
            result.status === 404
              ? "Endpoint Analytics tidak ditemukan (404)."
              : result.message || "Gagal memuat survey analytics.",
          );
          return;
        }

        setAnalyticsData(result.data);
      } catch {
        if (controller.signal.aborted) return;
        setAnalyticsData(null);
        setError("Terjadi kesalahan sistem saat mengambil data.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingAnalytics(false);
        }
      }
    };

    void loadAnalytics();

    return () => controller.abort();
  }, [eventId]);

  const loadInsight = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!eventId) return;

      const force = Boolean(opts?.force);
      if (!force) {
        const cached = readCachedInsight(eventId);
        setInsightData(cached?.data ?? null);
        setInsightCachedAt(cached?.cachedAt ?? null);
        setInsightError("");
        if (cached) {
          setIsLoadingInsight(false);
          return;
        }
      }

      const controller = new AbortController();
      insightControllerRef.current?.abort();
      insightControllerRef.current = controller;
      const requestId = (insightRequestIdRef.current += 1);

      setIsLoadingInsight(true);
      setInsightError("");

      try {
        const cacheBuster = `ts=${Date.now()}`;
        const insightsUrl = `/api/v1/survey-analytics/events/${eventId}/insights?${cacheBuster}`;
        const result = await api.get<EventSurveyInsightResult>(insightsUrl, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        if (requestId !== insightRequestIdRef.current) return;

        if (result.error || !result.data) {
          setInsightError(result.message || "Gagal memuat AI insight.");
          return;
        }

        setInsightData(result.data);
        const cachedAt = new Date().toISOString();
        setInsightCachedAt(cachedAt);
        writeCachedInsight(eventId, { cachedAt, data: result.data });
      } catch {
        if (controller.signal.aborted) return;
        if (requestId !== insightRequestIdRef.current) return;
        setInsightError("Terjadi kesalahan sistem saat mengambil AI insight.");
      } finally {
        if (!controller.signal.aborted && requestId === insightRequestIdRef.current) {
          setIsLoadingInsight(false);
        }
      }
    },
    [eventId],
  );

  useEffect(() => {
    if (!eventId) return;
    void loadInsight();
    return () => insightControllerRef.current?.abort();
  }, [eventId, loadInsight]);

  const analyticsEntries = useMemo(() => {
    return Object.entries(analyticsData?.analytics ?? {});
  }, [analyticsData]);

  const handleToggleResponses = useCallback((question: string) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [question]: !prev[question],
    }));
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + DEFAULT_VISIBLE_QUESTIONS, analyticsEntries.length));
  }, [analyticsEntries.length]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-[#0A2647]">Ops! Ada Masalah</h2>
        <p className="text-neutral-500 mb-6 max-w-md text-center">
          {error}. Pastikan API Backend sudah aktif dan endpoint sudah benar.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-2 bg-[#0A2647] text-white rounded-full hover:bg-[#133A6F] transition shadow-lg"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
    );
  }

  const insightContent: SurveyInsightContent | null = insightData?.insight
    ? typeof insightData.insight === "string"
      ? parseInsightStringToContent(insightData.insight)
      : {
          summary: insightData.insight.summary || "",
          keyFindings: insightData.insight.keyFindings || [],
          exhibitorActions: insightData.insight.exhibitorActions || [],
          opportunityWatchout: insightData.insight.opportunityWatchout || "",
        }
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-screen-2xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-[#2F5BFF] transition mb-2"
            >
              <ArrowLeft size={16} /> Kembali ke Event
            </button>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Survey Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-xs font-semibold text-neutral-600 shadow-sm">
              Live Data
            </span>
          </div>
        </div>

        {isLoadingAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-white rounded-[24px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Data Dianalisis" value={analyticsData?.totalDataAnalyzed || 0} icon={BarChart3} />
            <StatCard title="Jumlah Pertanyaan" value={analyticsEntries.length} icon={MessageSquare} />
            <StatCard title="Status AI" value="Active" icon={Sparkles} />
            <StatCard title="Analytic Version" value="v2.0" icon={Info} />
          </div>
        )}

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-[#2F5BFF] to-[#1E40AF] rounded-[24px] p-1 shadow-xl shadow-blue-200/50">
          <div className="bg-white rounded-[22px] p-6 lg:p-8">
            <div className="flex items-start gap-2 mb-6">
              <div className="p-2 bg-[#EAF1FF] rounded-lg text-[#2F5BFF]">
                <Sparkles size={20} className="animate-pulse" />
              </div>

              <div className="flex-1">
                <h2 className="font-bold text-xl text-neutral-900">AI Survey Insights</h2>
                {insightCachedAt ? (
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Cached: {new Date(insightCachedAt).toLocaleString("id-ID")}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => loadInsight({ force: true })}
                disabled={isLoadingInsight}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 disabled:opacity-60"
                title="Refresh insight"
              >
                <RefreshCw size={14} className={isLoadingInsight ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {isLoadingInsight ? (
              <div className="space-y-4">
                <div className="h-4 bg-neutral-100 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-neutral-100 rounded w-full animate-pulse" />
                <div className="h-4 bg-neutral-100 rounded w-5/6 animate-pulse" />
              </div>
            ) : (
              <div className="text-neutral-600 leading-relaxed text-sm">
                {insightError ? (
                  <span className="text-red-600">{insightError}</span>
                ) : !insightContent ? (
                  "Insight tidak tersedia."
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-[16px] bg-[#F3F6FF] p-4">
                      <p className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Ringkasan</p>
                      <p className="mt-3 whitespace-pre-wrap">{insightContent.summary}</p>
                    </div>

                    <div className="rounded-[16px] bg-[#F3F6FF] p-4">
                      <p className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Temuan Utama</p>
                      {insightContent.keyFindings?.length ? (
                        <ul className="mt-3 list-disc space-y-2 pl-5">
                          {insightContent.keyFindings.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-neutral-500">Belum ada temuan utama.</p>
                      )}
                    </div>

                    <div className="rounded-[16px] bg-[#F3F6FF] p-4">
                      <p className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Aksi untuk Exhibitor</p>
                      {insightContent.exhibitorActions?.length ? (
                        <ul className="mt-3 list-disc space-y-2 pl-5">
                          {insightContent.exhibitorActions.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-neutral-500">Belum ada aksi yang disarankan.</p>
                      )}
                    </div>

                    <div className="rounded-[16px] border border-neutral-100 bg-white p-4">
                      <p className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Peluang / Waspada</p>
                      <p className="mt-3 whitespace-pre-wrap">
                        {insightContent.opportunityWatchout || "Belum ada peluang/waspada yang terdeteksi."}
                      </p>
                    </div>
                  </div>
                )}

                {typeof insightData?.totalResponses === "number" ? (
                  <p className="mt-4 text-xs text-neutral-400">Total responses: {insightData.totalResponses}</p>
                ) : null}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest font-bold">
                Powered by Advanced Analytics AI
              </p>
            </div>
          </div>
        </div>

        {/* Main Analytics Section */}
        <div className="space-y-8">
            {isLoadingAnalytics ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : analyticsEntries.length === 0 ? (
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-neutral-100 text-sm text-neutral-600">
                Survey analytics belum tersedia untuk event ini.
              </div>
            ) : (
              <>
                {analyticsEntries.slice(0, visibleCount).map(([question, content], index) => {
                  const isExpanded = Boolean(expandedResponses[question]);
                  const responses = content.type === "text_list" ? (content.data as string[]) : [];
                  const responsesToShow = isExpanded ? responses : responses.slice(0, TEXT_PREVIEW_LIMIT);
                  const chartData =
                    content.type === "chart"
                      ? formatChartData(content.data as Record<string, number>)
                      : null;

                  return (
                    <div key={question} className="bg-white p-8 rounded-[24px] shadow-sm border border-neutral-100">
                      <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#EAF1FF] text-[#2F5BFF] text-xs">
                          {index + 1}
                        </span>
                        {question}
                      </h3>

                      {content.type === "chart" ? (
                        <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData ?? []} layout="vertical" margin={{ left: 40, right: 20 }}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={true}
                                vertical={false}
                                stroke="#F1F5F9"
                              />
                              <XAxis type="number" hide />
                              <YAxis
                                dataKey="label"
                                type="category"
                                tick={{ fontSize: 12, fill: "#64748B" }}
                                width={100}
                              />
                              <Tooltip
                                cursor={{ fill: "#F8FAFC" }}
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                                }}
                              />
                              <Bar dataKey="total" fill="#2F5BFF" radius={[0, 8, 8, 0]} barSize={32}>
                                {(chartData ?? []).map((_, i) => (
                                  <Cell key={`cell-${i}`} fill={i % 2 === 0 ? "#2F5BFF" : "#5D7FFF"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {responsesToShow.map((text, i) => (
                              <div
                                key={i}
                                className="p-4 bg-neutral-50 rounded-[16px] border border-neutral-100 text-sm text-neutral-700 leading-relaxed"
                              >
                                "{text}"
                              </div>
                            ))}
                          </div>

                          {responses.length > TEXT_PREVIEW_LIMIT ? (
                            <button
                              type="button"
                              onClick={() => handleToggleResponses(question)}
                              className="text-sm font-semibold text-[#2F5BFF] hover:underline"
                            >
                              {isExpanded ? "Sembunyikan jawaban" : `Tampilkan semua jawaban (${responses.length})`}
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}

                {analyticsEntries.length > visibleCount ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="w-full rounded-[18px] border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
                  >
                    Muat lebih banyak pertanyaan ({Math.min(visibleCount + DEFAULT_VISIBLE_QUESTIONS, analyticsEntries.length)}
                    /{analyticsEntries.length})
                  </button>
                ) : null}
              </>
            )}
          </div>
      </div>
    </div>
  );
};

export default SurveyAnalyticsDashboard;
