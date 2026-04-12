import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  Sparkles, ArrowLeft, BarChart3, MessageSquare, Info, AlertCircle 
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

interface EventSurveyInsightResult {
  eventId: string;
  insight: string;
  totalResponses: number;
}

// --- Components ---

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-[24px] p-6 h-64 shadow-sm border border-neutral-100" />
);

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
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

const SurveyAnalyticsDashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [analyticsData, setAnalyticsData] = useState<EventSurveyAnalyticsResult | null>(null);
  const [insightData, setInsightData] = useState<EventSurveyInsightResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log("🔍 [DEBUG] Mencoba tarik data untuk eventId:", eventId);

      try {
        // ALAMAT DISESUAIKAN DENGAN backend/src/routes/index.ts & survey-analytics.route.js
        // Prefix: /survey-analytics, Route: /events/:eventId
        const analyticsUrl = `/api/v1/survey-analytics/events/${eventId}`;
        const insightsUrl = `/api/v1/survey-analytics/events/${eventId}/insights`;

        console.log("📡 [DEBUG] Request Analytics ke:", analyticsUrl);
        const resAnalytics = await api.get<EventSurveyAnalyticsResult>(analyticsUrl);
        console.log("📊 [DEBUG] Response Analytics:", resAnalytics);
        
        if (!resAnalytics.error && resAnalytics.data) {
          setAnalyticsData(resAnalytics.data);
        } else if (resAnalytics.status === 404) {
          console.error("❌ [DEBUG] URL Analytics salah (404). Cek prefix di app.ts backend.");
          setError(`Endpoint Analytics tidak ditemukan (404).`);
        }

        console.log("📡 [DEBUG] Request Insights ke:", insightsUrl);
        const resInsight = await api.get<EventSurveyInsightResult>(insightsUrl);
        console.log("🤖 [DEBUG] Response Insight:", resInsight);

        if (!resInsight.error && resInsight.data) {
          setInsightData(resInsight.data);
        } else if (resInsight.status === 404) {
          console.error("❌ [DEBUG] URL Insight salah (404). Pastikan prefix /api/v1/analytics/surveys bener.");
        }
      } catch (err) {
        console.error("🔥 [DEBUG] Catch Error:", err);
        setError("Terjadi kesalahan sistem saat mengambil data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId]);

  // Helper to transform Record<string, number> to Recharts array format
  const formatChartData = (data: Record<string, number>) => {
    return Object.entries(data).map(([label, total]) => ({ label, total }));
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-[#0A2647]">Ops! Ada Masalah</h2>
        <p className="text-neutral-500 mb-6 max-w-md text-center">{error}. Pastikan API Backend sudah aktif dan endpoint sudah benar.</p>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-2 bg-[#0A2647] text-white rounded-full hover:bg-[#133A6F] transition shadow-lg"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse bg-white rounded-[24px]" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Data Dianalisis" value={analyticsData?.totalDataAnalyzed || 0} icon={BarChart3} />
            <StatCard title="Jumlah Pertanyaan" value={Object.keys(analyticsData?.analytics || {}).length} icon={MessageSquare} />
            <StatCard title="Status AI" value="Active" icon={Sparkles} />
            <StatCard title="Analytic Version" value="v2.0" icon={Info} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Analytics Section */}
          <div className="lg:col-span-2 space-y-8">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              analyticsData && Object.entries(analyticsData.analytics).map(([question, content], index) => (
                <div key={index} className="bg-white p-8 rounded-[24px] shadow-sm border border-neutral-100">
                  <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#EAF1FF] text-[#2F5BFF] text-xs">
                      {index + 1}
                    </span>
                    {question}
                  </h3>

                  {content.type === "chart" ? (
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatChartData(content.data as Record<string, number>)} layout="vertical" margin={{ left: 40, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="label" 
                            type="category" 
                            tick={{ fontSize: 12, fill: '#64748B' }}
                            width={100}
                          />
                          <Tooltip 
                            cursor={{ fill: '#F8FAFC' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Bar 
                            dataKey="total" 
                            fill="#2F5BFF" 
                            radius={[0, 8, 8, 0]} 
                            barSize={32}
                          >
                            {formatChartData(content.data as Record<string, number>).map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={i % 2 === 0 ? "#2F5BFF" : "#5D7FFF"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {(content.data as string[]).map((text, i) => (
                        <div key={i} className="p-4 bg-neutral-50 rounded-[16px] border border-neutral-100 text-sm text-neutral-700 leading-relaxed">
                          "{text}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* AI Insight Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-[#2F5BFF] to-[#1E40AF] rounded-[24px] p-1 shadow-xl shadow-blue-200/50">
                <div className="bg-white rounded-[22px] p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-[#EAF1FF] rounded-lg text-[#2F5BFF]">
                      <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <h2 className="font-bold text-xl text-neutral-900">AI Event Insights</h2>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-neutral-100 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-neutral-100 rounded w-full animate-pulse" />
                      <div className="h-4 bg-neutral-100 rounded w-5/6 animate-pulse" />
                    </div>
                  ) : (
                    <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap text-sm">
                      {insightData?.insight ? (
                        insightData.insight.replace(/[#*]/g, '') // Bersihkan simbol markdown sederhana biar gak risih
                      ) : "Insight tidak tersedia."}
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-neutral-100">
                    <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest font-bold">
                      Powered by Advanced Analytics AI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SurveyAnalyticsDashboard;