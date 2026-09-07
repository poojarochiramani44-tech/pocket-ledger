import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        sans: ["UberMoveText", "system-ui", "sans-serif"],
        heading: ["UberMove", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        border: "hsl(var(--border))",
        divider: "hsl(var(--divider))",
        foreground: "hsl(var(--foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          soft: "hsl(var(--primary-soft))",
          strong: "hsl(var(--primary-strong))",
        },
        income: {
          DEFAULT: "hsl(var(--income))",
          soft: "hsl(var(--income-soft))",
          muted: "hsl(var(--income-muted))",
        },
        expense: {
          DEFAULT: "hsl(var(--expense))",
          soft: "hsl(var(--expense-soft))",
          muted: "hsl(var(--expense-muted))",
        },
        overlay: "hsl(var(--overlay))",
      },
      maxHeight: {
        "txn-list": "26.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
