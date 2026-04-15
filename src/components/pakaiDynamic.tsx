import { useEffect, useState } from "react";
import { Circle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FormBuilder from "./FormBuilder";
import type {
  CustomQuestion,
  FixedField,
  FormBuilderData,
  FormBuilderResponse,
} from "../types/formBuilder";

type EventApiFieldBase = {
  fieldId: string;
  key: string;
  label: string;
  type: string;
  order: number;
  validation?: { required?: boolean };
  isActive?: boolean;
  options?: Array<{ value: string; label: string; isDefault?: boolean }>;
};

type EventApiFixedField = EventApiFieldBase & { isFixed: true };
type EventApiCustomQuestion = EventApiFieldBase & { isFixed: false };
type EventApiField = EventApiFixedField | EventApiCustomQuestion;

type EventApiItem = {
  _id: string;
  title: string;
  eventDate: string;
  location: string | null;
  status: string;
  slug: string;
  registrationForm?: {
    version?: number;
    publishedAt?: string | null;
    fields?: EventApiField[];
  };
};

type EventsResponse = {
  success?: boolean;
  message?: string;
  data?: { items?: EventApiItem[] };
};

//buat ambil slug dari url, terus fetch data form builder pake slug itu, terus render FormBuilder sesuai data yang di fetch
export default function EventRegistrationPage() {
  const { slug } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<
    | null
    | {
        tone: "success" | "warning" | "error";
        title: string;
        message: string;
      }
  >(null);
  const [formBuilderData, setFormBuilderData] = useState<FormBuilderData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError("");

    const eventsUrl =
      (import.meta.env.VITE_API_URL as string | undefined) || "/api/v1/events";

    fetch(eventsUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Request failed (${res.status})`);
        }
        return (await res.json()) as unknown;
      })
      .then((raw) => {
        const eventsRes = raw as EventsResponse;

        if (!eventsRes.success || !eventsRes.data?.items) {
          setError(eventsRes.message || "Event not found");
          return;
        }

        const match = eventsRes.data.items.find((it) => it.slug === slug);

        if (!match?.registrationForm?.fields) {
          setError("Event not found");
          return;
        }

        const fields = match.registrationForm.fields;
        const fixedFieldsRaw = fields.filter(
          (f): f is EventApiFixedField => f.isFixed === true,
        );
        const customQuestionsRaw = fields.filter(
          (f): f is EventApiCustomQuestion => f.isFixed === false,
        );

        const fixedFields: FixedField[] = fixedFieldsRaw.map((f) => ({
          ...f,
          isActive: f.isActive ?? true,
        }));

        const customQuestions: CustomQuestion[] = customQuestionsRaw.map((f) => ({
          ...f,
          isActive: f.isActive ?? true,
        }));

        const data: FormBuilderResponse["data"] = {
          event: {
            id: String(match._id ?? ""),
            title: String(match.title ?? ""),
            eventDate: String(match.eventDate ?? ""),
            location: String(match.location ?? ""),
            status: String(match.status ?? ""),
            slug: String(match.slug ?? ""),
          },
          eventId: String(match._id ?? ""),
          version: Number(match.registrationForm.version ?? 1),
          publishedAt: match.registrationForm.publishedAt ?? null,
          fixedFields,
          customQuestions,
        };

        setFormBuilderData(data);
      })
      .catch((e: unknown) => {
        const message =
          e instanceof Error && e.message ? e.message : "Network error";
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleSubmitForm = async (payload: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      setToast(null);

      await axios.post("/api/register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSubmitMessage("Registration submitted successfully! Please check your E-mail for the entry pass.");
      setTimeout(() => setSubmitMessage(null), 3000);
    } catch (err: unknown) {
      const apiMessage =
        axios.isAxiosError(err) &&
        (err.response?.data as { message?: unknown } | undefined)?.message
          ? String((err.response?.data as { message?: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Unknown error";

      if (apiMessage === "Email already registered") {
        setSubmitMessage("This email is already used, please use another email.");
        setToast({
          tone: "warning",
          title: "Duplicate email",
          message: "This email is already used, please use another email.",
        });
      } else if (
        apiMessage === "Phone already registered" ||
        apiMessage === "Phone number already registered"
      ) {
        setSubmitMessage("This phone number is already used, please use another phone number.");
        setToast({
          tone: "warning",
          title: "Duplicate phone number",
          message: "This phone number is already used, please use another phone number.",
        });
      } else {
        setSubmitMessage("Failed to submit registration");
        setToast({
          tone: "error",
          title: "Submission failed",
          message: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!formBuilderData) return null;

//cssnya masih acak-acakan, nanti dibenerin lagi
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
      {toast ? (
        <div className="fixed left-1/2 top-5 z-[60] w-[min(92vw,520px)] -translate-x-1/2">
          <div
            role="status"
            aria-live="polite"
            className={
              toast.tone === "success"
                ? "flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-lg"
                : toast.tone === "warning"
                  ? "flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"
                  : "flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg"
            }
          >
            <div className="mt-0.5">
              {toast.tone === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-700" />
              ) : toast.tone === "warning" ? (
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              ) : (
                <XCircle className="h-5 w-5 text-red-700" />
              )}
            </div>
            <div className="min-w-0 flex-1 font-sans">
              <div className="text-xl leading-tight font-semibold text-slate-900">
                {toast.title}
              </div>
              <div className="mt-0.5 text-lg leading-relaxed text-slate-700">
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              className="font-sans rounded-lg px-2 py-1 text-lg leading-relaxed font-semibold text-slate-700 hover:bg-black/5"
              onClick={() => setToast(null)}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
      <div className="relative bg-[#001128] text-white p-10 h-[220px] mb-6 rounded-2xl font-sans">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#855300,transparent)]" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#855300] text-lg leading-relaxed font-semibold uppercase tracking-wide">
            <Circle size={8} fill="#855300" />
            <span>Participant Registration</span>
          </div>
          <h1 className="text-3xl leading-tight font-extrabold">
            {formBuilderData?.event?.title}
          </h1>
          <p className="text-lg leading-relaxed text-[#768EB4] max-w-[672px]">
            {formBuilderData?.event?.location} - Please fill out the form below.
          </p>
        </div>
      </div>

      {submitMessage && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-sans text-lg leading-relaxed font-semibold text-slate-900">{submitMessage}</p>
        </div>
      )}

      <FormBuilder
        formBuilderData={formBuilderData}
        onSubmit={handleSubmitForm}
        isLoading={false}
        isSubmitting={isSubmitting}
      />
      </div>
    </div>
  );
}
