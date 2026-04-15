import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, GripVertical, Plus, Star, Trash2 } from "lucide-react"
import MainLayout from "@/components/Layout/MainLayout"
import Button from "@/components/Button"
import { addSurveyForm } from "@/store/surveyFormSlice"
import type { RootState } from "@/store/store"
import type { SurveyQuestion } from "@/types/survey-form"

interface NewQuestion {
  question: string
  type: "rating" | "text" | "textarea" | "select" | "radio"
  required: boolean
  options?: string[]
}

const defaultQuestions: NewQuestion[] = [
  { question: "Overall Rating", type: "rating", required: true },
  { question: "Material Quality", type: "rating", required: true },
  { question: "Speaker Performance", type: "rating", required: true },
  { question: "Facility Rating", type: "rating", required: true },
]

const SurveyFormPage = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { events } = useSelector((state: RootState) => state.events)
  const { forms } = useSelector((state: RootState) => state.surveyForms)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [questions, setQuestions] = useState<NewQuestion[]>([])
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    question: "",
    type: "text",
    required: true,
  })
  const [showAddQuestion, setShowAddQuestion] = useState(false)

  const event = events.find((item) => item.event_id === eventId)
  const existingForm = forms.find((item) => item.event_id === eventId)

  const handleAddQuestion = () => {
    if (!newQuestion.question) return
    setQuestions((current) => [...current, newQuestion])
    setNewQuestion({ question: "", type: "text", required: true })
    setShowAddQuestion(false)
  }

  const handleSaveForm = () => {
    if (!eventId || !event) return

    const allQuestions: SurveyQuestion[] = [
      ...defaultQuestions.map((question, index) => ({
        id: `default-${index}`,
        question: question.question,
        type: question.type,
        required: question.required,
        order: index + 1,
      })),
      ...questions.map((question, index) => ({
        id: `custom-${Date.now()}-${index}`,
        question: question.question,
        type: question.type,
        required: question.required,
        options: question.options,
        order: defaultQuestions.length + index + 1,
      })),
    ]

    dispatch(
      addSurveyForm({
        event_id: eventId,
        title: formTitle || `Survey Feedback - ${event.title}`,
        description: formDescription,
        questions: allQuestions,
      })
    )

    navigate(`/events/${eventId}/analytics`)
  }

  if (!event) {
    return (
      <MainLayout title="Survey Form">
        <div className="card py-16 text-center">
          <p className="text-neutral-500">Event tidak ditemukan</p>
          <Button onClick={() => navigate("/events")} className="mt-4">
            Kembali ke Events
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      title="Survey Form"
      subtitle={`Event: ${event.title}`}
      actions={
        <Button variant="outline" onClick={() => navigate("/events")}>
          <ArrowLeft size={16} />
          Back
        </Button>
      }
    >
      <div className="mx-auto max-w-5xl">
        {existingForm ? (
          <div className="card space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{existingForm.title}</h2>
              <p className="mt-1 text-sm text-success">Survey form sudah tersedia.</p>
            </div>
            <div className="space-y-2">
              {existingForm.questions.map((question) => (
                <div key={question.id} className="flex items-center gap-3 rounded-card bg-neutral-50 p-3">
                  <GripVertical size={16} className="text-neutral-400" />
                  <div className="flex-1">
                    <p className="font-medium">{question.question}</p>
                    <p className="text-xs text-neutral-500">
                      Type: {question.type}
                      {question.required ? " • Required" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Form Title</label>
              <input
                value={formTitle}
                onChange={(event) => setFormTitle(event.target.value)}
                placeholder={`Survey Feedback - ${event.title}`}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Description</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(event) => setFormDescription(event.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <h3 className="text-base font-semibold text-neutral-900">Default Rating Questions</h3>
              <div className="mt-3 space-y-2">
                {defaultQuestions.map((question) => (
                  <div key={question.question} className="flex items-center gap-3 rounded-card bg-neutral-50 p-3">
                    <Star size={16} className="text-secondary" fill="#F59E0B" />
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-xs text-neutral-500">Rating 1-5 • Required</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">Additional Questions</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Tambahkan komentar, saran, atau pertanyaan segmentasi.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAddQuestion(true)}>
                  <Plus size={14} />
                  Add Question
                </Button>
              </div>

              {questions.length > 0 ? (
                <div className="mb-4 space-y-2">
                  {questions.map((question, index) => (
                    <div key={`${question.question}-${index}`} className="flex items-center gap-3 rounded-card bg-neutral-50 p-3">
                      <GripVertical size={16} className="text-neutral-400" />
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <p className="text-xs text-neutral-500">
                          Type: {question.type}
                          {question.required ? " • Required" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setQuestions((current) =>
                            current.filter((_, currentIndex) => currentIndex !== index)
                          )
                        }
                        className="rounded-button p-2 text-danger transition hover:bg-danger/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {showAddQuestion ? (
                <div className="space-y-3 rounded-card border border-neutral-200 p-4">
                  <input
                    value={newQuestion.question}
                    onChange={(event) =>
                      setNewQuestion((current) => ({
                        ...current,
                        question: event.target.value,
                      }))
                    }
                    placeholder="Masukkan pertanyaan"
                    className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    value={newQuestion.type}
                    onChange={(event) =>
                      setNewQuestion((current) => ({
                        ...current,
                        type: event.target.value as NewQuestion["type"],
                      }))
                    }
                    className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text</option>
                    <option value="select">Select</option>
                    <option value="radio">Radio</option>
                  </select>
                  {newQuestion.type === "select" || newQuestion.type === "radio" ? (
                    <input
                      placeholder="Option 1, Option 2"
                      onChange={(event) =>
                        setNewQuestion((current) => ({
                          ...current,
                          options: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }))
                      }
                      className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : null}
                  <label className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={newQuestion.required}
                      onChange={(event) =>
                        setNewQuestion((current) => ({
                          ...current,
                          required: event.target.checked,
                        }))
                      }
                    />
                    Required question
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddQuestion}>
                      Add Question
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddQuestion(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 border-t border-neutral-100 pt-4">
              <Button onClick={handleSaveForm}>Save Survey Form</Button>
              <Button variant="outline" onClick={() => navigate("/events")}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default SurveyFormPage
