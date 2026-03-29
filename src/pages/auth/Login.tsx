import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/events"); // Move to dashboard
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-sm text-gray-500">Access your event management dashboard.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Professional Email</label>
            <Input placeholder="name@company.com" />
          </div>
          
          <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900">
            Login (Test Routing)
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}