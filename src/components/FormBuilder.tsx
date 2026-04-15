// components/FormBuilder.tsx
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Field, FormBuilderData } from "../types/formBuilder";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
  onReview?: (data: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
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

const inferDefaultValue = (field: Field) => {
  switch (field.type) {
    case "checkbox":
      return [] as string[];
    default:
      // RHF will otherwise keep `undefined` for untouched fields, which makes Zod
      // throw "expected string, received undefined" for required string fields.
      return "";
  }
};

const normalizeFieldOptions = (field: Field) => {
  if (!("options" in field)) return [] as Array<{ value: string; label: string }>;
  const raw = field.options;
  if (!Array.isArray(raw)) return [] as Array<{ value: string; label: string }>;

  return raw
    .map((option) => {
      if (typeof option === "string") return { value: option, label: option };
      const value =
        typeof option?.value === "string"
          ? option.value
          : typeof option?.label === "string"
            ? option.label
            : "";
      const label =
        typeof option?.label === "string"
          ? option.label
          : typeof option?.value === "string"
            ? option.value
            : value;
      return { value, label };
    })
    .filter((opt) => opt.value);
};

export default function FormBuilder({
  formBuilderData,
  onSubmit,
  onReview,
  defaultValues,
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
        .filter((field) => field.isActive ?? true)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error("Error processing form fields:", error);
      return [];
    }
  }, [formBuilderData]);

  const mergedDefaultValues = useMemo(() => {
    const base: Record<string, unknown> = {};
    for (const field of allFields) {
      base[field.key] = inferDefaultValue(field);
    }
    return { ...base, ...(defaultValues ?? {}) };
  }, [allFields, defaultValues]);

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
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      validationSchema as unknown as Parameters<typeof zodResolver>[0],
    ),
    mode: "onBlur",
    defaultValues: mergedDefaultValues,
  });

  useEffect(() => {
    reset(mergedDefaultValues);
  }, [mergedDefaultValues, reset]);

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
        <Label className="text-base font-semibold tracking-wider uppercase text-slate-500">
          {field.label}
          {field.validation?.required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </Label>
      </div>
    );

    const commonErrorDisplay =
      hasError && errorMessage ? (
        <p className="mt-1 text-base leading-relaxed text-red-600">{String(errorMessage)}</p>
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
        {
          const options = normalizeFieldOptions(field);
        return (
          <fieldset key={field.fieldId} className="space-y-2 md:col-span-2">
            {commonLabel}
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-lg"
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
        }

      case "checkbox":
        {
          const options = normalizeFieldOptions(field);
        return (
          <fieldset key={field.fieldId} className="space-y-2 md:col-span-2">
            {commonLabel}
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-lg"
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
        }

      case "select":
      case "dropdown":
        {
          const options = normalizeFieldOptions(field);
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
                    {options.map((option) => (
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
        }

      case "info":
      case "instruction":
      case "note":
      case "static":
        return (
          <div
            key={field.fieldId}
            className="rounded-lg bg-slate-100 px-4 py-3 text-lg leading-relaxed text-slate-600 md:col-span-2"
          >
            {field.label}
          </div>
        );

      default:
        return (
          <div key={field.fieldId} className="mb-4 p-4 bg-yellow-50 rounded">
            <p className="text-lg leading-relaxed text-yellow-800">
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
            const payload = values as Record<string, unknown>;
            if (onReview) onReview(payload);
            else onSubmit(payload);
          })}
          className="space-y-10"
        >
          {sections.map((section) => (
            <section key={section.id} className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white text-base font-semibold">
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
    </Card>
  );
}
