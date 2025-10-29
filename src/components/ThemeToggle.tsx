"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={
        resolvedTheme === "dark"
          ? "Mudar para tema claro"
          : "Mudar para tema escuro"
      }
      className="relative h-9 w-9"
    >
      {/* Ícone Sol - Visível em light mode */}
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      {/* Ícone Lua - Visível em dark mode */}
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
