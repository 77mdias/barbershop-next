"use client";

import React, { useEffect, useState } from "react";
import {
  ThemeContext,
  Theme,
  ResolvedTheme,
} from "@/contexts/ThemeContext";

// Função para obter o tema inicial (executa no cliente)
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch (e) {
    // localStorage não disponível
  }

  return "system"; // Default: seguir o sistema
}

// Função para detectar tema do sistema
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (e) {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Resolução do tema efetivo
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;

  // Aplicação inicial do tema (roda uma única vez)
  useEffect(() => {
    // Detecta preferência do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemDark = mediaQuery.matches;
    setSystemTheme(systemDark ? "dark" : "light");

    // Listener de mudanças no sistema
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Aplicação do tema ao DOM (sempre que o tema resolvido mudar)
  useEffect(() => {
    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  // Persistência em localStorage
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // localStorage não disponível
    }
  }, [theme]);

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
