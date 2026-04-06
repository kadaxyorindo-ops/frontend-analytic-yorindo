import { useMemo, useState, type FormEvent } from "react"
import { LogIn } from "lucide-react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import Button from "@/components/Button"
import { login } from "@/store/authSlice"
import type { User } from "@/types/user"
import { mockUsers } from "@/utils/mockData"
import { validateEmail } from "@/utils/validators"

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState("hugoestowork@gmail.com")
  const [selectedRole, setSelectedRole] = useState<"exhibitor" | "super_admin">(
    "exhibitor"
  )

  const selectedUser = useMemo<User | undefined>(() => {
    return mockUsers.find((user) => user.role === selectedRole)
  }, [selectedRole])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateEmail(email) || !selectedUser) return

    dispatch(login({ ...selectedUser, email }))
    navigate("/events")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eff6ff_45%,#ffffff_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(10,38,71,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">
              Exhibition Management System
            </div>
            <h1 className="max-w-md text-[2rem] font-bold leading-tight text-white">
              Kelola event, registrasi, survey, dan analytics dalam satu dashboard.
            </h1>
            <p className="max-w-lg text-sm text-white/75">
              Yorindo EMS membantu tim EO dan exhibitor memonitor performa event
              dengan alur kerja yang lebih rapi dan cepat.
            </p>
          </div>
          <div className="glass-panel rounded-card p-4 text-sm text-white/85">
            <p className="font-semibold text-white">Demo Credentials</p>
            <p className="mt-2">Super Admin: `admin@yorindo.com`</p>
            <p>Exhibitor: `hugoestowork@gmail.com`</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="text-sm font-medium text-secondary">Welcome back</p>
              <h1 className="mt-2 text-neutral-900">Masuk ke Yorindo EMS</h1>
              <p className="mt-2 text-sm text-neutral-500">
                Pilih role demo lalu masuk untuk melihat akses sesuai user.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("exhibitor")
                      setEmail("hugoestowork@gmail.com")
                    }}
                    className={`rounded-card border p-3 text-left transition ${
                      selectedRole === "exhibitor"
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-primary/30"
                    }`}
                  >
                    <p className="font-semibold text-neutral-900">Exhibitor</p>
                    <p className="mt-1 text-xs text-neutral-500">Hanya event milik sendiri</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("super_admin")
                      setEmail("admin@yorindo.com")
                    }}
                    className={`rounded-card border p-3 text-left transition ${
                      selectedRole === "super_admin"
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-primary/30"
                    }`}
                  >
                    <p className="font-semibold text-neutral-900">Super Admin</p>
                    <p className="mt-1 text-xs text-neutral-500">Akses seluruh event</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">Password</label>
                <input
                  type="password"
                  defaultValue="password123"
                  className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button type="submit" fullWidth className="py-3">
                <LogIn size={16} />
                Masuk
              </Button>
            </form>

            <p className="mt-6 text-sm text-neutral-500">
              Belum punya akun exhibitor?{" "}
              <Link to="/register" className="font-semibold text-primary">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
