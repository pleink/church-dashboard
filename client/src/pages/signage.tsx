import { useEffect, useState } from "react";
import { Header } from "@/components/signage/Header";
import NextEvents from "@/components/signage/NextEvents";
import NextServiceWeekday from "@/components/signage/NextServiceWeekday";
import NextServiceSunday from "@/components/signage/NextServiceSunday";
import { Birthdays } from "@/components/signage/Birthdays";
import { Tagesvers } from "@/components/signage/Tagesvers";
import { FlyerCarousel } from "@/components/signage/FlyerCarousel.tsx";

export default function Signage() {
    const [isSunday, setIsSunday] = useState(() => new Date().getDay() === 0);

    useEffect(() => {
        let midnightTimer: ReturnType<typeof setTimeout>;

        const refreshDay = () => {
            clearTimeout(midnightTimer);
            const now = new Date();
            setIsSunday(now.getDay() === 0);

            // Calculate each local midnight anew to account for daylight saving time.
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);
            midnightTimer = setTimeout(refreshDay, nextMidnight.getTime() - now.getTime());
        };

        // Catch up when a sleeping display or background tab becomes active again.
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") refreshDay();
        };

        refreshDay();
        window.addEventListener("focus", refreshDay);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            clearTimeout(midnightTimer);
            window.removeEventListener("focus", refreshDay);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, []);

    return (
        <div className="signage-container mx-auto bg-gray-50 overflow-hidden min-h-screen flex flex-col">
            <Header />

            <div className="px-16 py-8 grid grid-cols-12 grid-rows-[auto_auto_minmax(0,1fr)] gap-8 flex-1 min-h-0 overflow-hidden">
                {isSunday ? (
                    <>
                        <NextServiceSunday />
                        <NextEvents className="col-span-5 section-card p-12" />
                    </>
                ) : (
                    <>
                        <NextEvents />
                        <NextServiceWeekday />
                    </>
                )}
                <Birthdays />
                <Tagesvers />
                <FlyerCarousel />
            </div>
        </div>
    );
}
