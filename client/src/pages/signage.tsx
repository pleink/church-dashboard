import {Header} from "@/components/signage/Header";
import NextEvents from "@/components/signage/NextEvents";
import NextService from "@/components/signage/NextService";
import {Birthdays} from "@/components/signage/Birthdays";
import {Tagesvers} from "@/components/signage/Tagesvers";
import {FlyerCarousel} from "@/components/signage/FlyerCarousel.tsx";

export default function Signage() {
    return (
        <div className="signage-container mx-auto bg-gray-50 overflow-hidden">
            <Header/>

            <div className="px-16 py-8 grid grid-cols-12 gap-8 h-full">
                <NextEvents/>
                <NextService/>
                <Birthdays/>
                <Tagesvers/>
                <FlyerCarousel/>
            </div>
        </div>
    );
}
