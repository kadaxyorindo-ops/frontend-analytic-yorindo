// components/FormBuilder.tsx
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Check, Edit3, Building2, User2, Sparkles } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Field, FormBuilderData } from "../types/formBuilder";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface FormBuilderProps {
  formBuilderData: FormBuilderData | null;
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

// Dynamically build Zod schema from fields
const buildValidationSchema = (fields: Field[]) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    const requiredMessage =
      field.validation?.message || `${field.label} is required`;

    const baseSchema: z.ZodTypeAny = (() => {
      switch (field.type) {
        case "email":
          return z.string().trim().email("Invalid email address");
        case "phone":
          // Keep digits-only as a safe default for WA/phone number.
          return z
            .string()
            .trim()
            .regex(/^\d+$/, "Phone must contain only digits");
        case "number":
          // Inputs are strings in RHF; validate numeric format.
          return z
            .string()
            .trim()
            .regex(/^\d+(\.\d+)?$/, "Must be a valid number");
        case "date":
          // <input type="date"> produces YYYY-MM-DD
          return z
            .string()
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
        case "checkbox":
          return z.array(z.string());
        default:
          return z.string().trim();
      }
    })();

    const withPattern = (() => {
      const pattern = field.validation?.pattern;
      if (!pattern) return baseSchema;

      // Only apply regex patterns to string-based schemas.
      if (baseSchema instanceof z.ZodString) {
        try {
          return baseSchema.regex(new RegExp(pattern), field.validation?.message);
        } catch {
          // If pattern is invalid, skip it to avoid breaking the form.
          return baseSchema;
        }
      }

      return baseSchema;
    })();

    const fieldSchema = (() => {
      if (field.type === "checkbox") {
        return field.validation?.required
          ? (withPattern as z.ZodArray<z.ZodString>).min(1, requiredMessage)
          : (withPattern as z.ZodArray<z.ZodString>).optional();
      }

      if (field.validation?.required) {
        // For strings: ensure non-empty after trim.
        return withPattern instanceof z.ZodString
          ? withPattern.min(1, requiredMessage)
          : withPattern;
      }

      // Optional: allow empty string for string types, or undefined for others.
      return withPattern instanceof z.ZodString
        ? withPattern.optional().or(z.literal(""))
        : withPattern.optional();
    })();

    schemaObject[field.key] = fieldSchema;
  });

  return z.object(schemaObject);
};

