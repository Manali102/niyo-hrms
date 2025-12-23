"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Theme toggle button for switching between light and dark mode
 * @returns JSX.Element
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => setMounted(true), []);

  // Determine if current theme is dark
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-full
                 bg-[rgb(var(--color-surface))] hover:bg-[rgb(var(--color-border))]
                 border border-[rgb(var(--color-border))]
                 transition-all duration-300 ease-in-out"
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
          isDark
            ? "bg-[rgb(var(--color-accent))]"
            : "bg-[rgb(var(--color-border))]"
        }`}
      >
        {mounted && (
          isDark ? (
            <Moon className="w-4 h-4 text-[rgb(var(--color-text))]" />
          ) : (
            <Sun className="w-4 h-4 text-[rgb(var(--color-text))]" />
          )
        )}
      </div>
    </button>
  );
}
