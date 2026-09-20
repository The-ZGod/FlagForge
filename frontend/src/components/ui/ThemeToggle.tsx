import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export function ThemeToggle({
    className = "",
    showLabel = false,
}: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";
    const label = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    const statusText = isDark ? "Light Mode" : "Dark Mode";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus:outline-hidden ${
                showLabel ? "h-8.5 px-2.5 gap-2 text-xs sm:text-sm font-medium" : "size-8.5"
            } ${className}`}
            title={label}
            aria-label={label}
        >
            {isDark ? (
                <Sun className="size-4.5 text-foreground transition-transform duration-200" />
            ) : (
                <Moon className="size-4.5 text-foreground transition-transform duration-200" />
            )}
            {showLabel && (
                <span className="text-foreground">{statusText}</span>
            )}
        </button>
    );
}
