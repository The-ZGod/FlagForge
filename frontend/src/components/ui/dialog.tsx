import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}

export function Dialog({
    open,
    onOpenChange,
    children,
    className,
}: DialogProps) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            {/* Ambient backdrop */}
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    [
                        "relative z-50 my-auto w-full max-w-2xl",
                        "max-h-[calc(100vh-2rem)] overflow-y-auto",
                        "rounded-2xl border border-white/[0.10]",
                        "bg-[#0b0b0b] text-foreground",
                        "shadow-[0_30px_100px_rgba(0,0,0,0.65)]",
                        "ring-1 ring-white/[0.03]",
                        "animate-in fade-in zoom-in-[0.98] duration-200",
                        "supports-[backdrop-filter]:backdrop-blur-xl",
                    ].join(" "),
                    className
                )}
            >
                {/* Subtle top reflection */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />

                {/* Ambient glow */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl"
                />

                <div className="relative p-6 sm:p-7">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

export function DialogHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col space-y-1.5 text-left mb-0",
                className
            )}
            {...props}
        />
    );
}

export function DialogTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "text-lg font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    );
}

export function DialogDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn(
                "text-sm text-muted-foreground mt-1.5",
                className
            )}
            {...props}
        />
    );
}

export function DialogFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-2 mt-0 pt-0 border-0",
                className
            )}
            {...props}
        />
    );
}

export function DialogClose({
    onClose,
    className,
}: {
    onClose: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={cn(
                [
                    "absolute right-5 top-5 z-10",
                    "flex size-8 items-center justify-center",
                    "rounded-lg border border-white/[0.08]",
                    "bg-white/[0.03] text-muted-foreground",
                    "transition-all duration-200",
                    "hover:border-white/[0.16] hover:bg-white/[0.08]",
                    "hover:text-foreground hover:rotate-90",
                    "focus:outline-none focus:ring-2 focus:ring-white/20",
                    "cursor-pointer",
                ].join(" "),
                className
            )}
        >
            <X className="size-4" />
            <span className="sr-only">Close</span>
        </button>
    );
}
