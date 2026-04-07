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
  X,
  Trash2,
  Type,
} from "lucide-react"
import MainLayout from "@/components/Layout/MainLayout"
import Button from "@/components/Button"
import { addForm, updateForm } from "@/store/registrationFormSlice"
import { api } from "@/services/api"
import type { RootState } from "@/store/store"
import type { CustomField, FixField, RegistrationForm } from "@/types/registration-form"
import { defaultFixFields } from "@/utils/mockData"

type DraftField = {
  localId: string
  fieldId?: string
  key?: string
  label: string
  type: CustomField["type"]
  options?: string[]
  required: boolean
  placeholder?: string
  condition?: {
    dependsOn: string
    value: string
  }
}
type EditorState =
  | { mode: "create"; localId: null }
  | { mode: "edit"; localId: string }

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

const createLocalId = () =>
  `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const emptyDraft = (): DraftField => ({
  localId: createLocalId(),
  label: "",
  type: "text",
  required: false,
  options: [],
  placeholder: "",
  condition: undefined,
})

type BackendField = {
  fieldId?: string
  key?: string
  label?: string
  type?: string
  required?: boolean
  isActive?: boolean
  order?: number
  placeholder?: string
  condition?: DraftField["condition"]
  validation?: { required?: boolean }
  options?: Array<string | { value?: string; label?: string }>
}

const toDraftField = (field: BackendField, index = 0): DraftField => {
  const rawOptions = field.options ?? []
  const options = rawOptions
    .map((option) => {
      if (typeof option === "string") return option
      return option.value ?? option.label ?? ""
    })
    .filter(Boolean)

  return {
    localId: createLocalId(),
    fieldId: field.fieldId,
    key: field.key,
    label: field.label ?? field.key ?? `Question ${index + 1}`,
    type: mapCustomFieldType(field.type),
    required: Boolean(field.required ?? field.validation?.required),
    options,
    placeholder: field.placeholder ?? "",
    condition: field.condition,
  }
}

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

function mapFixedFieldType(type?: string): FixField["type"] {
  if (type === "email") return "email"
  if (type === "phone" || type === "tel") return "tel"
  return "text"
}

function mapCustomFieldType(type?: string): CustomField["type"] {
  if (!type) return "text"
  if (type === "tel") return "phone"
  return type as CustomField["type"]
}

function buildRegistrationLink(eventId: string, slug?: string) {
  const identifier = slug?.trim() || eventId
  return `${window.location.origin}/register/${identifier}`
}

function buildRegistrationQr(link: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`
}

