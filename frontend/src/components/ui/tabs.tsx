import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({
    value,
    defaultValue,
    onValueChange,
    className,
    children,
}: {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children: React.ReactNode;
}) {
    const [currentValue, setCurrentValue] = React.useState(value || defaultValue || "");

    const activeValue = value !== undefined ? value : currentValue;
    const handleChange = onValueChange || setCurrentValue;

    return (
        <TabsContext.Provider value={{ value: activeValue, onValueChange: handleChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "inline-flex h-9 items-center justify-start rounded-lg bg-muted/60 p-1 text-muted-foreground",
                className
            )}
        >
            {children}
        </div>
    );
}

export function TabsTrigger({
    value,
    className,
    children,
    disabled,
}: {
    value: string;
    className?: string;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.value === value;

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all outline-hidden cursor-pointer",
                isActive
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                disabled && "pointer-events-none opacity-50",
                className
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({
    value,
    className,
    children,
}: {
    value: string;
    className?: string;
    children: React.ReactNode;
}) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.value !== value) return null;

    return (
        <div
            className={cn(
                "mt-4 focus-visible:outline-hidden animate-in fade-in-50 duration-150",
                className
            )}
        >
            {children}
        </div>
    );
}
