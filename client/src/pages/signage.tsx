import { Header } from "@/components/signage/Header";
import NextEvents from "@/components/signage/NextEvents";
import NextServiceWeekday from "@/components/signage/NextService";
import NextServiceSunday from "@/components/signage/NextServiceSunday";
import { Birthdays } from "@/components/signage/Birthdays";
import { Tagesvers } from "@/components/signage/Tagesvers";
import { FlyerCarousel } from "@/components/signage/FlyerCarousel.tsx";

export default function Signage() {
    const today = new Date();
    const isSunday = false;

    return (
        <div className="signage-container mx-auto bg-gray-50 overflow-hidden min-h-screen flex flex-col">
            <Header />

            <div className="px-16 py-8 grid grid-cols-12 gap-8 flex-1">
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
