import { Calendar } from "lucide-react";
import { useRoomBookings } from "@/hooks/use-signage-data";

export function RoomUsage() {
  const { data: bookings, isLoading, error } = useRoomBookings();

  if (isLoading) {
    return (
      <section className="col-span-7 section-card p-12">
        <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
          <Calendar className="text-church-yellow mr-4" size={32} />
          HEUTE IN UNSEREN RÄUMEN
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto"></div>
          <p className="text-xl-custom text-gray-600 mt-4">Lade Raumbelegung...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="col-span-7 section-card p-12">
        <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
          <Calendar className="text-church-yellow mr-4" size={32} />
          HEUTE IN UNSEREN RÄUMEN
        </h2>
        <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
          <p className="text-xl-custom text-red-800">
            Fehler beim Laden der Raumbelegung. ChurchTools möglicherweise nicht erreichbar.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-7 section-card p-12">
      <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
        <Calendar className="text-church-yellow mr-4" size={32} />
        HEUTE IN UNSEREN RÄUMEN
      </h2>
      
      <div className="space-y-6">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between py-4 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="w-4 h-4 bg-church-yellow rounded-full"></div>
                <div>
                  <span className="text-2xl-custom font-medium text-gray-800">
                    {booking.title}
                  </span>
                  <p className="text-lg text-gray-500">{booking.resource}</p>
                </div>
              </div>
              <div className="text-2xl-custom text-gray-600 font-medium">
                {booking.startTime}–{booking.endTime}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-2xl-custom text-gray-500">
              Heute sind keine Räume gebucht.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
