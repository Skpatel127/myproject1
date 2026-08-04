import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        paper: "#F6F5F2",
        surface: "#FFFFFF",
        line: "#E4E2DD",
        muted: "#6B7280",
        brand: {
          DEFAULT: "#0F6A63",
          dark: "#0B4E49",
          light: "#E4F2F0",
        },
        status: {
          healthy: "#2F7D4F",
          attention: "#C77D22",
          risk: "#B23A34",
          info: "#4A5A6A",
        },
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
