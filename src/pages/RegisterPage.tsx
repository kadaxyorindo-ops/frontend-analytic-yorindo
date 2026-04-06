import { useState, type FormEvent } from "react"
import { UserPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import Button from "@/components/Button"
import { login } from "@/store/authSlice"
import type { RegisterData, User } from "@/types/user"
import { validateEmail, validatePhone, validateRequired } from "@/utils/validators"

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    company_name: "",
    phone: "",
  })

  const handleChange = (key: keyof RegisterData, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !validateRequired(form.name) ||
      !validateRequired(form.company_name) ||
      !validateEmail(form.email) ||
      !validatePhone(form.phone)
    ) {
      return
    }

    const newUser: User = {
      id: `exhibitor-user-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: "exhibitor",
      exhibitor_id: `EXH-${Date.now()}`,
      company_name: form.company_name,
      phone: form.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    dispatch(login(newUser))
    navigate("/events")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="w-full max-w-3xl rounded-[28px] bg-white p-8 shadow-[0_20px_60px_rgba(10,38,71,0.12)] sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-secondary">Exhibitor Onboarding</p>
          <h1 className="mt-2 text-neutral-900">Daftarkan akun exhibitor baru</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Form ini menggunakan mock authentication untuk demo frontend.
          </p>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Nama Lengkap</label>
            <input
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Email</label>
            <input
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Nomor HP</label>
            <input
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700">Nama Perusahaan</label>
            <input
              value={form.company_name}
              onChange={(event) => handleChange("company_name", event.target.value)}
              className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
            <Button type="submit">
              <UserPlus size={16} />
              Buat Akun
            </Button>
            <Link to="/login" className="inline-flex">
              <span className="inline-flex items-center justify-center rounded-button border border-primary px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white">
                Kembali ke Login
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
