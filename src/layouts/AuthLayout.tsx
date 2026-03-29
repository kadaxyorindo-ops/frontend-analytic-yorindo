import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left Panel Placeholder */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-slate-100 border-r-2 border-dashed border-slate-300">
        <div className="text-center space-y-4 text-slate-400 font-mono">
          <div className="w-16 h-16 mx-auto bg-slate-200 border-2 border-dashed border-slate-400 rounded" />
          <p>[Branding & Hero Content Area]</p>
        </div>
      </div>

      {/* Right Panel - Dynamic Content */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] border-2 border-dashed border-slate-300 bg-white p-8 rounded-xl min-h-[400px]">
          <div className="text-slate-400 font-mono text-sm mb-6 pb-2 border-b border-dashed border-slate-200">
            [Form Component Area]
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}