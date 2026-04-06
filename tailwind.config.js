/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A2647",
        "primary-light": "#123d6d",
        secondary: "#F59E0B",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      borderRadius: {
        button: "8px",
        card: "12px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
}
