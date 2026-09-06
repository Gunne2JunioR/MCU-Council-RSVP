/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mcu: {
          primary: "#4B1F5E",
          secondary: "#6B3F83",
          gold: "#C8A54B",
          goldLight: "#F5E9C9",
          bg: "#F7F7F8",
          surface: "#FFFFFF",
          text: "#1F2937",
          muted: "#6B7280",
          border: "#E5E7EB",
          darkPurple: "#341342",
        },
        status: {
          attend: "#10B981",
          attendBg: "#ECFDF5",
          online: "#2563EB",
          onlineBg: "#EFF6FF",
          pending: "#F59E0B",
          pendingBg: "#FFFBEB",
          leave: "#EF4444",
          leaveBg: "#FEF2F2",
          unresponsive: "#6B7280",
          unresponsiveBg: "#F3F4F6",
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'Noto Sans Thai', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        hover: '0 4px 6px -1px rgba(75, 31, 94, 0.08), 0 2px 4px -1px rgba(75, 31, 94, 0.04)',
      }
    },
  },
  plugins: [],
}
