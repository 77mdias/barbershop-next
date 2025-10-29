"use client";

import React, { useEffect, useState } from "react";
import {
  ThemeContext,
  Theme,
  ResolvedTheme,
} from "@/contexts/ThemeContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Inicialização do tema
  useEffect(() => {
    setMounted(true);

    // Detecta preferência do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    // Carrega preferência salva
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    } else {
      setThemeState("system"); // Default: seguir o sistema
    }
  }, []);

  // Listener de mudanças no sistema
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mounted]);

  // Resolução do tema efetivo
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;

  // Aplicação do tema ao DOM
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme, mounted]);

  // Persistência em localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Funções de controle
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      // Se está em system, alterna baseado no tema atual do sistema
      if (prev === "system") {
        return systemTheme === "dark" ? "light" : "dark";
      }
      // Alterna entre light e dark
      return prev === "dark" ? "light" : "dark";
    });
  };

  // Evita hidratação mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