const RegistrationFormPage = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { events } = useSelector((state: RootState) => state.events)
  const { forms } = useSelector((state: RootState) => state.registrationForms)
  const [formTitle, setFormTitle] = useState("")
  const [customFields, setCustomFields] = useState<DraftField[]>([])
  const [fieldDraft, setFieldDraft] = useState<DraftField>(emptyDraft())
  const [selectedIndustry, setSelectedIndustry] = useState<(typeof industryOptions)[number]>("Elektronik & Peralatan Rumah Tangga")
  const [otherIndustry, setOtherIndustry] = useState("")
  const [showFieldEditor, setShowFieldEditor] = useState(false)
  const [previewField, setPreviewField] = useState<DraftField | null>(null)
  const [editorState, setEditorState] = useState<EditorState>({ mode: "create", localId: null })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [remoteForm, setRemoteForm] = useState<RegistrationForm | null>(null)
  const [remoteFixFields, setRemoteFixFields] = useState<FixField[] | null>(null)

  const effectiveEventId = (eventId ?? "").trim()
  const event = events.find((item) => item.event_id === effectiveEventId)
  const existingForm = forms.find((item) => item.event_id === effectiveEventId)
  const persistedForm = existingForm ?? remoteForm
  const displayEventTitle = event?.title || (effectiveEventId ? `Event ${effectiveEventId}` : "Event Manual")
  const activeFixFields = remoteFixFields ?? defaultFixFields
  const shownFields = customFields
  const currentFormTitle = formTitle || `Registration Form - ${displayEventTitle}`

  const currentTypeMeta = useMemo(
    () => typeOptions.find((option) => option.value === fieldDraft.type),
    [fieldDraft.type]
  )

  useEffect(() => {
    if (!persistedForm) return

    setFormTitle(persistedForm.title)
    setCustomFields(
      persistedForm.custom_fields.map((field, index) =>
        toDraftField(
          {
            fieldId: field.id,
            key: field.id,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options ?? [],
            placeholder: field.placeholder ?? "",
            condition: field.condition,
          },
          index
        )
      )
    )
  }, [persistedForm])

  const normalizeKey = (label: string) =>
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")

  const mapFieldType = (type: string) => (type === "tel" ? "phone" : type)

  useEffect(() => {
    if (!effectiveEventId || existingForm) return

    const loadForm = async () => {
      setIsLoadingForm(true)
      setLoadError("")

      const result = await api.get<unknown>(
        `/api/v1/form-builder/events/${effectiveEventId}`
      )
      console.log("[FormBuilder] GET /api/v1/form-builder/events response:", result)

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

      const fixedSource = (
        payload.fixedFields ??
        payload.fixed_fields ??
        []
      ) as Array<{
        key?: string
        name?: string
        label?: string
        type?: string
        required?: boolean
        isActive?: boolean
        order?: number
        validation?: { required?: boolean }
      }>

      const customSource = (
        payload.customQuestions ??
        payload.custom_questions ??
        payload.customFields ??
        payload.custom_fields ??
        payload.questions ??
        []
      ) as Array<{
        fieldId?: string
        key?: string
        name?: string
        label?: string
        type?: string
        required?: boolean
        isActive?: boolean
        order?: number
        placeholder?: string
        condition?: DraftField["condition"]
        validation?: { required?: boolean }
        options?: Array<string | { value?: string; label?: string }>
      }>

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
        .map((field, index) => ({
          id: field.fieldId ?? field.key ?? field.name ?? `custom-${index + 1}`,
          label: field.label ?? field.key ?? field.name ?? `Question ${index + 1}`,
          type: mapCustomFieldType(field.type),
          required: Boolean(field.required ?? field.validation?.required),
          options: (field.options ?? [])
            .map((option) => {
              if (typeof option === "string") return option
              return option.value ?? option.label ?? ""
            })
            .filter(Boolean),
          placeholder: field.placeholder ?? "",
          condition: field.condition,
          order: field.order ?? fixedFields.length + index + 1,
        }))

      console.log("[FormBuilder] Parsed payload:", payload)
      console.log("[FormBuilder] Mapped fixed fields:", fixedFields)
      console.log("[FormBuilder] Mapped custom fields:", customFields)

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

      if (!existingForm) {
        setCustomFields(customSource.filter((field) => field?.isActive !== false).map(toDraftField))
      }
    }

    void loadForm()
  }, [displayEventTitle, effectiveEventId, existingForm])

  const openCreateEditor = () => {
    setEditorState({ mode: "create", localId: null })
    setFieldDraft(emptyDraft())
    setShowFieldEditor(true)
  }

  const openEditEditor = (field: DraftField) => {
    setEditorState({ mode: "edit", localId: field.localId })
    setFieldDraft({ ...field })
    setShowFieldEditor(true)
  }

  const closeEditor = () => {
    setShowFieldEditor(false)
    setFieldDraft(emptyDraft())
    setEditorState({ mode: "create", localId: null })
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
      localId:
        editorState.mode === "edit" ? editorState.localId : fieldDraft.localId,
      fieldId: fieldDraft.fieldId,
      key: fieldDraft.key || normalizeKey(fieldDraft.label),
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
      setCustomFields((current) =>
        current.map((field) =>
          field.localId === editorState.localId ? cleaned : field
        )
      )
    } else {
      setCustomFields((current) => [...current, cleaned])
    }

    closeEditor()
  }

  const removeDraftField = (localId: string) => {
    setCustomFields((current) => current.filter((field) => field.localId !== localId))
  }

  const copyRegistrationLink = async () => {
    if (!persistedForm?.link_pendaftaran) {
      return
    }

    try {
      await navigator.clipboard.writeText(persistedForm.link_pendaftaran)
      setSaveMessage("Registration link berhasil disalin.")
      setSaveError("")
    } catch {
      setSaveError("Registration link gagal disalin.")
    }
  }

  const saveForm = async () => {
    if (!effectiveEventId || isSaving) {
      if (!effectiveEventId) {
        setSaveError("Event ID belum diisi. Isi dulu supaya bisa simpan.")
      }
      return
    }

    setIsSaving(true)
    setSaveError("")
    setSaveMessage("")

    const payload = {
      formName: formTitle || `Registration Form - ${displayEventTitle}`,
      fixedFields: activeFixFields.map((field, index) => ({
        key: field.name,
        label: field.label,
        type: mapFieldType(field.type),
        order: field.order ?? index + 1,
        isFixed: true,
        isActive: true,
        validation: {
          required: Boolean(field.required),
        },
      })),
      customQuestions: customFields.map((field, index) => ({
        fieldId: field.fieldId,
        key: field.key || normalizeKey(field.label),
        label: field.label,
        type: mapFieldType(field.type),
        placeholder: supportsOptions(field.type) ? undefined : field.placeholder || undefined,
        order: activeFixFields.length + index + 1,
        isFixed: false,
        isActive: true,
        validation: {
          required: Boolean(field.required),
        },
        ...(supportsOptions(field.type) && (field.options ?? []).length > 0
          ? {
              options: (field.options ?? [])
                .map((option) => option.trim())
                .filter(Boolean)
                .map((option) => ({
                  value: option,
                  label: option,
                  isDefault: false,
                })),
            }
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

    const data = result.data as
      | {
          event?: { slug?: string; title?: string }
          formName?: string | null
          fixedFields?: BackendField[]
          customQuestions?: BackendField[]
          version?: number
          publishedAt?: string | null
        }
      | null

    const nextFixedFields =
      (data?.fixedFields ?? []).length > 0
        ? (data?.fixedFields ?? []).map((field, index) => ({
            name: field.key ?? `field_${index + 1}`,
            label: field.label ?? field.key ?? `Field ${index + 1}`,
            type: mapFixedFieldType(field.type),
            required: Boolean(field.required ?? field.validation?.required),
            order: field.order ?? index + 1,
          }))
        : activeFixFields

    const nextCustomFields = (data?.customQuestions ?? []).map((field) =>
      toDraftField(field)
    )

    setCustomFields(nextCustomFields)

    const publicLink = buildRegistrationLink(
      effectiveEventId,
      data?.event?.slug
    )

    const syncedForm = {
      form_id: persistedForm?.form_id ?? `FORM-${Date.now()}`,
      event_id: effectiveEventId,
      title: data?.formName ?? (formTitle || `Registration Form - ${displayEventTitle}`),
      fix_fields: nextFixedFields,
      custom_fields: (nextCustomFields.length > 0 ? nextCustomFields : customFields).map((field, index) => ({
        id: field.fieldId ?? field.key ?? `custom-${Date.now()}-${index}`,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options ?? [],
        placeholder: field.placeholder ?? "",
        condition: field.condition,
        order: nextFixedFields.length + index + 1,
      })),
      link_pendaftaran: publicLink,
      qr_code: buildRegistrationQr(publicLink),
      is_active: true,
      created_at: persistedForm?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existingForm) {
      dispatch(
        updateForm({
          form_id: existingForm.form_id,
          updates: syncedForm,
        })
      )
    } else {
      dispatch(
        addForm({
          event_id: effectiveEventId,
          data: {
            title: syncedForm.title,
            custom_fields: syncedForm.custom_fields.map((field, index) => ({
              label: field.label,
              type: field.type,
              required: field.required,
              options: field.options ?? [],
              placeholder: field.placeholder,
              condition: field.condition,
              order: nextFixedFields.length + index + 1,
            })),
          },
        })
      )
    }

    setRemoteForm(syncedForm)
    setRemoteFixFields(nextFixedFields)
    setFormTitle(syncedForm.title)
    setSaveMessage("Form builder berhasil disimpan ke database.")
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1320px] space-y-10">
        <div className="overflow-hidden rounded-[30px] border border-[#D7E1F0] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF4FF_55%,#F8FAFD_100%)] px-8 py-8 shadow-[0_18px_40px_rgba(10,38,71,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <button onClick={() => navigate("/events")} className="transition hover:text-primary">
                Event Management
              </button>
              <span>&gt;</span>
              <span className="font-medium text-neutral-700">{displayEventTitle}</span>
            </div>
            <h1 className="text-[2.35rem] font-bold leading-[1.05] tracking-[-0.04em] text-[#0A2647]">
              {currentFormTitle}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[#5B6B7F]">
              Susun field registrasi, cek preview tiap pertanyaan, dan simpan perubahan dengan tampilan kerja yang lebih rapi untuk operator event.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/events")} className="rounded-[16px] border-[#C9D7F3] px-5 py-3 text-sm font-semibold">
              <ArrowLeft size={16} />
              Back to Events
            </Button>
            <Button
              onClick={openCreateEditor}
              className="rounded-[16px] border border-[#0A2647] bg-[#0A2647] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(10,38,71,0.18)] hover:bg-[#133A6F]"
            >
              <Plus size={16} />
              Add Custom Field
            </Button>
          </div>
        </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-white/80 bg-white/80 px-5 py-4 shadow-[0_10px_24px_rgba(10,38,71,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Event</p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">{displayEventTitle}</p>
            </div>
            <div className="rounded-[18px] border border-white/80 bg-white/80 px-5 py-4 shadow-[0_10px_24px_rgba(10,38,71,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Standard Fields</p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">{activeFixFields.length} read-only fields</p>
            </div>
            <div className="rounded-[18px] border border-white/80 bg-white/80 px-5 py-4 shadow-[0_10px_24px_rgba(10,38,71,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Custom Fields</p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">{shownFields.length} field aktif</p>
            </div>
          </div>
        </div>
        {isLoadingForm || loadError ? (
          <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            {isLoadingForm ? (
              <p className="mt-3 text-xs font-medium text-amber-700">Loading form dari server...</p>
            ) : null}
            {loadError ? (
              <p className="mt-3 text-xs font-semibold text-red-600">{loadError}</p>
            ) : null}
          </div>
        ) : null}


        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <section className="space-y-5">
              <div className="flex items-center gap-3 text-primary">
                <Lock size={24} />
                <h2 className="text-[2rem] font-bold leading-tight">
                  Standard Fields
                </h2>
              </div>
              <p className="-mt-2 text-sm leading-7 text-[#5B6B7F]">
                Bagian ini menampilkan field utama yang selalu tersedia di form registrasi dan tidak diubah dari builder.
              </p>
              <div className="rounded-[22px] border border-[#D7E1F0] bg-[#EDF3FF] p-6 shadow-[0_6px_30px_rgba(10,38,71,0.06)] sm:p-8">
                {!persistedForm ? (
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
                  Custom Fields
                </h2>
                <button
                  onClick={openCreateEditor}
                  className="inline-flex min-w-[240px] items-center justify-center gap-3 rounded-[18px] border border-[#0A2647] bg-[#0A2647] px-6 py-4 text-base font-semibold text-white shadow-[0_14px_28px_rgba(10,38,71,0.16)] transition hover:bg-[#133A6F]"
                >
                  <Plus size={20} />
                  Add Custom Field
                </button>
              </div>
              <p className="-mt-2 text-sm leading-7 text-[#5B6B7F]">
                Tambahkan pertanyaan khusus sesuai kebutuhan event. Semua field bisa dipreview, diedit, dan dihapus dari satu area kerja yang sama.
              </p>

              <div className="space-y-4">
                {shownFields.length > 0 ? (
                  shownFields.map((field) => {
                    const Icon = fieldIcon(field.type)
                    return (
                      <div
                        key={field.localId}
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
                                  localId: field.localId,
                                  fieldId: field.fieldId,
                                  key: field.key,
                                  label: field.label,
                                  type: field.type,
                                  required: field.required,
                                  options: field.options ?? [],
                                  placeholder: field.placeholder ?? "",
                                  condition: field.condition,
                                })
                              }
                              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#DCE5F2] bg-white text-neutral-700 shadow-[0_6px_18px_rgba(15,23,42,0.07)] transition hover:border-primary/30 hover:bg-[#F5F8FF] hover:text-primary"
                            >
                              <Eye size={22} />
                            </button>
                            <button
                              onClick={() => openEditEditor(field)}
                              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#DCE5F2] bg-white text-neutral-700 shadow-[0_6px_18px_rgba(15,23,42,0.07)] transition hover:border-primary/30 hover:bg-[#F5F8FF] hover:text-primary"
                            >
                              <Pencil size={24} />
                            </button>
                              <button
                                onClick={() => removeDraftField(field.localId)}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-danger/20 bg-white text-danger shadow-[0_6px_18px_rgba(15,23,42,0.07)] transition hover:bg-danger/10"
                              >
                                <Trash2 size={24} />
                              </button>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[18px] border border-[#E7EDF7] bg-[#F9FBFF] p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            Read Preview
                          </p>
                          {previewForField({
                            localId: field.localId,
                            fieldId: field.fieldId,
                            key: field.key,
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
              {persistedForm ? (
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
                          {persistedForm.link_pendaftaran}
                        </code>
                        <button
                          type="button"
                          onClick={() => void copyRegistrationLink()}
                          className="rounded-[14px] border border-primary/10 bg-[#DCE7FF] p-3 text-primary transition hover:bg-[#cad9ff]"
                        >
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
            <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
                Quick Actions
              </p>
              <div className="mt-4 space-y-3">
                <Button
                  onClick={saveForm}
                  disabled={isSaving}
                  className="w-full justify-center rounded-[16px] border border-[#0A2647] bg-[#0A2647] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(10,38,71,0.16)] hover:bg-[#133A6F]"
                >
                  {persistedForm ? "Update Changes" : isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={openCreateEditor}
                  className="w-full justify-center rounded-[16px] border-[#C9D7F3] px-5 py-3 text-sm font-semibold"
                >
                  <Plus size={16} />
                  Add Custom Field
                </Button>
              </div>
              {saveError ? (
                <p className="mt-4 text-sm font-medium text-danger">{saveError}</p>
              ) : null}
              {saveMessage ? (
                <p className="mt-4 text-sm font-medium text-[#0A2647]">{saveMessage}</p>
              ) : null}
            </div>
          </aside>
        </div>

        {showFieldEditor ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A2647]/18 p-6 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-[#D7E1F0] bg-[#F8FBFF] p-6 shadow-[0_18px_40px_rgba(10,38,71,0.16)] md:p-8">
              <div className="mb-6 flex flex-col gap-4 border-b border-[#E4ECF6] pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {editorState.mode === "edit" ? "Edit Custom Field" : "Create Custom Field"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Atur label, tipe field, placeholder, dan option di satu panel yang sama tanpa harus scroll ke bawah halaman.
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start">
                  <span className="rounded-full bg-primary/8 px-4 py-2 text-sm font-semibold text-primary">
                    {currentTypeMeta?.label}
                  </span>
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE5F2] bg-white text-[#5B6B7F] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:text-[#0A2647]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                          type="button"
                          className="inline-flex items-center gap-2 rounded-[14px] border border-[#0A2647] bg-[#0A2647] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:bg-[#133A6F]"
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
                                type="button"
                                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-danger/20 bg-white text-danger transition hover:bg-danger/10"
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
                          Radiobutton mendukung CRUD option, tapi tidak ada custom point atau custom &quot;Other&quot;.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="md:col-span-2 flex flex-col gap-4 border-t border-[#E4ECF6] pt-5 sm:flex-row sm:items-center sm:justify-between">
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
                      <Button
                        size="sm"
                        onClick={saveField}
                        className="rounded-[14px] border border-[#0A2647] bg-[#0A2647] px-5 py-3 text-sm font-semibold text-white hover:bg-[#133A6F]"
                      >
                        {editorState.mode === "edit" ? "Save Field" : "Add Field"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={closeEditor} className="rounded-[14px] border-[#C9D7F3] px-5 py-3 text-sm font-semibold">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#DCE5F2] bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-600">Preview</p>
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-primary">{fieldDraft.label || "Untitled Question"}</p>
                    {previewForField(fieldDraft)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {previewField ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A2647]/18 p-6 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-[28px] border border-[#D7E1F0] bg-white p-6 shadow-[0_18px_40px_rgba(10,38,71,0.16)] md:p-8">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#E4ECF6] pb-5">
                <div>
                  <h3 className="text-2xl font-bold text-primary">Submitted Style Preview</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Preview ini membantu lihat tampilan field seperti yang akan disubmit.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setPreviewField(null)} className="rounded-[14px] border-[#C9D7F3] px-5 py-3 text-sm font-semibold">
                  Close
                </Button>
              </div>
              <div className="rounded-[18px] border border-[#E7EDF7] bg-[#F9FBFF] p-5">
                <p className="mb-3 text-lg font-semibold text-primary">{previewField.label}</p>
                {previewForField(previewField)}
              </div>
            </div>
          </div>
        ) : null}

        <div className="border-t border-neutral-200 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={() => navigate("/events")}
              className="rounded-[16px] border border-neutral-200 bg-white px-6 py-4 text-lg font-semibold text-neutral-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-primary/20 hover:text-primary"
            >
              Discard Changes
            </button>
            <div className="flex flex-col items-end gap-2">
              <Button
                onClick={saveForm}
                disabled={isSaving}
                className="min-w-[260px] justify-center rounded-[18px] border border-[#0A2647] bg-[#0A2647] px-8 py-5 text-lg font-bold text-white shadow-[0_18px_35px_rgba(10,38,71,0.18)] hover:bg-[#133A6F]"
              >
                {persistedForm ? "Update Changes" : isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default RegistrationFormPage



