import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { fetchFormBuilder } from "../../store/formBuilderSlice";
import FormBuilder from "../../components/FormBuilder";
import { Circle } from "lucide-react";

export default function RegistrationForm() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { data, loading, error } = useAppSelector((state) => state.formBuilder);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const slug = searchParams.get("slug")?.trim() || "";
    console.log("RegistrationForm: Fetching form builder data...", { slug });
    dispatch(fetchFormBuilder(slug));
  }, [dispatch, searchParams]);

  useEffect(() => {
    console.log("RegistrationForm: State changed", { data, loading, error });
  }, [data, loading, error]);

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      console.log("Form submitted with data:", formData);

      // Example: Send to backend API
      // const response = await fetch('/api/registrations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
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

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 flex justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="relative bg-[#001128] text-white p-10 h-[220px] mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#855300,transparent)]" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#855300] text-xs font-semibold uppercase tracking-wide">
              <Circle size={8} fill="#855300" />
              <span>Participant Registration</span>
            </div>

            <h1 className="text-4xl font-extrabold">
              {data?.event?.title || "Registration Form"}
            </h1>

            <p className="text-sm text-[#768EB4] max-w-[672px]">
              {data?.event?.location && `${data.event.location} - `}
              Please fill out the form below to register for the event.
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {submitMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{submitMessage}</p>
          </div>
        )}

        {/* Form */}
        {!searchParams.get("slug") && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              Missing event slug. Open the form via{" "}
              <span className="font-mono">/register/:slug</span> or use{" "}
              <span className="font-mono">/?slug=your-event-slug</span>.
            </p>
          </div>
        )}
        <FormBuilder
          formBuilderData={data}
          onSubmit={handleFormSubmit}
          isLoading={loading}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