export default function FormBuilder({
  formBuilderData,
  onSubmit,
  isLoading = false,
  isSubmitting = false,
}: FormBuilderProps) {
  console.log("FormBuilder: Received props", {
    formBuilderData,
    isLoading,
    isSubmitting,
  });

  const allFields = useMemo(() => {
    if (!formBuilderData) return [];
    try {
      return [
        ...(formBuilderData.fixedFields || []),
        ...(formBuilderData.customQuestions || []),
      ]
        .filter((field) => field.isActive)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error("Error processing form fields:", error);
      return [];
    }
  }, [formBuilderData]);

  const sections = useMemo(() => {
    const personalKeys = new Set([
      "full_name",
      "nama_lengkap",
      "personal_email",
      "email_pribadi",
      "phone",
      "no_hp",
      "job_title",
      "jabatan",
      "position",
    ]);
    const corporateKeys = new Set([
      "company_name",
      "nama_company",
      "company_location",
      "lokasi_perusahaan",
      "industry",
      "jenis_industri",
      "company_email",
      "email_perusahaan",
    ]);

    const personal: Field[] = [];
    const corporate: Field[] = [];
    const eventInfo: Field[] = [];

    for (const f of allFields) {
      if (personalKeys.has(f.key)) personal.push(f);
      else if (corporateKeys.has(f.key)) corporate.push(f);
      else eventInfo.push(f);
    }

    return [
      { id: "personal", number: "01", title: "Personal Identity", fields: personal },
      { id: "corporate", number: "02", title: "Corporate Profile", fields: corporate },
      { id: "event", number: "03", title: "Event Information", fields: eventInfo },
    ].filter((s) => s.fields.length > 0);
  }, [allFields]);

  console.log("FormBuilder: Processed fields", allFields);

  const validationSchema = useMemo(() => {
    try {
      return buildValidationSchema(allFields);
    } catch (error) {
      console.error("Error building validation schema:", error);
      return z.object({});
    }
  }, [allFields]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      validationSchema as unknown as Parameters<typeof zodResolver>[0],
    ),
    mode: "onBlur",
  });

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<Record<string, unknown> | null>(
    null,
  );

  const keyToLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of allFields) map.set(f.key, f.label);
    return map;
  }, [allFields]);

  const reviewItems = useMemo(() => {
    if (!pendingValues) return [];
    return Object.entries(pendingValues)
      .map(([key, value]) => {
        const label = keyToLabel.get(key) ?? key;
        const display =
          Array.isArray(value) ? value.join(", ") : value === "" ? "-" : String(value);
        return { key, label, display };
      })
      .filter((it) => it.display !== "-");
  }, [pendingValues, keyToLabel]);

  const reviewSections = useMemo(() => {
    const byKey = new Map(reviewItems.map((it) => [it.key, it]));
    return sections
      .map((s) => {
        const items = s.fields
          .map((f) => byKey.get(f.key))
          .filter(Boolean) as Array<(typeof reviewItems)[number]>;
        return { ...s, items };
      })
      .filter((s) => s.items.length > 0);
  }, [reviewItems, sections]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (!formBuilderData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">No form data available</div>
      </div>
    );
  }

  const renderField = (field: Field) => {
    const hasError = !!errors[field.key];
    const errorMessage = errors[field.key]?.message;

    const commonLabel = (
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
          {field.label}
          {field.validation?.required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </Label>
      </div>
    );

    const commonErrorDisplay =
      hasError && errorMessage ? (
        <p className="mt-1 text-xs text-red-600">{String(errorMessage)}</p>
      ) : null;

    switch (field.type) {
      case "text":
        return (
          <div key={field.fieldId} className="space-y-2">
            {commonLabel}
            <Input
              placeholder={field.placeholder || field.label}
              {...register(field.key)}
              className={
                hasError
                  ? "h-10 border-red-500 bg-slate-100/80"
                  : "h-10 bg-slate-100/80 border-transparent"
              }
            />
            {commonErrorDisplay}
          </div>
        );

      case "number":
        return (
          <div key={field.fieldId} className="space-y-2">
            {commonLabel}
            <Input
              type="number"
              placeholder={field.placeholder || field.label}
              {...register(field.key)}
              className={
                hasError
                  ? "h-10 border-red-500 bg-slate-100/80"
                  : "h-10 bg-slate-100/80 border-transparent"
              }
            />
            {commonErrorDisplay}
          </div>
        );

      case "date":
        return (
          <div key={field.fieldId} className="space-y-2">
            {commonLabel}
            <Input
              type="date"
              placeholder={field.placeholder || field.label}
              {...register(field.key)}
              className={
                hasError
                  ? "h-10 border-red-500 bg-slate-100/80"
                  : "h-10 bg-slate-100/80 border-transparent"
              }
            />
            {commonErrorDisplay}
          </div>
        );

      case "email":
        return (
          <div key={field.fieldId} className="space-y-2">
            {commonLabel}
            <Input
              type="email"
              placeholder={field.placeholder || field.label}
              {...register(field.key)}
              className={
                hasError
                  ? "h-10 border-red-500 bg-slate-100/80"
                  : "h-10 bg-slate-100/80 border-transparent"
              }
            />
            {commonErrorDisplay}
          </div>
        );

      case "phone":
        return (
          <div key={field.fieldId} className="space-y-2">
            {commonLabel}
            <Input
              type="tel"
              placeholder={field.placeholder || field.label}
              {...register(field.key)}
              className={
                hasError
                  ? "h-10 border-red-500 bg-slate-100/80"
                  : "h-10 bg-slate-100/80 border-transparent"
              }
            />
            {commonErrorDisplay}
          </div>
        );

      case "textarea":
        return (
          <div key={field.fieldId} className="space-y-2 md:col-span-2">
            {commonLabel}
            <textarea
              placeholder={field.placeholder || field.label}
              rows={4}
              {...register(field.key)}
              className={`w-full min-h-[140px] px-3 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100/80 ${
                hasError ? "border border-red-500" : "border border-transparent"
              }`}
            />
            {commonErrorDisplay}
          </div>
        );

      case "radio":
        return (
          <fieldset key={field.fieldId} className="space-y-2 md:col-span-2">
            {commonLabel}
            <div className="space-y-2">
              {"options" in field &&
                field.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register(field.key)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {commonErrorDisplay}
          </fieldset>
        );

      case "checkbox":
        return (
          <fieldset key={field.fieldId} className="space-y-2 md:col-span-2">
            {commonLabel}
            <div className="space-y-2">
              {"options" in field &&
                field.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    {...register(field.key)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {commonErrorDisplay}
          </fieldset>
        );

      case "select":
      case "dropdown":
        return (
          <div key={field.fieldId} className="space-y-2">
            {commonLabel}
            <Controller
              name={field.key}
              control={control}
              render={({ field: controllerField }) => (
                <Select
                  value={
                    typeof controllerField.value === "string"
                      ? controllerField.value
                      : ""
                  }
                  onValueChange={controllerField.onChange}
                >
                  <SelectTrigger
                    className={
                      hasError
                        ? "h-10 border-red-500 bg-slate-100/80"
                        : "h-10 bg-slate-100/80 border-transparent"
                    }
                  >
                    <SelectValue
                      placeholder={field.placeholder || `Select ${field.label}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {"options" in field &&
                      field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {commonErrorDisplay}
          </div>
        );

      case "info":
      case "instruction":
      case "note":
      case "static":
        return (
          <div
            key={field.fieldId}
            className="rounded-lg bg-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600 md:col-span-2"
          >
            {field.label}
          </div>
        );

      default:
        return (
          <div key={field.fieldId} className="mb-4 p-4 bg-yellow-50 rounded">
            <p className="text-sm text-yellow-800">
              Unsupported field type: {field.type}
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm">
      <CardContent className="p-7 sm:p-10">
        <form
          onSubmit={handleSubmit((values) => {
            setPendingValues(values as Record<string, unknown>);
            setIsReviewOpen(true);
          })}
          className="space-y-10"
        >
          {sections.map((section) => (
            <section key={section.id} className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                  {section.number}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {section.title}
                </h3>
              </div>
              <div
                className={
                  section.id === "event"
                    ? "grid grid-cols-1 gap-6"
                    : "grid grid-cols-1 gap-6 md:grid-cols-2"
                }
              >
                {section.fields.map((field) => renderField(field))}
              </div>
            </section>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#F4A11A] hover:bg-[#e49310] text-slate-900 font-semibold py-2 px-6 rounded-xl"
            >
              {isSubmitting ? "Submitting..." : "Complete Registration →"}
            </Button>
          </div>
        </form>
      </CardContent>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <div className="relative bg-[#001128] text-white p-10">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#855300,transparent)]" />
            <DialogHeader className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-[#855300] text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Final step</span>
              </div>
              <DialogTitle className="text-3xl font-extrabold">
                Review Your Registration
              </DialogTitle>
              <DialogDescription className="text-sm text-[#B7C6E1]">
                Please verify your information below. This data will be used for your
                official delegate badge and access credentials.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="bg-white p-8">
            {reviewSections.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                No answers to review yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {reviewSections.map((s) => {
                  const Icon =
                    s.id === "personal"
                      ? User2
                      : s.id === "corporate"
                        ? Building2
                        : Check;
                  const span = s.id === "event" ? "md:col-span-2" : "";
                  return (
                    <div
                      key={s.id}
                      className={`rounded-2xl border border-slate-200 bg-slate-50 p-5 ${span}`}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        <Icon className="h-4 w-4" />
                        <span>{s.title}</span>
                      </div>
                      <div className="mt-4 space-y-4">
                        {s.items.map((it) => (
                          <div key={it.key}>
                            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                              {it.label}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900 break-words">
                              {it.display}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="justify-start text-slate-700"
                onClick={() => setIsReviewOpen(false)}
              >
                <Edit3 className="h-4 w-4" />
                Edit Details
              </Button>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="text-[10px] text-slate-500">
                  By confirming, you agree to our Terms of Service.
                </p>
                <Button
                  type="button"
                  disabled={isSubmitting || !pendingValues}
                  className="bg-[#F4A11A] hover:bg-[#e49310] text-slate-900 font-semibold py-2 px-6 rounded-xl"
                  onClick={() => {
                    if (!pendingValues) return;
                    setIsReviewOpen(false);
                    onSubmit(pendingValues);
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Submit →"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
