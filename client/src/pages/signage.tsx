import { Header } from "@/components/signage/Header";
import { RoomUsage } from "@/components/signage/RoomUsage";
import { UpcomingEvent } from "@/components/signage/UpcomingEvent";
import { Birthdays } from "@/components/signage/Birthdays";
import { VerseOfWeek } from "@/components/signage/VerseOfWeek";
import { ApiStatus } from "@/components/signage/ApiStatus";

export default function Signage() {
  return (
    <div className="signage-container mx-auto bg-gray-50 overflow-hidden">
      <Header />
      
      <div className="px-16 py-8 grid grid-cols-12 gap-8 h-full">
        <RoomUsage />
        <UpcomingEvent />
        <Birthdays />
        <VerseOfWeek />
        <ApiStatus />
      </div>
    </div>
  );
}
