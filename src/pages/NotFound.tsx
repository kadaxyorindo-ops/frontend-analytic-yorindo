import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full border-2 border-dashed border-slate-300 bg-white rounded-xl p-10 text-center space-y-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-800 tracking-tighter">404</h1>
          <h2 className="text-xl font-semibold text-slate-600">Page Not Found</h2>
        </div>
        
        <p className="text-slate-500 text-sm">
          The dashboard route or event page you are looking for does not exist, has been moved, or you lack the necessary permissions.
        </p>
        
        <div className="pt-4 border-t border-dashed border-slate-200">
          <Button 
            onClick={() => navigate("/events")}
            className="w-full bg-[#1a40a8] hover:bg-blue-800"
          >
            Return to Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="w-full mt-2 text-slate-500 hover:text-slate-700"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}