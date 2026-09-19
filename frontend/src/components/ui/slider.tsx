import { cn } from "@/lib/utils";

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export function Slider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    className,
    id,
}: SliderProps) {
    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
                className={cn(
                    "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50",
                    "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-1"
                )}
            />
        </div>
    );
}
