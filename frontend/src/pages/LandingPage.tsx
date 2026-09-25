import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    Code2,
    Copy,
    Cpu,
    KeyRound,
    Radio,
    Sliders,
    Sparkles,
    Terminal,
    Zap,
    Menu,
    X,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/ui/ThemeToggle";
import KineticGrid from "@/components/ui/kinetic-grid";
import AnimatedButton from "@/components/ui/animated-button"
import { LiquidMetalButton } from "@/components/ui/liquid-metal"


function GithubIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}

export function LandingPage() {
    const currentUser = getCurrentUser();
    const [copiedCode, setCopiedCode] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "flags" | "evaluation">("overview");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const footerTextContainerRef = useRef<HTMLDivElement>(null);
    const reflectionRef = useRef<HTMLSpanElement>(null);
    const posRef = useRef({ x: 0, y: 0 });

    // Showcase metric cards
    const statsCardsRef = useRef<HTMLDivElement>(null);

    // Developer capabilities cards
    const featureCardsRef = useRef<HTMLDivElement>(null);
    const showcaseContentRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);
    const architectureRef = useRef<HTMLDivElement>(null);
    const navShellRef = useRef<HTMLDivElement>(null);

    // Developer integration section
    const developerSectionRef = useRef<HTMLElement>(null);

    const heroTitleContainerRef = useRef<HTMLDivElement>(null);
    const heroSpecularRef = useRef<HTMLHeadingElement>(null);
    const heroPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize, { passive: true });
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useLocomotiveScroll();

    // Floating command-bar navigation: gently compresses and brightens while scrolling.
    useEffect(() => {
        const shell = navShellRef.current;
        if (!shell) return;

        const update = () => {
            const progress = Math.min(window.scrollY / 180, 1);

            gsap.to(shell, {
                maxWidth: progress > 0.08 ? "72rem" : "80rem",
                y: progress > 0.08 ? 4 : 0,
                duration: 0.35,
                ease: "power3.out",
                overwrite: "auto",
            });

            shell.style.setProperty("--nav-progress", `${progress}`);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });

        return () => window.removeEventListener("scroll", update);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (reflectionRef.current) {
                gsap.set(reflectionRef.current, { opacity: 0 });
            }
            if (heroSpecularRef.current) {
                gsap.set(heroSpecularRef.current, { opacity: 0 });
            }
        }, [footerTextContainerRef, heroTitleContainerRef]);

        return () => ctx.revert();
    }, []);

    // Premium glass / reflective animation for the showcase metric cards.
    useEffect(() => {
        if (!statsCardsRef.current) return;

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>(".showcase-stat-card");

            // Initial entrance.
            gsap.fromTo(
                cards,
                {
                    opacity: 0,
                    y: 12,
                    scale: 0.985,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.65,
                    stagger: 0.08,
                    ease: "power3.out",
                }
            );

            cards.forEach((card) => {
                const glow = card.querySelector(
                    ".showcase-stat-glow"
                ) as HTMLElement | null;

                const content = card.querySelector(
                    ".showcase-stat-content"
                ) as HTMLElement | null;

                const value = card.querySelector(
                    ".showcase-stat-value"
                ) as HTMLElement | null;

                const reflection = card.querySelector(
                    ".showcase-stat-reflection"
                ) as HTMLElement | null;

                const onEnter = () => {
                    gsap.to(card, {
                        y: -3,
                        duration: 0.35,
                        ease: "power2.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 1,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (content) {
                        gsap.to(content, {
                            x: 2,
                            duration: 0.35,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (value) {
                        gsap.to(value, {
                            letterSpacing: "0.015em",
                            duration: 0.35,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (reflection) {
                        gsap.killTweensOf(reflection);

                        gsap.fromTo(
                            reflection,
                            {
                                xPercent: -150,
                                opacity: 0,
                            },
                            {
                                xPercent: 300,
                                opacity: 1,
                                duration: 0.75,
                                ease: "power2.out",
                                overwrite: "auto",
                            }
                        );
                    }
                };

                const onLeave = () => {
                    gsap.to(card, {
                        y: 0,
                        duration: 0.45,
                        ease: "power3.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 0,
                            duration: 0.4,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (content) {
                        gsap.to(content, {
                            x: 0,
                            duration: 0.4,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (value) {
                        gsap.to(value, {
                            letterSpacing: "0em",
                            duration: 0.4,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }
                };

                card.addEventListener("mouseenter", onEnter);
                card.addEventListener("mouseleave", onLeave);
            });
        }, statsCardsRef);

        return () => ctx.revert();
    }, [activeTab]);

    // Animate each showcase view when the user switches tabs.
    useEffect(() => {
        if (!showcaseContentRef.current) return;

        const ctx = gsap.context(() => {
            const panel = showcaseContentRef.current?.querySelector(
                ".showcase-panel"
            ) as HTMLElement | null;

            if (!panel) return;

            const items = panel.querySelectorAll<HTMLElement>(
                ".showcase-panel-item"
            );

            gsap.fromTo(
                panel,
                { opacity: 0, y: 10, scale: 0.995 },
                { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
            );

            gsap.fromTo(
                items,
                { opacity: 0, y: 8 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    delay: 0.04,
                    ease: "power2.out",
                }
            );

            const progress = panel.querySelector(
                ".showcase-progress"
            ) as HTMLElement | null;

            if (progress) {
                gsap.fromTo(
                    progress,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        transformOrigin: "left center",
                        duration: 0.75,
                        delay: 0.1,
                        ease: "power3.out",
                    }
                );
            }

            const status = panel.querySelector(
                ".showcase-status-card"
            ) as HTMLElement | null;

            if (status) {
                gsap.fromTo(
                    status,
                    { boxShadow: "0 0 0 rgba(34,197,94,0)" },
                    {
                        boxShadow: "0 0 26px rgba(34,197,94,0.10)",
                        duration: 0.65,
                        delay: 0.2,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.out",
                    }
                );
            }
        }, showcaseContentRef);

        return () => ctx.revert();
    }, [activeTab]);

    // Developer capability cards: cinematic entrance + cursor-reactive glass highlight.
    useEffect(() => {
        if (!featureCardsRef.current) return;

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

            gsap.fromTo(
                cards,
                {
                    opacity: 0,
                    y: 28,
                    rotateX: 5,
                    scale: 0.97,
                },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.09,
                    ease: "power3.out",
                }
            );

            cards.forEach((card) => {
                const glow = card.querySelector(
                    ".feature-card-glow"
                ) as HTMLElement | null;
                const content = card.querySelector(
                    ".feature-card-content"
                ) as HTMLElement | null;
                const icon = card.querySelector(
                    ".feature-card-icon"
                ) as HTMLElement | null;
                const number = card.querySelector(
                    ".feature-card-number"
                ) as HTMLElement | null;

                const onMove = (event: MouseEvent) => {
                    const rect = card.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;

                    card.style.setProperty("--mx", `${x}px`);
                    card.style.setProperty("--my", `${y}px`);
                };

                const onEnter = () => {
                    gsap.to(card, {
                        y: -6,
                        duration: 0.35,
                        ease: "power3.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 1,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (content) {
                        gsap.to(content, {
                            x: 3,
                            duration: 0.4,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (icon) {
                        gsap.to(icon, {
                            rotate: -4,
                            scale: 1.08,
                            duration: 0.4,
                            ease: "power3.out",
                            overwrite: "auto",
                        });
                    }

                    if (number) {
                        gsap.to(number, {
                            opacity: 0.8,
                            x: 5,
                            duration: 0.4,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }
                };

                const onLeave = () => {
                    gsap.to(card, {
                        y: 0,
                        duration: 0.5,
                        ease: "power3.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 0,
                            duration: 0.4,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (content) {
                        gsap.to(content, {
                            x: 0,
                            duration: 0.45,
                            ease: "power3.out",
                            overwrite: "auto",
                        });
                    }

                    if (icon) {
                        gsap.to(icon, {
                            rotate: 0,
                            scale: 1,
                            duration: 0.45,
                            ease: "power3.out",
                            overwrite: "auto",
                        });
                    }

                    if (number) {
                        gsap.to(number, {
                            opacity: 0.45,
                            x: 0,
                            duration: 0.45,
                            ease: "power3.out",
                            overwrite: "auto",
                        });
                    }
                };

                card.addEventListener("mousemove", onMove);
                card.addEventListener("mouseenter", onEnter);
                card.addEventListener("mouseleave", onLeave);
            });
        }, featureCardsRef);

        return () => ctx.revert();
    }, []);

    // How It Works: sequential timeline reveal + subtle hover motion.
    useEffect(() => {
        if (!howItWorksRef.current) return;

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>(".how-step-card");
            const dots = gsap.utils.toArray<HTMLElement>(".how-step-dot");
            const connector = howItWorksRef.current?.querySelector(
                ".how-step-connector"
            ) as HTMLElement | null;

            gsap.fromTo(
                cards,
                {
                    opacity: 0,
                    y: 22,
                    scale: 0.98,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                dots,
                { scale: 0, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.45,
                    stagger: 0.1,
                    delay: 0.15,
                    ease: "back.out(1.7)",
                }
            );

            if (connector) {
                gsap.fromTo(
                    connector,
                    { scaleX: 0, opacity: 0 },
                    {
                        scaleX: 1,
                        opacity: 1,
                        duration: 1.15,
                        delay: 0.25,
                        transformOrigin: "left center",
                        ease: "power3.out",
                    }
                );
            }

            cards.forEach((card) => {
                const glow = card.querySelector(
                    ".how-step-glow"
                ) as HTMLElement | null;
                const icon = card.querySelector(
                    ".how-step-icon"
                ) as HTMLElement | null;

                const onEnter = () => {
                    gsap.to(card, {
                        y: -5,
                        duration: 0.3,
                        ease: "power2.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 1,
                            duration: 0.25,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }

                    if (icon) {
                        gsap.to(icon, {
                            y: -2,
                            scale: 1.08,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }
                };

                const onLeave = () => {
                    gsap.to(card, {
                        y: 0,
                        duration: 0.4,
                        ease: "power3.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 0,
                            duration: 0.35,
                            overwrite: "auto",
                        });
                    }

                    if (icon) {
                        gsap.to(icon, {
                            y: 0,
                            scale: 1,
                            duration: 0.4,
                            ease: "power3.out",
                            overwrite: "auto",
                        });
                    }
                };

                card.addEventListener("mouseenter", onEnter);
                card.addEventListener("mouseleave", onLeave);
            });
        }, howItWorksRef);

        return () => ctx.revert();
    }, []);

    // Architecture section: layered reveal + subtle glass hover motion.
    useEffect(() => {
        if (!architectureRef.current) return;

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>(".architecture-card");
            const nodes = gsap.utils.toArray<HTMLElement>(".architecture-node");
            const connector = architectureRef.current?.querySelector(
                ".architecture-connector"
            ) as HTMLElement | null;

            gsap.fromTo(
                cards,
                { opacity: 0, y: 20, scale: 0.985 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                nodes,
                { opacity: 0, scale: 0.72 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    delay: 0.15,
                    ease: "back.out(1.6)",
                }
            );

            if (connector) {
                gsap.fromTo(
                    connector,
                    { scaleX: 0, opacity: 0, transformOrigin: "left center" },
                    {
                        scaleX: 1,
                        opacity: 1,
                        duration: 1.1,
                        delay: 0.3,
                        ease: "power3.inOut",
                    }
                );
            }

            cards.forEach((card) => {
                const glow = card.querySelector(
                    ".architecture-glow"
                ) as HTMLElement | null;
                const icon = card.querySelector(
                    ".architecture-node"
                ) as HTMLElement | null;

                const onEnter = () => {
                    gsap.to(card, {
                        y: -5,
                        duration: 0.3,
                        ease: "power2.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 1,
                            duration: 0.25,
                            overwrite: "auto",
                        });
                    }

                    if (icon) {
                        gsap.to(icon, {
                            y: -2,
                            scale: 1.06,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto",
                        });
                    }
                };

                const onLeave = () => {
                    gsap.to(card, {
                        y: 0,
                        duration: 0.4,
                        ease: "power3.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 0,
                            duration: 0.35,
                            overwrite: "auto",
                        });
                    }

                    if (icon) {
                        gsap.to(icon, {
                            y: 0,
                            scale: 1,
                            duration: 0.4,
                            ease: "power3.out",
                            overwrite: "auto",
                        });
                    }
                };

                card.addEventListener("mouseenter", onEnter);
                card.addEventListener("mouseleave", onLeave);
            });
        }, architectureRef);

        return () => ctx.revert();
    }, []);

    // Developer section: staggered reveal + subtle code-panel hover motion.
    useEffect(() => {
        const section = developerSectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            const left = section.querySelector(".developer-copy");
            const code = section.querySelector(".developer-code-panel");
            const checks = gsap.utils.toArray<HTMLElement>(".developer-check");

            gsap.fromTo(
                [left, code],
                { opacity: 0, y: 24 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                checks,
                { opacity: 0, x: -10 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.45,
                    stagger: 0.08,
                    delay: 0.25,
                    ease: "power2.out",
                }
            );

            if (code instanceof HTMLElement) {
                const glow = code.querySelector(".developer-code-glow") as HTMLElement | null;

                const enter = () => {
                    gsap.to(code, {
                        y: -4,
                        duration: 0.4,
                        ease: "power3.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 1,
                            duration: 0.35,
                            overwrite: "auto",
                        });
                    }
                };

                const leave = () => {
                    gsap.to(code, {
                        y: 0,
                        duration: 0.5,
                        ease: "power3.out",
                        overwrite: "auto",
                    });

                    if (glow) {
                        gsap.to(glow, {
                            opacity: 0,
                            duration: 0.4,
                            overwrite: "auto",
                        });
                    }
                };

                code.addEventListener("mouseenter", enter);
                code.addEventListener("mouseleave", leave);

                return () => {
                    code.removeEventListener("mouseenter", enter);
                    code.removeEventListener("mouseleave", leave);
                };
            }
        }, section);

        return () => ctx.revert();
    }, []);

    const handleHeroMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!heroSpecularRef.current) return;
        const rect = heroSpecularRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        heroPosRef.current = { x, y };
        heroSpecularRef.current.style.setProperty("--hx", `${x.toFixed(1)}px`);
        heroSpecularRef.current.style.setProperty("--hy", `${y.toFixed(1)}px`);

        gsap.to(heroSpecularRef.current, {
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!heroSpecularRef.current) return;
        const rect = heroSpecularRef.current.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;

        gsap.to(heroPosRef.current, {
            x: targetX,
            y: targetY,
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto",
            onUpdate: () => {
                if (heroSpecularRef.current) {
                    heroSpecularRef.current.style.setProperty("--hx", `${heroPosRef.current.x.toFixed(1)}px`);
                    heroSpecularRef.current.style.setProperty("--hy", `${heroPosRef.current.y.toFixed(1)}px`);
                }
            },
        });
    };

    const handleHeroMouseLeave = () => {
        if (!heroSpecularRef.current) return;
        gsap.to(heroSpecularRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    const handleHeroTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!heroSpecularRef.current) return;
        const touch = e.touches[0];
        if (!touch) return;
        const rect = heroSpecularRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        heroPosRef.current = { x, y };
        heroSpecularRef.current.style.setProperty("--hx", `${x.toFixed(1)}px`);
        heroSpecularRef.current.style.setProperty("--hy", `${y.toFixed(1)}px`);

        gsap.to(heroSpecularRef.current, {
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    const handleHeroTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!heroSpecularRef.current) return;
        const touch = e.touches[0];
        if (!touch) return;
        const rect = heroSpecularRef.current.getBoundingClientRect();
        const targetX = touch.clientX - rect.left;
        const targetY = touch.clientY - rect.top;

        gsap.to(heroPosRef.current, {
            x: targetX,
            y: targetY,
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto",
            onUpdate: () => {
                if (heroSpecularRef.current) {
                    heroSpecularRef.current.style.setProperty("--hx", `${heroPosRef.current.x.toFixed(1)}px`);
                    heroSpecularRef.current.style.setProperty("--hy", `${heroPosRef.current.y.toFixed(1)}px`);
                }
            },
        });
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!reflectionRef.current) return;
        const rect = reflectionRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        posRef.current = { x, y };
        reflectionRef.current.style.setProperty("--x", `${x.toFixed(1)}px`);
        reflectionRef.current.style.setProperty("--y", `${y.toFixed(1)}px`);

        gsap.to(reflectionRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!reflectionRef.current) return;
        const rect = reflectionRef.current.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;

        gsap.to(posRef.current, {
            x: targetX,
            y: targetY,
            duration: 0.95,
            ease: "power3.out",
            overwrite: "auto",
            onUpdate: () => {
                if (reflectionRef.current) {
                    reflectionRef.current.style.setProperty("--x", `${posRef.current.x.toFixed(1)}px`);
                    reflectionRef.current.style.setProperty("--y", `${posRef.current.y.toFixed(1)}px`);
                }
            },
        });
    };

    const handleMouseLeave = () => {
        if (!reflectionRef.current) return;
        gsap.to(reflectionRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!reflectionRef.current) return;
        const touch = e.touches[0];
        if (!touch) return;
        const rect = reflectionRef.current.getBoundingClientRect();
        const targetX = touch.clientX - rect.left;
        const targetY = touch.clientY - rect.top;

        gsap.to(reflectionRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
        });

        gsap.to(posRef.current, {
            x: targetX,
            y: targetY,
            duration: 0.85,
            ease: "power3.out",
            overwrite: "auto",
            onUpdate: () => {
                if (reflectionRef.current) {
                    reflectionRef.current.style.setProperty("--x", `${posRef.current.x.toFixed(1)}px`);
                    reflectionRef.current.style.setProperty("--y", `${posRef.current.y.toFixed(1)}px`);
                }
            },
        });
    };

    const sdkSnippet = `import { FlagForge } from "@flagforge/sdk";

// 1. Initialize client with environment runtime key
const flagforge = new FlagForge({
  apiUrl: "${typeof window !== "undefined" ? window.location.origin : "https://api.flagforge.dev"}",
  apiKey: "ff_live_prod_99f482a17b"
});

// 2. Evaluate feature flag for user
const result = await flagforge.evaluate("new_checkout_flow", {
  userId: "user_89104",
  attributes: {
    country: "US",
    plan: "enterprise"
  }
});

if (result.enabled) {
  // Serve modern checkout experience
} else {
  // Fallback to legacy workflow (Reason: \${result.reason})
}`;

    function handleCopyCode() {
        navigator.clipboard.writeText(sdkSnippet);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
            {/* Premium Floating Navigation */}
            <header className="sticky top-0 z-50 -mb-[72px] w-full px-3 pt-3 sm:-mb-[84px] sm:px-5">
                <div
                    ref={navShellRef}
                    className="group/nav relative mx-auto flex h-[56px] w-full max-w-7xl items-center rounded-2xl border sm:h-[60px] border-white/[0.10] bg-black/65 px-2 shadow-[0_12px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-[border-color,box-shadow,background-color] duration-500 hover:border-white/[0.16]"
                    style={{
                        ["--nav-progress" as string]: 0,
                    }}
                >
                    {/* Animated top light + scroll progress */}
                    <div className="pointer-events-none absolute inset-x-5 top-0 h-px overflow-hidden rounded-full">
                        <div
                            className="h-full w-full origin-left bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-40 transition-opacity duration-500 group-hover/nav:opacity-70"
                            style={{ transform: "scaleX(calc(0.35 + var(--nav-progress) * 0.65))" }}
                        />
                    </div>

                    {/* Brand — official FlagForge logo */}
                    <Link
                        to="/"
                        aria-label="FlagForge home"
                        className="group/brand relative flex h-11 w-[178px] shrink-0 items-center overflow-hidden rounded-xl px-1 outline-none sm:h-12 sm:w-[198px]"
                    >
                        <span className="pointer-events-none absolute -inset-2 rounded-2xl bg-white/[0.045] opacity-0 blur-xl transition-opacity duration-500 group-hover/brand:opacity-100" />
                        <img
                            src="/flagforge-logo.png"
                            alt="FlagForge — Feature Platform"
                            className="relative z-10 h-full w-full object-contain object-left transition-all duration-500 group-hover/brand:scale-[1.025] group-hover/brand:brightness-110 group-hover/brand:drop-shadow-[0_0_14px_rgba(255,255,255,0.12)]"
                        />
                    </Link>

                    {/* Navigation */}
                    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 md:flex">
                        {[
                            { label: "Features", href: "#features" },
                            { label: "How It Works", href: "#how-it-works" },
                            { label: "SDK & API", href: "#developer" },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="group/link relative rounded-lg px-3.5 py-2 text-[12px] font-medium tracking-[-0.01em] text-white/45 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                            >
                                <span className="relative z-10">{item.label}</span>
                                <span className="absolute inset-x-3 bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-white/80 to-transparent transition-transform duration-300 group-hover/link:scale-x-100" />
                            </a>
                        ))}
                        <Link
                            to="/docs"
                            className="group/link relative rounded-lg px-3.5 py-2 text-[12px] font-medium tracking-[-0.01em] text-white/45 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                        >
                            <span className="relative z-10">Docs</span>
                            <span className="absolute inset-x-3 bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-white/80 to-transparent transition-transform duration-300 group-hover/link:scale-x-100" />
                        </Link>
                        <a
                            href="https://github.com/The-ZGod/FlagForge"
                            target="_blank"
                            rel="noreferrer"
                            className="group/link relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-medium tracking-[-0.01em] text-white/45 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                        >
                            <GithubIcon className="size-3.5 transition-transform duration-300 group-hover/link:rotate-[-8deg] group-hover/link:scale-110" />
                            <span className="relative z-10">GitHub</span>
                            <span className="absolute inset-x-3 bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-white/80 to-transparent transition-transform duration-300 group-hover/link:scale-x-100" />
                        </a>
                    </nav>

                    {/* Right controls */}
                    <div className="ml-auto flex items-center gap-1.5">
                        {/* <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 py-2 sm:flex">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/30" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-white/70" />
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                                Online
                            </span>
                        </div>

                        <div className="rounded-xl border border-transparent transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.04]">
                            <ThemeToggle />
                        </div> */}

                        {currentUser ? (
                            <Link to="/dashboard" className="group/cta">
                                <Button className="h-9 gap-1.5 rounded-xl bg-white px-3 text-[11px] font-semibold sm:h-10 sm:gap-2 sm:px-4 sm:text-xs text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_30px_rgba(255,255,255,0.12)]">
                                    <span className="hidden sm:inline">Go to Dashboard</span>
                                    <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/login" className="group/cta">
                                <LiquidMetalButton
                                    size="sm"
                                    icon={<ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />}
                                    metalConfig={{
                                        colorBack: "#64748b",
                                        colorTint: "#ffffff",
                                        speed: 0.5,
                                        repetition: 4,
                                        distortion: 0.99,
                                    }}
                                >
                                    Get Started
                                </LiquidMetalButton>
                            </Link>
                        )}
                    </div>

                    {/* Mobile navigation trigger */}
                    <button
                        type="button"
                        aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
                        aria-expanded={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/70 transition-all hover:bg-white/[0.06] hover:text-white md:hidden"
                    >
                        {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>
                </div>

                {/* Mobile navigation panel */}
                <div
                    className={`absolute left-0 right-0 top-[64px] rounded-2xl border border-white/[0.10] bg-black/90 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 md:hidden ${mobileMenuOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-2 opacity-0"
                        }`}
                >
                    <nav className="flex flex-col gap-1">
                        {[
                            { label: "Features", href: "#features" },
                            { label: "How It Works", href: "#how-it-works" },
                            { label: "SDK & API", href: "#developer" },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                            >
                                {item.label}
                            </a>
                        ))}

                        <Link
                            to="/docs"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                            Docs
                        </Link>

                        <a
                            href="https://github.com/The-ZGod/FlagForge"
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                            <GithubIcon className="size-4" />
                            GitHub
                        </a>
                    </nav>
                </div>
            </header>

            {/* Hero Section with softened Kinetic Grid Background */}
            <KineticGrid globalColor="default">
                {/* Fade the kinetic grid down without dimming the hero content. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 bg-black/[0.30]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(0,0,0,0.16)_58%,rgba(0,0,0,0.38)_100%)]"
                />
                <section className="relative z-10 px-0 pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-24 md:pb-28">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 space-y-7 sm:space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                            <Sparkles className="size-3.5 text-primary" />
                            <span>Deterministic Rollouts & Targeting Engine</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-mono text-muted-foreground">v1.0.0</span>
                        </div>

                        {/* Headline with Sheryians-style white shade liquid metal design & GSAP glow */}
                        <div
                            ref={heroTitleContainerRef}
                            onMouseEnter={handleHeroMouseEnter}
                            onMouseMove={handleHeroMouseMove}
                            onMouseLeave={handleHeroMouseLeave}
                            onTouchStart={handleHeroTouchStart}
                            onTouchMove={handleHeroTouchMove}
                            onTouchEnd={handleHeroMouseLeave}
                            className="relative mx-auto max-w-4xl space-y-4 cursor-default select-none"
                        >
                            <div className="relative inline-block">
                                {/* Base White Liquid Chrome Metallic Text */}
                                <h1
                                    className="font-space text-[2.15rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-center sm:text-5xl sm:leading-[1.06] md:text-6xl lg:text-7xl"
                                    style={{
                                        backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 25%, #CBD5E1 55%, #94A3B8 80%, #FFFFFF 100%)",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        color: "transparent",
                                        WebkitTextStroke: "0.5px rgba(255, 255, 255, 0.3)",
                                    }}
                                >
                                    Feature flags without the deployment bottleneck.
                                </h1>

                                {/* Border / Outline Glow Layer - Soft diffused edge glow on hover */}
                                <h1
                                    ref={heroSpecularRef}
                                    aria-hidden="true"
                                    className="font-space absolute inset-0 pointer-events-none text-[2.15rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-center opacity-0 select-none sm:text-5xl sm:leading-[1.06] md:text-6xl lg:text-7xl"
                                    style={{
                                        WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.82)",
                                        color: "transparent",
                                        backgroundImage: `radial-gradient(
                                        ellipse 500px 300px at var(--hx, 50%) var(--hy, 50%),
                                        rgba(255, 255, 255, 0.85) 0%,
                                        rgba(255, 255, 255, 0.5) 25%,
                                        rgba(226, 232, 240, 0.15) 50%,
                                        transparent 75%
                                    )`,
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.45)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))",
                                    }}
                                >
                                    Feature flags without the deployment bottleneck.
                                </h1>
                            </div>

                            <p className="mx-auto max-w-2xl px-1 pt-2 text-sm leading-6 text-muted-foreground sm:text-lg sm:leading-relaxed md:text-xl">
                                Control releases, target users by attributes, and gradually roll out features deterministically without shipping new code or restarting servers.
                            </p>
                        </div>

                        {/* Hero Actions */}
                        <div className="flex w-full flex-col items-stretch justify-center gap-3 pt-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                            <Link className="w-full sm:w-auto" to={currentUser ? "/dashboard" : "/login"}>
                                <LiquidMetalButton
                                    size="md"
                                    icon={<ArrowRight className="size-4" />}
                                    metalConfig={{
                                        colorBack: "#64748b",
                                        colorTint: "#ffffff",
                                        speed: 0.5,
                                        repetition: 4,
                                        distortion: 0.15,
                                    }}
                                >
                                    {currentUser ? "Open Console Dashboard" : "Get Started Free"}
                                </LiquidMetalButton>
                            </Link>

                            <Link className="w-full sm:w-auto" to="/docs">
                                {/* <Button size="lg" variant="outline" className="h-12 px-6 text-sm sm:text-base font-medium gap-2 w-full sm:w-auto rounded-full">
                                <Code2 className="size-4.5" />
                                <span>Read Documentation</span>
                            </Button> */}

                                <AnimatedButton className="h-14 px-6 text-sm sm:text-base font-medium gap-2 w-full sm:w-auto rounded-full">
                                    <Code2 className="size-4.5" />
                                    <span>Read Documentation</span>
                                </AnimatedButton>
                            </Link>
                        </div>

                        {/* Interactive Product Showcase Mockup */}
                        <div className="pt-8 max-w-5xl mx-auto">
                            <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-card p-2 shadow-2xl sm:p-4">
                                {/* Showcase Sub-tabs */}
                                <div className="flex min-w-0 items-center justify-between gap-2 border-b border-border/60 px-1 pb-3 sm:px-2">
                                    <div className="flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto rounded-lg bg-muted/50 p-1 scrollbar-none">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("overview")}
                                            onMouseEnter={() => setActiveTab("overview")}
                                            className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer sm:px-3 sm:py-1 sm:text-xs ${activeTab === "overview"
                                                ? "bg-card text-foreground shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            Console Overview
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("flags")}
                                            onMouseEnter={() => setActiveTab("flags")}
                                            className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer sm:px-3 sm:py-1 sm:text-xs ${activeTab === "flags"
                                                ? "bg-card text-foreground shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            Flag Workspace
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("evaluation")}
                                            onMouseEnter={() => setActiveTab("evaluation")}
                                            className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer sm:px-3 sm:py-1 sm:text-xs ${activeTab === "evaluation"
                                                ? "bg-card text-foreground shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            Runtime Evaluation
                                        </button>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                        <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                                        <span>Engine Online</span>
                                    </div>
                                </div>

                                {/* Showcase Screen Content */}
                                <div ref={showcaseContentRef} className="p-3 text-left sm:p-6">
                                    {activeTab === "overview" && (
                                        <div className="showcase-panel space-y-4">
                                            <div
                                                ref={statsCardsRef}
                                                className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-4"
                                            >
                                                {[
                                                    { label: "Projects", value: "4", suffix: "Active" },
                                                    { label: "Environments", value: "12", suffix: "Scoped" },
                                                    { label: "Feature Flags", value: "28", suffix: "Deployed" },
                                                    { label: "Targeting Rules", value: "54", suffix: "Rules" },
                                                ].map((stat) => (
                                                    <div
                                                        key={stat.label}
                                                        className="
                                                        showcase-panel-item
                                                        showcase-stat-card
                                                        group
                                                        relative
                                                        min-h-[125px]
                                                        overflow-hidden
                                                        rounded-xl
                                                        border border-white/[0.09]
                                                        bg-white/[0.025]
                                                        backdrop-blur-xl
                                                        transition-colors
                                                        duration-300
                                                        hover:border-white/[0.18]
                                                    "
                                                    >
                                                        {/* Soft radial glass glow */}
                                                        <div
                                                            className="
                                                            showcase-stat-glow
                                                            pointer-events-none
                                                            absolute
                                                            -inset-px
                                                            opacity-0
                                                            bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.11),transparent_62%)]
                                                        "
                                                        />

                                                        {/* Top reflective edge */}
                                                        <div
                                                            className="
                                                            pointer-events-none
                                                            absolute
                                                            inset-x-0
                                                            top-0
                                                            h-px
                                                            bg-gradient-to-r
                                                            from-transparent
                                                            via-white/30
                                                            to-transparent
                                                            opacity-50
                                                        "
                                                        />

                                                        {/* Hover light sweep */}
                                                        <div
                                                            className="
                                                            showcase-stat-reflection
                                                            pointer-events-none
                                                            absolute
                                                            -left-1/2
                                                            top-0
                                                            h-full
                                                            w-1/3
                                                            -skew-x-12
                                                            bg-gradient-to-r
                                                            from-transparent
                                                            via-white/[0.07]
                                                            to-transparent
                                                            opacity-0
                                                        "
                                                        />

                                                        <div className="showcase-stat-content relative flex h-full flex-col justify-between p-4">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                                                                    {stat.label}
                                                                </p>

                                                                <span className="relative flex size-1.5">
                                                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/20" />
                                                                    <span className="relative inline-flex size-1.5 rounded-full bg-white/50" />
                                                                </span>
                                                            </div>

                                                            <div className="mt-4 flex items-baseline gap-2">
                                                                <span className="showcase-stat-value font-mono text-2xl font-semibold tracking-tight text-white">
                                                                    {stat.value}
                                                                </span>
                                                                <span className="text-xs text-white/35">
                                                                    {stat.suffix}
                                                                </span>
                                                            </div>

                                                            <div className="mt-4 h-px w-full overflow-hidden bg-white/[0.06]">
                                                                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[220%]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="showcase-panel-item group relative overflow-hidden rounded-xl border border-border/60 bg-muted/10 p-3 space-y-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 sm:p-4">
                                                <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                                                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <span className="break-all font-semibold text-sm text-foreground">new_checkout_experience</span>
                                                    <Badge variant="default" className="text-[10px]">ENABLED (50% Rollout)</Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Targeting:</span>
                                                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">country EQUALS US</code>
                                                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">plan NOT_EQUALS free</code>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "flags" && (
                                        <div className="showcase-panel space-y-4">
                                            <div className="showcase-panel-item group relative overflow-hidden p-4 rounded-xl border border-border/60 bg-card space-y-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
                                                <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-foreground">Percentage Rollout Configuration</h4>
                                                        <p className="text-xs text-muted-foreground">Gradually shift traffic using deterministic Murmur3 user ID hashing.</p>
                                                    </div>
                                                    <span className="text-2xl font-bold font-mono text-foreground">65%</span>
                                                </div>
                                                <div className="relative w-full bg-muted h-3 rounded-full overflow-hidden">
                                                    <div className="showcase-progress bg-primary h-full rounded-full w-[65%] origin-left" />
                                                    <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                                                </div>
                                            </div>

                                            <div className="showcase-panel-item group relative overflow-hidden p-4 rounded-xl border border-border/60 bg-muted/10 space-y-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
                                                <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                                                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    <span>Active Targeting Constraints</span>
                                                    <span>2 rules configured</span>
                                                </div>
                                                <div className="showcase-panel-item group relative flex items-center gap-2 text-xs font-mono bg-card p-2 rounded border border-border/60 overflow-hidden transition-all duration-300 hover:border-white/20">
                                                    <span className="text-primary font-bold">1</span>
                                                    <span>user.role EQUALS "admin"</span>
                                                </div>
                                                <div className="showcase-panel-item group relative flex items-center gap-2 text-xs font-mono bg-card p-2 rounded border border-border/60 overflow-hidden transition-all duration-300 hover:border-white/20">
                                                    <span className="text-primary font-bold">2</span>
                                                    <span>user.tier NOT_EQUALS "legacy"</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "evaluation" && (
                                        <div className="showcase-panel space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                <div className="showcase-panel-item group relative overflow-hidden p-4 rounded-xl border border-border/60 bg-card space-y-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
                                                    <p className="text-xs font-semibold text-muted-foreground">Simulated User Context</p>
                                                    <div className="font-mono text-xs space-y-1 text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                                                        <p><span className="text-foreground font-semibold">userId:</span> "usr_prod_9021"</p>
                                                        <p><span className="text-foreground font-semibold">country:</span> "US"</p>
                                                        <p><span className="text-foreground font-semibold">plan:</span> "enterprise"</p>
                                                    </div>
                                                </div>

                                                <div className="showcase-panel-item showcase-status-card group relative overflow-hidden p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5">
                                                    <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                                                    <div className="relative flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-base">
                                                        <CheckCircle2 className="size-5" />
                                                        <span>ENABLED (Matched)</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground space-y-0.5 mt-3">
                                                        <p><strong className="text-foreground">Reason:</strong> PERCENTAGE_ROLLOUT</p>
                                                        <p><strong className="text-foreground">Roundtrip Latency:</strong> 4 ms</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </KineticGrid>

            {/* Core Features Section */}
            <section
                id="features"
                className="relative overflow-hidden border-y border-border/70 bg-black py-16 sm:py-24 lg:py-28"
            >
                {/* Ambient technical grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.22]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
                        backgroundSize: "72px 72px",
                        maskImage:
                            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                    }}
                />

                {/* Soft center light */}
                <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-[38rem] -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Section heading */}
                    <div className="mb-10 flex flex-col gap-6 sm:mb-14 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                                <span className="flex items-center gap-1.5">
                                    <Zap className="size-3.5 text-white/80" />
                                    Developer Capabilities
                                </span>
                                <span className="h-px w-8 bg-white/15" />
                                <span className="font-mono text-white/25">06 MODULES</span>
                            </div>

                            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                                Built for modern
                                <span className="block text-white/35">
                                    engineering teams.
                                </span>
                            </h2>
                        </div>

                        <p className="max-w-md text-sm leading-7 text-white/40 lg:pb-1">
                            Everything required to manage complex releases,
                            conduct experiments, and safeguard production
                            environments.
                        </p>
                    </div>

                    {/* Capability grid */}
                    <div
                        ref={featureCardsRef}
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                        style={{ perspective: "1200px" }}
                    >
                        {[
                            {
                                number: "01",
                                icon: Radio,
                                title: "Feature Flags",
                                desc: "Toggle flags on or off in milliseconds without redeploying code, managing rollout percentages, or changing configurations.",
                                tag: "RELEASE CONTROL",
                            },
                            {
                                number: "02",
                                icon: Sliders,
                                title: "Targeting Rules",
                                desc: "Target cohorts by user attributes with EQUALS and NOT_EQUALS operators before rollout percentages are evaluated.",
                                tag: "PRECISION TARGETING",
                            },
                            {
                                number: "03",
                                icon: Sparkles,
                                title: "Percentage Rollouts",
                                desc: "Gradually ramp releases from 0% to 100% using deterministic Murmur3 hashing so users stay in consistent cohorts.",
                                tag: "SAFE DEPLOYMENT",
                            },
                            {
                                number: "04",
                                icon: KeyRound,
                                title: "Environment API Keys",
                                desc: "Environment-scoped credentials isolate Development, Staging, and Production flag states with fast runtime evaluation.",
                                tag: "ACCESS ISOLATION",
                            },
                            {
                                number: "05",
                                icon: Cpu,
                                title: "Evaluation Metrics",
                                desc: "Track evaluation throughput, enabled vs. disabled distributions, decision reasons, and sub-millisecond latencies in real time.",
                                tag: "RUNTIME SIGNALS",
                            },
                            {
                                number: "06",
                                icon: Terminal,
                                title: "TypeScript SDK",
                                desc: "Lightweight, zero-overhead TypeScript SDK with robust fail-safes, type definitions, and direct HTTP REST API compatibility.",
                                tag: "DEVELOPER SDK",
                            },
                        ].map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.number}
                                    className="
                                        feature-card
                                        group
                                        relative
                                        min-h-[285px]
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-white/[0.09]
                                        bg-white/[0.018]
                                        backdrop-blur-xl
                                        transition-[border-color,background-color]
                                        duration-500
                                        hover:border-white/[0.19]
                                        hover:bg-white/[0.035]
                                    "
                                >
                                    {/* Cursor-following spotlight */}
                                    <div
                                        className="
                                            feature-card-glow
                                            pointer-events-none
                                            absolute
                                            -inset-px
                                            opacity-0
                                            transition-opacity
                                            duration-300
                                        "
                                        style={{
                                            background:
                                                "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.09), transparent 68%)",
                                        }}
                                    />

                                    {/* Glass edge highlight */}
                                    <div
                                        className="
                                            pointer-events-none
                                            absolute
                                            inset-x-8
                                            top-0
                                            h-px
                                            bg-gradient-to-r
                                            from-transparent
                                            via-white/30
                                            to-transparent
                                            opacity-60
                                        "
                                    />

                                    {/* Large index */}

                                    <div className="feature-card-content relative flex h-full flex-col justify-between p-6 sm:p-7">
                                        <div>
                                            <div className="mb-10 flex items-start justify-between">
                                                <div
                                                    className="
                                                        feature-card-icon
                                                        flex
                                                        size-11
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-white/[0.10]
                                                        bg-white/[0.045]
                                                        text-white/80
                                                        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                                                    "
                                                >
                                                    <Icon className="size-[18px]" />
                                                </div>

                                                <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] font-medium tracking-[0.12em] text-white/30">
                                                    {feature.number}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-xl font-semibold tracking-[-0.025em] text-white">
                                                    {feature.title}
                                                </h3>

                                                <p className="max-w-[32rem] text-sm leading-6 text-white/40">
                                                    {feature.desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 border-t border-white/[0.07] pt-4">
                                            <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-white/25">
                                                {feature.tag}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Flow */}
            <section id="how-it-works" className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
                <div
                    ref={howItWorksRef}
                    className="mx-auto max-w-7xl px-4 sm:px-6"
                >
                    {/* Section heading */}
                    <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
                        <div className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                            <span className="h-px w-7 bg-white/20" />
                            <span>Deployment Flow</span>
                            <span className="h-px w-7 bg-white/20" />
                        </div>

                        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                            How FlagForge Works
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
                            From flag creation to production evaluation, every release follows
                            a controlled runtime path.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Desktop connector */}
                        <div className="pointer-events-none absolute left-[10%] right-[10%] top-[31px] hidden h-px bg-white/[0.08] lg:block">
                            <div className="how-step-connector h-full w-full origin-left bg-gradient-to-r from-white/5 via-white/35 to-white/5" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {[
                                {
                                    step: "01",
                                    title: "Configure Flag",
                                    desc: "Create your flag and specify percentage rollout or targeting rules.",
                                },
                                {
                                    step: "02",
                                    title: "Generate Key",
                                    desc: "Generate an environment-scoped runtime SDK key in the console.",
                                },
                                {
                                    step: "03",
                                    title: "Integrate SDK",
                                    desc: "Initialize the SDK in your backend server or API gateway.",
                                },
                                {
                                    step: "04",
                                    title: "Evaluate Flags",
                                    desc: "Query flags at runtime passing userId and request context attributes.",
                                },
                                {
                                    step: "05",
                                    title: "Control Behavior",
                                    desc: "Dynamically alter features and roll back immediately if issues arise.",
                                },
                            ].map((s, index) => (
                                <div
                                    key={s.step}
                                    className="relative"
                                >
                                    {/* Timeline node */}
                                    <div className="relative z-10 mb-4 flex items-center lg:justify-center">
                                        <div className="how-step-dot flex size-[62px] items-center justify-center rounded-full border border-white/[0.12] bg-black shadow-[0_0_0_8px_rgba(255,255,255,0.015)]">
                                            <span className="how-step-icon font-mono text-sm font-semibold tracking-tight text-white/65">
                                                {s.step}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card */}
                                    <div
                                        className="
                                            how-step-card
                                            group
                                            relative
                                            min-h-[230px]
                                            overflow-hidden
                                            rounded-2xl
                                            border border-white/[0.09]
                                            bg-white/[0.02]
                                            p-5
                                            backdrop-blur-xl
                                            transition-colors duration-300
                                            hover:border-white/[0.18]
                                        "
                                    >
                                        <div className="how-step-glow pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_65%)] opacity-0" />

                                        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                                        <div className="relative flex h-full flex-col">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
                                                    Step {index + 1}
                                                </span>

                                                <span className="size-1.5 rounded-full bg-white/30 transition-all duration-300 group-hover:bg-white/70 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
                                            </div>

                                            <div className="mt-10">
                                                <h4 className="text-lg font-semibold tracking-[-0.025em] text-white">
                                                    {s.title}
                                                </h4>

                                                <p className="mt-3 text-sm leading-6 text-white/40">
                                                    {s.desc}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-7">
                                                <div className="h-px w-full bg-white/[0.06]" />
                                                <div className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/20">
                                                    <span className="size-1 rounded-full bg-white/20" />
                                                    Runtime pipeline
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer Integration Code Section */}
            <section
                id="developer"
                ref={developerSectionRef}
                className="relative overflow-hidden border-t border-white/[0.07] bg-black py-16 sm:py-24 lg:py-28"
            >
                {/* Technical grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.22]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                        backgroundSize: "72px 72px",
                    }}
                />

                {/* Ambient center glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-8 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                                <Code2 className="size-3.5 text-white/70" />
                                <span>Developer First</span>
                            </div>

                            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                                Integration that stays
                                <span className="text-white/35"> out of your way.</span>
                            </h2>
                        </div>

                        <div className="hidden pb-1 text-right font-mono text-[9px] uppercase tracking-[0.16em] text-white/25 lg:block">
                            <div>SDK / TYPESCRIPT</div>
                            <div className="mt-1">RUNTIME READY</div>
                        </div>
                    </div>

                    <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:gap-5">
                        {/* Copy panel */}
                        <div className="developer-copy group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.018] p-5 backdrop-blur-xl sm:p-8">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            <div className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full bg-white/[0.035] blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

                            <div className="relative flex h-full flex-col">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                                        @flagforge/sdk
                                    </span>
                                    <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/30">
                                        <span className="size-1.5 rounded-full bg-white/50" />
                                        Stable
                                    </span>
                                </div>

                                <div className="mt-12">
                                    <p className="max-w-xl text-sm leading-7 text-white/45 sm:text-base">
                                        Install the SDK and evaluate flags asynchronously with typed
                                        user context attributes.
                                    </p>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="developer-check flex items-center gap-3 text-sm text-white/75">
                                        <span className="grid size-5 place-items-center rounded-full border border-white/10 bg-white/[0.035]">
                                            <Check className="size-3 text-white/75" />
                                        </span>
                                        <span>Sub-millisecond local hash determination</span>
                                    </div>

                                    <div className="developer-check flex items-center gap-3 text-sm text-white/75">
                                        <span className="grid size-5 place-items-center rounded-full border border-white/10 bg-white/[0.035]">
                                            <Check className="size-3 text-white/75" />
                                        </span>
                                        <span>Fail-safe fallback on network disconnect</span>
                                    </div>

                                    <div className="developer-check flex items-center gap-3 text-sm text-white/75">
                                        <span className="grid size-5 place-items-center rounded-full border border-white/10 bg-white/[0.035]">
                                            <Check className="size-3 text-white/75" />
                                        </span>
                                        <span>Environment key isolation</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-10">
                                    <Link to="/docs">
                                        <Button
                                            className="h-10 rounded-full border border-white/[0.12] bg-white/[0.055] px-5 text-xs font-semibold text-white shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09]"
                                        >
                                            <span>Explore SDK Reference</span>
                                            <ArrowRight className="ml-1.5 size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Code panel */}
                        <div className="developer-code-panel group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.10] bg-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                            <div className="developer-code-glow pointer-events-none absolute -inset-20 opacity-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_55%)]" />

                            <div className="relative flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <span className="size-2 rounded-full bg-white/15" />
                                        <span className="size-2 rounded-full bg-white/10" />
                                        <span className="size-2 rounded-full bg-white/[0.07]" />
                                    </div>
                                    <span className="font-mono text-[10px] text-white/45">
                                        server.ts
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 font-mono text-[10px] text-white/45 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white/80"
                                >
                                    {copiedCode ? (
                                        <>
                                            <Check className="size-3" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="relative overflow-hidden">
                                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 border-r border-white/[0.04] bg-white/[0.012]" />
                                <pre className="max-w-full overflow-x-auto p-4 pl-12 text-[10px] leading-5 text-white/70 sm:p-6 sm:pl-16 sm:text-xs sm:leading-6">
                                    <code>{sdkSnippet}</code>
                                </pre>
                            </div>

                            <div className="relative flex items-center justify-between border-t border-white/[0.07] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">
                                <span>Typed evaluation</span>
                                <span>Runtime safe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section className="relative overflow-hidden border-t border-white/[0.07] py-16 sm:py-24 lg:py-28">
                {/* Subtle technical grid + ambient light */}
                <div className="pointer-events-none absolute inset-0 opacity-50">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
                            backgroundSize: "56px 56px",
                            maskImage:
                                "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                        }}
                    />
                    <div className="absolute left-1/2 top-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[120px]" />
                </div>

                <div
                    ref={architectureRef}
                    className="relative mx-auto max-w-7xl px-4 sm:px-6"
                >
                    {/* Section heading */}
                    <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                        <div className="max-w-2xl">
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                <span className="h-px w-8 bg-white/20" />
                                System Architecture
                            </div>

                            <h3 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                                Built to keep evaluation fast.
                            </h3>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
                                A focused runtime stack for deterministic rollouts, reliable
                                persistence, and a lightweight developer experience.
                            </p>
                        </div>

                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/20">
                            FLAGFORGE / CORE STACK
                        </span>
                    </div>

                    {/* Architecture flow */}
                    <div className="relative">
                        <div className="architecture-connector pointer-events-none absolute left-[12%] right-[12%] top-[58px] hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: Terminal,
                                    index: "01",
                                    label: "API LAYER",
                                    title: "Node & Express",
                                    text: "Optimized REST routing with rate-limits and JWT dashboard authentication.",
                                },
                                {
                                    icon: Cpu,
                                    index: "02",
                                    label: "DATA LAYER",
                                    title: "PostgreSQL & Prisma",
                                    text: "ACID-compliant persistence with structured data and immutable audit trails.",
                                },
                                {
                                    icon: Sparkles,
                                    index: "03",
                                    label: "EVALUATION",
                                    title: "Murmur3 Bucketing",
                                    text: "Deterministic 0–100 hashing keeps percentage rollouts consistent across users.",
                                },
                                {
                                    icon: Code2,
                                    index: "04",
                                    label: "CLIENT LAYER",
                                    title: "React & Tailwind v4",
                                    text: "A lightweight developer interface built around Geist typography and reusable UI.",
                                },
                            ].map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.index}
                                        className="architecture-card group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.018] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-white/[0.18]"
                                    >
                                        <div className="architecture-glow pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_65%)] opacity-0" />

                                        <div className="relative">
                                            <div className="flex items-center justify-between">
                                                <div className="architecture-node flex size-10 items-center justify-center rounded-xl border border-white/[0.11] bg-white/[0.035] text-white/65 transition-all duration-300 group-hover:border-white/20 group-hover:text-white">
                                                    <Icon className="size-4" strokeWidth={1.7} />
                                                </div>

                                                <span className="font-mono text-[10px] tracking-[0.14em] text-white/20">
                                                    {item.index}
                                                </span>
                                            </div>

                                            <div className="mt-8">
                                                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-white/30">
                                                    {item.label}
                                                </p>

                                                <h4 className="mt-2 text-base font-semibold tracking-tight text-white">
                                                    {item.title}
                                                </h4>

                                                <p className="mt-2 text-xs leading-5 text-white/40">
                                                    {item.text}
                                                </p>
                                            </div>

                                            <div className="mt-6 flex items-center gap-2">
                                                <span className="size-1.5 rounded-full bg-white/35" />
                                                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/20">
                                                    Runtime ready
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Architecture principles */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {[
                            ["Deterministic", "Stable rollout decisions"],
                            ["Low overhead", "Lightweight runtime path"],
                            ["Isolated", "Environment-scoped state"],
                        ].map(([title, text]) => (
                            <div
                                key={title}
                                className="rounded-xl border border-white/[0.07] bg-white/[0.012] px-4 py-3"
                            >
                                <p className="text-xs font-semibold text-white/55">{title}</p>
                                <p className="mt-0.5 text-[11px] text-white/25">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Sheryians-style Reflective Typography Footer Banner */}
            <section
                ref={footerTextContainerRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchMove}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseLeave}
                className="hidden min-[1200px]:flex relative w-full border-t border-border/60 bg-black select-none cursor-default py-8 sm:py-12 md:py-16 items-center justify-center overflow-x-clip"
            >
                <div className="w-full flex items-center justify-center px-2 sm:px-4">
                    <div className="relative inline-flex items-center justify-center">
                        {/* Base Outline Layer - very subtle */}
                        <span
                            className="font-space font-bold tracking-[-0.06em] select-none pointer-events-none text-center whitespace-nowrap px-4 py-4"
                            style={{
                                fontSize: "clamp(3rem, 17.5vw, 19.5rem)",
                                // fontSize: "clamp(3.5rem, 13.5vw, 15.5rem)",
                                lineHeight: 1,
                                color: "transparent",
                                WebkitTextStroke: "1.2px rgba(255, 255, 255, 0.22)",
                            }}
                        >
                            FlagForge
                        </span>

                        {/* Hover Reflection Layer - clipped ONLY inside letters */}
                        <span
                            ref={reflectionRef}
                            aria-hidden="true"
                            className="absolute inset-0 flex items-center justify-center font-space font-bold tracking-[-0.06em] select-none pointer-events-none text-center whitespace-nowrap px-4 py-4 opacity-0"
                            style={{
                                fontSize: "clamp(3rem, 17.5vw, 19.5rem)",
                                // fontSize: "clamp(3.5rem, 13.5vw, 15.5rem)",
                                lineHeight: 1.15,
                                color: "transparent",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                backgroundImage: `radial-gradient(
                                    ellipse 650px 450px at var(--x, 50%) var(--y, 50%),
                                    rgba(255, 255, 255, 0.95) 0%,
                                    rgba(255, 255, 255, 0.55) 12%,
                                    rgba(255, 255, 255, 0.22) 30%,
                                    rgba(255, 255, 255, 0.08) 48%,
                                    transparent 72%
                                )`,
                            }}
                        >
                            FlagForge
                        </span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/80 py-8 bg-muted/10 text-xs text-muted-foreground">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {/* <Radio className="size-4 text-primary" /> */}
                        <span className="font-semibold text-foreground">FlagForge</span>
                        <span>© {new Date().getFullYear()} FlagForge Platform. All rights reserved.</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                        <Link to="/docs" className="hover:text-foreground transition-colors">
                            Documentation
                        </Link>
                        <Link to="/login" className="hover:text-foreground transition-colors">
                            Console Sign In
                        </Link>
                        <a
                            href="https://github.com/The-ZGod/FlagForge"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            <span className="relative z-10 flex items-center gap-1">
                                <GithubIcon className="size-3.5 transition-transform duration-300 group-hover/link:rotate-[-8deg] group-hover/link:scale-110" />
                                GitHub</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
