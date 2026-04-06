import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
import { useParams } from "react-router-dom";
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
      console.log("Registration submitted:", payload);

      // Example: Send to backend API
      // await fetch("/api/v1/registrations", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      setSubmitMessage("Registration submitted successfully!");
      setTimeout(() => setSubmitMessage(null), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitMessage("Failed to submit registration");
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
      <div className="relative bg-[#001128] text-white p-10 h-[220px] mb-6 rounded-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#855300,transparent)]" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#855300] text-xs font-semibold uppercase tracking-wide">
            <Circle size={8} fill="#855300" />
            <span>Participant Registration</span>
          </div>
          <h1 className="text-4xl font-extrabold">
            {formBuilderData?.event?.title}
          </h1>
          <p className="text-sm text-[#768EB4] max-w-[672px]">
            {formBuilderData?.event?.location} - Please fill out the form below.
          </p>
        </div>
      </div>

      {submitMessage && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">{submitMessage}</p>
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
