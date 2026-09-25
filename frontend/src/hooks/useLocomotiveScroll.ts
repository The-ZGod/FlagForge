import { useEffect } from "react";
import LocomotiveScroll from "locomotive-scroll";

export function useLocomotiveScroll() {
    useEffect(() => {
        const scroll = new LocomotiveScroll({
            lenisOptions: {
                lerp: 0.08,
                duration: 1.1,
                smoothWheel: true,
            },
        });

        return () => {
            scroll.destroy();
        };
    }, []);
}