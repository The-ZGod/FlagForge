import { cn } from "@/lib/utils";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    "aria-label"?: string;
}

export function Switch({
    checked,
    onCheckedChange,
    disabled = false,
    className,
    id,
    "aria-label": ariaLabel,
}: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-primary" : "bg-input",
                className
            )}
        >
            <span
                className={cn(
                    "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}
