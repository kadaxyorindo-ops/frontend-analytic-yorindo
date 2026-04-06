import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import {
  AlignLeft,
  ArrowLeft,
  CheckSquare,
  ChevronsUpDown,
  Copy,
  Eye,
  Lock,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  Type,
} from "lucide-react"
import MainLayout from "@/components/Layout/MainLayout"
import Button from "@/components/Button"
import { addForm, deleteCustomField, updateCustomField } from "@/store/registrationFormSlice"
import { api } from "@/services/api"
import type { RootState } from "@/store/store"
import type { CustomField, FixField, RegistrationForm } from "@/types/registration-form"
import { defaultFixFields } from "@/utils/mockData"

type DraftField = Omit<CustomField, "id" | "order">
type EditorState =
  | { mode: "create"; index: null; persistedId: null }
  | { mode: "edit"; index: number | null; persistedId: string | null }

const typeOptions: Array<{ value: CustomField["type"]; label: string }> = [
  { value: "text", label: "Short text field" },
  { value: "textarea", label: "Long text field" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radiobutton" },
  { value: "checkbox", label: "Checkbox" },
]

const industryOptions = [
  "Otomotif & Suku Cadang (Auto Parts)",
  "Elektronik & Peralatan Rumah Tangga",
  "Fast-Moving Consumer Goods (FMCG)",
  "Makanan & Minuman (F&B)",
  "Farmasi & Alat Kesehatan",
  "Plastik & Kemasan (Packaging)",
  "Fabrikasi Logam & Mesin Presisi",
  "Bahan Kimia Industri",
  "Alat Berat & Karoseri",
  "Tekstil & Garmen",
  "Other",
] as const

const typeLabels: Record<CustomField["type"], string> = {
  text: "Short text field",
  textarea: "Long text field",
  select: "Dropdown",
  radio: "Radiobutton",
  checkbox: "Checkbox",
  email: "Email",
  phone: "Phone",
  number: "Number",
  date: "Date",
  file: "File upload",
}

const supportsOptions = (type: CustomField["type"]) =>
  type === "select" || type === "radio" || type === "checkbox"

const hasPersistedId = (field: CustomField | DraftField): field is CustomField =>
  "id" in field && typeof field.id === "string"

const emptyDraft = (): DraftField => ({
  label: "",
  type: "text",
  required: false,
  options: [],
  placeholder: "",
  condition: undefined,
})

const fieldIcon = (type: CustomField["type"]) => {
  if (type === "textarea") return AlignLeft
  if (type === "select") return ChevronsUpDown
  if (type === "radio") return QrCode
  if (type === "checkbox") return CheckSquare
  return Type
}

const previewForField = (field: DraftField) => {
  const options = field.options?.length ? field.options : ["Option 1", "Option 2", "Option 3"]
  if (field.type === "textarea") return <div className="rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 text-neutral-400">Long-answer text</div>
  if (field.type === "radio") return <div className="space-y-3 rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4">{options.map((option) => <div key={option} className="flex items-center gap-3 text-sm text-neutral-600"><span className="h-4 w-4 rounded-full border border-neutral-400" /><span>{option}</span></div>)}</div>
  if (field.type === "checkbox") return <div className="space-y-3 rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4">{options.map((option) => <div key={option} className="flex items-center gap-3 text-sm text-neutral-600"><span className="h-4 w-4 rounded-[4px] border border-neutral-400" /><span>{option}</span></div>)}</div>
  if (field.type === "select") return <div className="flex items-center justify-between rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 text-sm text-neutral-500"><span>Pilih salah satu</span><ChevronsUpDown size={18} /></div>
  return <div className="rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 text-neutral-400">{field.placeholder || "Jawaban singkat"}</div>
}

const RegistrationFormPage = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { events } = useSelector((state: RootState) => state.events)
  const { forms } = useSelector((state: RootState) => state.registrationForms)
  const [formTitle, setFormTitle] = useState("")
  const [manualEventId, setManualEventId] = useState("")
  const [customFields, setCustomFields] = useState<DraftField[]>([])
  const [fieldDraft, setFieldDraft] = useState<DraftField>(emptyDraft())
  const [selectedIndustry, setSelectedIndustry] = useState<(typeof industryOptions)[number]>("Elektronik & Peralatan Rumah Tangga")
  const [otherIndustry, setOtherIndustry] = useState("")
  const [showFieldEditor, setShowFieldEditor] = useState(false)
  const [previewField, setPreviewField] = useState<DraftField | null>(null)
  const [editorState, setEditorState] = useState<EditorState>({ mode: "create", index: null, persistedId: null })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [remoteForm, setRemoteForm] = useState<RegistrationForm | null>(null)
  const [remoteFixFields, setRemoteFixFields] = useState<FixField[] | null>(null)

  const effectiveEventId = (eventId ?? manualEventId).trim()
  const event = events.find((item) => item.event_id === effectiveEventId)
  const existingForm = forms.find((item) => item.event_id === effectiveEventId)
  const persistedForm = existingForm ?? remoteForm
  const displayEventTitle = event?.title || (effectiveEventId ? `Event ${effectiveEventId}` : "Event Manual")
  const activeFixFields = remoteFixFields ?? defaultFixFields
  const shownFields = persistedForm?.custom_fields ?? customFields
  const currentFormTitle = formTitle || `Registration Form - ${displayEventTitle}`

  const currentTypeMeta = useMemo(
    () => typeOptions.find((option) => option.value === fieldDraft.type),
    [fieldDraft.type]
  )

  useEffect(() => {
    if (persistedForm) setFormTitle(persistedForm.title)
  }, [persistedForm])

  const normalizeKey = (label: string) =>
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")

  const mapFieldType = (type: string) => (type === "tel" ? "phone" : type)

  const mapFixedFieldType = (type?: string): FixField["type"] => {
    if (type === "email") return "email"
    if (type === "phone" || type === "tel") return "tel"
    return "text"
  }

  const mapCustomFieldType = (type?: string): CustomField["type"] => {
    if (!type) return "text"
    if (type === "tel") return "phone"
    return type as CustomField["type"]
  }

  useEffect(() => {
    if (!effectiveEventId || existingForm) return

    const loadForm = async () => {
      setIsLoadingForm(true)
      setLoadError("")

      const result = await api.get<unknown>(
        `/api/v1/form-builder/events/${effectiveEventId}`
      )

      setIsLoadingForm(false)

      if (result.error || !result.data) {
        setLoadError(result.message)
        setRemoteForm(null)
        setRemoteFixFields(null)
        return
      }

      const rawPayload =
        typeof result.data === "object" && result.data && "data" in result.data
          ? (result.data as { data: unknown }).data
          : result.data

      const payload = (rawPayload ?? {}) as {
        formName?: string
        fixedFields?: Array<{
          key?: string
          name?: string
          label?: string
          type?: string
          required?: boolean
        }>
        fixed_fields?: Array<{
          key?: string
          name?: string
          label?: string
          type?: string
          required?: boolean
        }>
        customQuestions?: Array<{
          key?: string
          name?: string
          label?: string
          type?: string
          required?: boolean
          options?: string[]
        }>
        custom_questions?: Array<{
          key?: string
          name?: string
          label?: string
          type?: string
          required?: boolean
          options?: string[]
        }>
        customFields?: Array<{
          key?: string
          name?: string
          label?: string
          type?: string
          required?: boolean
          options?: string[]
        }>
        custom_fields?: Array<{
          key?: string
          name?: string
          label?: string
          type?: string
          required?: boolean
          options?: string[]
        }>
        questions?: Array<{
          key?: string
          name?: string
          label?: string
          type?: string
          required?: boolean
          options?: string[]
        }>
        publish?: boolean
        _id?: string
        id?: string
        formId?: string
        link_pendaftaran?: string
        qr_code?: string
        link?: string
        qrCode?: string
        created_at?: string
        updated_at?: string
        createdAt?: string
        updatedAt?: string
      }

      const fixedSource =
        payload.fixedFields ??
        payload.fixed_fields ??
        []

      const customSource =
        payload.customQuestions ??
        payload.custom_questions ??
        payload.customFields ??
        payload.custom_fields ??
        payload.questions ??
        []

      const fixedFields = fixedSource
        .filter((field) => field?.isActive !== false)
        .map((field, index) => ({
          name: field.key ?? field.name ?? `field_${index + 1}`,
          label: field.label ?? field.key ?? field.name ?? `Field ${index + 1}`,
          type: mapFixedFieldType(field.type),
          required: Boolean(field.required ?? field.validation?.required),
          order: field.order ?? index + 1,
        }))

      const customFields = customSource
        .filter((field) => field?.isActive !== false)
        .map((field, index) => {
          const rawOptions = field.options ?? []
          const options = rawOptions.map((option) => {
            if (typeof option === "string") return option
            return option.value ?? option.label ?? ""
          }).filter(Boolean)

          return {
            id: field.key ?? field.name ?? `custom-${index + 1}`,
            label: field.label ?? field.key ?? field.name ?? `Question ${index + 1}`,
            type: mapCustomFieldType(field.type),
            required: Boolean(field.required ?? field.validation?.required),
            options,
            order: field.order ?? fixedFields.length + index + 1,
          }
        })

      const formId =
        payload.formId ??
        payload._id ??
        payload.id ??
        `FORM-${effectiveEventId}`
      const now = new Date().toISOString()

      setRemoteFixFields(fixedFields.length ? fixedFields : null)
      setRemoteForm({
        form_id: formId,
        event_id: effectiveEventId,
        title: payload.formName ?? `Registration Form - ${displayEventTitle}`,
        fix_fields: fixedFields.length ? fixedFields : defaultFixFields,
        custom_fields: customFields,
        link_pendaftaran:
          payload.link_pendaftaran ??
          payload.link ??
          `https://yorindo.com/register/${effectiveEventId}`,
        qr_code:
          payload.qr_code ??
          payload.qrCode ??
          `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=register/${effectiveEventId}`,
        is_active: payload.publish ?? true,
        created_at: payload.created_at ?? payload.createdAt ?? now,
        updated_at: payload.updated_at ?? payload.updatedAt ?? now,
      })
    }

    void loadForm()
  }, [displayEventTitle, effectiveEventId, existingForm])

  const openCreateEditor = () => {
    setEditorState({ mode: "create", index: null, persistedId: null })
    setFieldDraft(emptyDraft())
    setShowFieldEditor(true)
  }

  const openEditEditor = (field: CustomField | DraftField, index: number) => {
    setEditorState({
      mode: "edit",
      index: hasPersistedId(field) ? null : index,
      persistedId: hasPersistedId(field) ? field.id : null,
    })
    setFieldDraft({
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options ?? [],
      placeholder: field.placeholder ?? "",
      condition: field.condition,
    })
    setShowFieldEditor(true)
  }

  const closeEditor = () => {
    setShowFieldEditor(false)
    setFieldDraft(emptyDraft())
    setEditorState({ mode: "create", index: null, persistedId: null })
  }

  const addOption = () => {
    setFieldDraft((current) => ({
      ...current,
      options: [...(current.options ?? []), `Option ${(current.options?.length ?? 0) + 1}`],
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFieldDraft((current) => ({
      ...current,
      options: (current.options ?? []).map((option, optionIndex) =>
        optionIndex === index ? value : option
      ),
    }))
  }

  const removeOption = (index: number) => {
    setFieldDraft((current) => ({
      ...current,
      options: (current.options ?? []).filter((_, optionIndex) => optionIndex !== index),
    }))
  }

  const saveField = () => {
    if (!fieldDraft.label) return

    const cleaned: DraftField = {
      label: fieldDraft.label,
      type: fieldDraft.type,
      required: fieldDraft.required,
      options: supportsOptions(fieldDraft.type)
        ? (fieldDraft.options ?? []).map((option) => option.trim()).filter(Boolean)
        : undefined,
      placeholder: supportsOptions(fieldDraft.type) ? undefined : fieldDraft.placeholder,
      condition: fieldDraft.condition,
    }

    if (editorState.mode === "edit") {
      if (editorState.persistedId && existingForm) {
        dispatch(
          updateCustomField({
            form_id: existingForm.form_id,
            field_id: editorState.persistedId,
            updates: cleaned,
          })
        )
      } else if (editorState.index !== null) {
        setCustomFields((current) =>
          current.map((field, index) => (index === editorState.index ? cleaned : field))
        )
      }
    } else {
      setCustomFields((current) => [...current, cleaned])
    }

    closeEditor()
  }

  const removeDraftField = (index: number) => {
    setCustomFields((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  const saveForm = async () => {
    if (!effectiveEventId || existingForm || isSaving) {
      if (!effectiveEventId) {
        setSaveError("Event ID belum diisi. Isi dulu supaya bisa simpan.")
      }
      return
    }

    setIsSaving(true)
    setSaveError("")

    const payload = {
      formName: formTitle || `Registration Form - ${displayEventTitle}`,
      fixedFields: activeFixFields.map((field) => ({
        key: field.name,
        label: field.label,
        type: mapFieldType(field.type),
        ...(field.required ? { required: true } : {}),
      })),
      customQuestions: customFields.map((field) => ({
        key: normalizeKey(field.label),
        label: field.label,
        type: mapFieldType(field.type),
        ...(supportsOptions(field.type) && (field.options ?? []).length > 0
          ? { options: (field.options ?? []).map((option) => option.trim()).filter(Boolean) }
          : {}),
      })),
      publish: true,
    }

    const result = await api.put(
      `/api/v1/form-builder/events/${effectiveEventId}`,
      payload
    )
    setIsSaving(false)

    if (result.error) {
      setSaveError(result.message)
      return
    }

    dispatch(
      addForm({
        event_id: effectiveEventId,
        data: {
          title: formTitle || `Registration Form - ${displayEventTitle}`,
          custom_fields: customFields.map((field, index) => ({
            ...field,
            order: activeFixFields.length + index + 1,
          })),
        },
      })
    )

    navigate(`/events/${effectiveEventId}/analytics`)
  }

  return (
    <MainLayout
      title=""
      subtitle=""
      actions={
        <Button variant="outline" onClick={() => navigate("/events")}>
          <ArrowLeft size={16} />
          Back
        </Button>
      }
    >
      <div className="mx-auto max-w-[1280px] space-y-10">
        {!event ? (
          <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-sm font-semibold">
              Event ID belum terdeteksi dari list event. Masukkan manual untuk testing.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                value={manualEventId}
                onChange={(event) => setManualEventId(event.target.value)}
                placeholder="Contoh: EVT-001 atau ID dari backend"
                className="min-w-[260px] flex-1 rounded-[12px] border border-amber-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200/70"
              />
              <span className="text-xs text-amber-700">
                Setelah diisi, tombol Save akan memakai ID ini.
              </span>
            </div>
            {isLoadingForm ? (
              <p className="mt-3 text-xs font-medium text-amber-700">Loading form dari server...</p>
            ) : null}
            {loadError ? (
              <p className="mt-3 text-xs font-semibold text-red-600">{loadError}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <button onClick={() => navigate("/events")} className="transition hover:text-primary">
                Events
              </button>
              <span>&gt;</span>
              <span className="font-medium text-neutral-700">{displayEventTitle}</span>
            </div>
            <h1 className="text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-primary">
              {currentFormTitle}
            </h1>
          </div>
          <Button className="min-w-[180px] self-start px-6 py-4 text-base">
            <Pencil size={18} />
            Edit Form
          </Button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <section className="space-y-5">
              <div className="flex items-center gap-3 text-primary">
                <Lock size={24} />
                <h2 className="text-[2rem] font-bold leading-tight">
                  Standard Fields (Required - Cannot be edited)
                </h2>
              </div>
              <div className="rounded-[22px] border border-[#D7E1F0] bg-[#EDF3FF] p-6 shadow-[0_6px_30px_rgba(10,38,71,0.06)] sm:p-8">
                {!existingForm ? (
                  <div className="mb-6 space-y-2">
                    <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-neutral-600">
                      Form Title
                    </label>
                    <input
                      value={formTitle}
                      onChange={(event) => setFormTitle(event.target.value)}
                      placeholder={`Registration Form - ${displayEventTitle}`}
                      className="w-full rounded-[18px] border border-[#DCE5F2] bg-white px-5 py-4 text-lg text-neutral-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                ) : null}
                <div className="grid gap-5 md:grid-cols-2">
                  {activeFixFields.map((field) => (
                    <div key={field.name} className="space-y-3">
                      <p className="text-sm font-bold uppercase tracking-[0.08em] text-neutral-700">
                        {field.label.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                      </p>
                      {field.name === "jenis_industri" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 text-sm text-neutral-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                            <select
                              value={selectedIndustry}
                              onChange={(event) =>
                                setSelectedIndustry(event.target.value as (typeof industryOptions)[number])
                              }
                              className="w-full bg-transparent outline-none"
                            >
                              {industryOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <ChevronsUpDown size={18} className="shrink-0 text-neutral-400" />
                          </div>
                          {selectedIndustry === "Other" ? (
                            <input
                              value={otherIndustry}
                              onChange={(event) => setOtherIndustry(event.target.value)}
                              placeholder="Isi jenis perusahaan lainnya"
                              className="w-full rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 text-[1rem] text-neutral-700 outline-none shadow-[0_2px_8px_rgba(15,23,42,0.04)] focus:border-primary focus:ring-2 focus:ring-primary/15"
                            />
                          ) : null}
                        </div>
                      ) : (
                        <div className="flex items-center rounded-[16px] border border-[#DCE5F2] bg-white px-6 py-5 text-[1.05rem] text-neutral-400 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                          Read-only field
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="max-w-3xl text-[2rem] font-bold leading-tight text-primary">
                  Custom Fields (Dynamic - based on industry segmentation)
                </h2>
                {!existingForm ? (
                  <button
                    onClick={openCreateEditor}
                    className="inline-flex min-w-[240px] items-center justify-center gap-3 rounded-full border border-[#CED7E8] bg-white px-6 py-4 text-lg font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/5"
                  >
                    <Plus size={20} />
                    Add Custom Field
                  </button>
                ) : null}
              </div>

              <div className="space-y-4">
                {shownFields.length > 0 ? (
                  shownFields.map((field, index) => {
                    const Icon = fieldIcon(field.type)
                    return (
                      <div
                        key={hasPersistedId(field) ? field.id : `${field.label}-${index}`}
                        className="rounded-[22px] border border-[#E6EAF1] bg-white px-6 py-6 shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-5">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#EEF4FF] text-[#2F5BFF]">
                              <Icon size={28} />
                            </div>
                            <div className="space-y-2">
                              <p className="text-[2rem] font-bold leading-none text-primary">{field.label}</p>
                              <p className="text-sm font-semibold uppercase tracking-[0.02em] text-neutral-500">
                                Type: {typeLabels[field.type]}
                                {field.required ? " - Required" : ""}
                                {field.options?.length ? ` - ${field.options.length} options` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <button
                              onClick={() =>
                                setPreviewField({
                                  label: field.label,
                                  type: field.type,
                                  required: field.required,
                                  options: field.options ?? [],
                                  placeholder: field.placeholder ?? "",
                                  condition: field.condition,
                                })
                              }
                              className="rounded-full p-2.5 text-neutral-600 transition hover:bg-neutral-100"
                            >
                              <Eye size={22} />
                            </button>
                            <button
                              onClick={() => openEditEditor(field, index)}
                              className="rounded-full p-2.5 text-neutral-600 transition hover:bg-neutral-100"
                            >
                              <Pencil size={24} />
                            </button>
                            {hasPersistedId(field) && existingForm ? (
                              <button
                                onClick={() =>
                                  dispatch(
                                    deleteCustomField({
                                      form_id: existingForm.form_id,
                                      field_id: field.id,
                                    })
                                  )
                                }
                                className="rounded-full p-2.5 text-danger transition hover:bg-danger/10"
                              >
                                <Trash2 size={24} />
                              </button>
                            ) : (
                              <button
                                onClick={() => removeDraftField(index)}
                                className="rounded-full p-2.5 text-danger transition hover:bg-danger/10"
                              >
                                <Trash2 size={24} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 rounded-[18px] border border-[#E7EDF7] bg-[#F9FBFF] p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            Read Preview
                          </p>
                          {previewForField({
                            label: field.label,
                            type: field.type,
                            required: field.required,
                            options: field.options ?? [],
                            placeholder: field.placeholder ?? "",
                            condition: field.condition,
                          })}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[#CED7E8] bg-white px-8 py-10 text-center text-neutral-500">
                    Belum ada custom field. Tambahkan field baru untuk segmentasi peserta.
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-[#D7E1F0] bg-[#EAF1FF] p-7 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
              {existingForm ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[1.7rem] font-extrabold uppercase tracking-[0.08em] text-primary">
                      Registration Link
                    </p>
                    <div className="rounded-[18px] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                      <p className="text-sm font-bold uppercase tracking-[0.12em] text-neutral-600">
                        Public URL
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <code className="min-w-0 flex-1 truncate bg-transparent p-0 text-base text-primary">
                          {existingForm.link_pendaftaran}
                        </code>
                        <button className="rounded-[14px] bg-[#DCE7FF] p-3 text-primary transition hover:bg-[#cad9ff]">
                          <Copy size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-[1.7rem] font-extrabold uppercase tracking-[0.08em] text-primary">
                    Registration Access
                  </p>
                  <div className="rounded-[18px] bg-white px-6 py-10 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                    <p className="text-lg font-semibold text-primary">Belum tersedia</p>
                    <p className="mt-3 text-sm text-neutral-500">
                      Link dan QR code akan muncul setelah kamu submit registration form ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {showFieldEditor ? (
          <div className="rounded-[22px] border border-[#D7E1F0] bg-[#F8FBFF] p-6 shadow-[0_8px_24px_rgba(10,38,71,0.05)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-primary">
                  {editorState.mode === "edit" ? "Edit Custom Field" : "Create Custom Field"}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Custom field sekarang mendukung CRUD penuh, termasuk option untuk field pilihan.
                </p>
              </div>
              <span className="rounded-full bg-primary/8 px-4 py-2 text-sm font-semibold text-primary">
                {currentTypeMeta?.label}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold uppercase tracking-[0.08em] text-neutral-600">
                  Field Label
                </label>
                <input
                  value={fieldDraft.label}
                  onChange={(event) =>
                    setFieldDraft((current) => ({ ...current, label: event.target.value }))
                  }
                  placeholder="Contoh: Sumber informasi event"
                  className="w-full rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold uppercase tracking-[0.08em] text-neutral-600">
                  Field Type
                </label>
                <select
                  value={fieldDraft.type}
                  onChange={(event) =>
                    setFieldDraft((current) => ({
                      ...current,
                      type: event.target.value as CustomField["type"],
                      options: supportsOptions(event.target.value as CustomField["type"])
                        ? current.options ?? []
                        : [],
                    }))
                  }
                  className="w-full rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold uppercase tracking-[0.08em] text-neutral-600">
                  Placeholder
                </label>
                <input
                  value={fieldDraft.placeholder ?? ""}
                  onChange={(event) =>
                    setFieldDraft((current) => ({ ...current, placeholder: event.target.value }))
                  }
                  disabled={supportsOptions(fieldDraft.type)}
                  placeholder={fieldDraft.type === "textarea" ? "Jawaban panjang" : "Jawaban singkat"}
                  className="w-full rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 outline-none transition disabled:bg-neutral-100 disabled:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              {supportsOptions(fieldDraft.type) ? (
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <label className="block text-sm font-semibold uppercase tracking-[0.08em] text-neutral-600">
                      Options
                    </label>
                    <button
                      onClick={addOption}
                      className="inline-flex items-center gap-2 rounded-full border border-[#CED7E8] bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/5"
                    >
                      <Plus size={14} />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(fieldDraft.options ?? []).length > 0 ? (
                      (fieldDraft.options ?? []).map((option, index) => (
                        <div key={`${option}-${index}`} className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EEF4FF] text-sm font-bold text-[#2F5BFF]">
                            {index + 1}
                          </div>
                          <input
                            value={option}
                            onChange={(event) => updateOption(index, event.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                          <button
                            onClick={() => removeOption(index)}
                            className="rounded-full p-3 text-danger transition hover:bg-danger/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[16px] border border-dashed border-[#DCE5F2] bg-white px-5 py-4 text-sm text-neutral-500">
                        Belum ada option. Tambahkan option pertama.
                      </div>
                    )}
                  </div>

                  {fieldDraft.type === "radio" ? (
                    <p className="text-xs text-neutral-500">
                      Radiobutton mendukung CRUD option, tapi tidak ada custom point atau custom
                      &quot;Other&quot;.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={fieldDraft.required}
                  onChange={(event) =>
                    setFieldDraft((current) => ({ ...current, required: event.target.checked }))
                  }
                />
                Required field
              </label>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={saveField}>
                  {editorState.mode === "edit" ? "Save Field" : "Add Field"}
                </Button>
                <Button size="sm" variant="outline" onClick={closeEditor}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-[18px] border border-[#DCE5F2] bg-white p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Preview
              </p>
              <div className="space-y-3">
                <p className="text-lg font-semibold text-primary">
                  {fieldDraft.label || "Untitled Question"}
                </p>
                {previewForField(fieldDraft)}
              </div>
            </div>
          </div>
        ) : null}

        {previewField ? (
          <div className="rounded-[22px] border border-[#D7E1F0] bg-white p-6 shadow-[0_8px_24px_rgba(10,38,71,0.05)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-primary">Submitted Style Preview</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Preview ini membantu lihat tampilan field seperti yang akan disubmit.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setPreviewField(null)}>
                Close
              </Button>
            </div>
            <div className="rounded-[18px] border border-[#E7EDF7] bg-[#F9FBFF] p-5">
              <p className="mb-3 text-lg font-semibold text-primary">{previewField.label}</p>
              {previewForField(previewField)}
            </div>
          </div>
        ) : null}

        <div className="border-t border-neutral-200 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={() => navigate("/events")}
              className="px-4 py-3 text-xl font-semibold text-neutral-600 transition hover:text-primary"
            >
              Discard Changes
            </button>
            <div className="flex flex-col items-end gap-2">
              {saveError ? (
                <p className="text-sm font-medium text-danger">{saveError}</p>
              ) : null}
              <Button
                onClick={saveForm}
                disabled={Boolean(existingForm) || isSaving}
                className="min-w-[250px] justify-center px-8 py-5 text-2xl font-bold shadow-[0_18px_35px_rgba(10,38,71,0.18)]"
              >
                {existingForm ? "Saved" : isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default RegistrationFormPage
