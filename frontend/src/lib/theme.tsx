import React, { useEffect, useState } from "react";
import { ThemeContext, type Theme, useTheme } from "@/hooks/use-theme";

export { useTheme, type Theme };

const STORAGE_KEY = "flagforge-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "light" || stored === "dark") {
                return stored;
            }
        } catch {
            // fallback
        }
        return "dark"; // Default theme is dark as specified in darkmode.md
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
            root.style.colorScheme = "dark";
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
            root.style.colorScheme = "light";
        }

        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            console.error("Failed to save theme to localStorage", e);
        }
    }, [theme]);

    function setTheme(newTheme: Theme) {
        setThemeState(newTheme);
    }

    function toggleTheme() {
        setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
