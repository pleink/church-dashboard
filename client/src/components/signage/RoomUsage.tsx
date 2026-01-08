import { Calendar, Clock } from "lucide-react";
import { useTodayAppointments, useUpcomingAppointments } from "@/hooks/use-signage-data";

export function RoomUsage() {
  const { data: todayBookings, isLoading: isLoadingToday, error: errorToday } = useTodayAppointments();
  const { data: upcomingBookings, isLoading: isLoadingUpcoming, error: errorUpcoming } = useUpcomingAppointments();

  const isLoading = isLoadingToday || isLoadingUpcoming;
  const hasError = errorToday || errorUpcoming;

  if (isLoading) {
    return (
      <section className="col-span-7 section-card p-12">
        <h2 className="text-4xl font-semibold text-church-blue mb-8 flex items-center">
          <Calendar className="signage-icon text-church-yellow mr-4" size={32} />
          RAUMBELEGUNGEN
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto"></div>
          <p className="text-xl text-gray-600 mt-4">Lade Raumbelegung...</p>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="col-span-7 section-card p-12">
        <h2 className="text-4xl font-semibold text-church-blue mb-8 flex items-center">
          <Calendar className="signage-icon text-church-yellow mr-4" size={32} />
          RAUMBELEGUNGEN
        </h2>
        <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
          <p className="text-xl text-red-800">
            Fehler beim Laden der Raumbelegung. ChurchTools möglicherweise nicht erreichbar.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-7 section-card p-12">
      <h2 className="text-4xl font-semibold text-church-blue mb-8 flex items-center">
        <Calendar className="signage-icon text-church-yellow mr-4" size={32} />
        RAUMBELEGUNGEN
      </h2>
      
      {/* Today's bookings section */}
      <div className="mb-8">
        <h3 className="text-2xl font-medium text-gray-700 mb-4 flex items-center">
          <Clock className="signage-icon signage-icon-24 text-church-yellow mr-3" size={24} />
          Heute
        </h3>
        <div className="space-y-3">
          {todayBookings && todayBookings.length > 0 ? (
            todayBookings.map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-church-yellow rounded-full"></div>
                  <div>
                    <span className="text-xl font-medium text-gray-800">
                      {booking.title}
                    </span>
                    <p className="text-lg text-gray-500">{booking.resource}</p>
                  </div>
                </div>
                <div className="text-xl text-gray-600 font-medium">
                  {booking.startTime}–{booking.endTime}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xl text-gray-500 py-4">
              Heute sind keine Räume gebucht.
            </p>
          )}
        </div>
      </div>

      {/* Upcoming bookings section */}
      <div>
        <h3 className="text-2xl font-medium text-gray-700 mb-4 flex items-center">
          <Calendar className="signage-icon signage-icon-24 text-church-yellow mr-3" size={24} />
          Anstehend
        </h3>
        <div className="space-y-3">
          {upcomingBookings && upcomingBookings.length > 0 ? (
            upcomingBookings.slice(0, 8).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-church-blue rounded-full"></div>
                  <div>
                    <span className="text-xl font-medium text-gray-800">
                      {booking.title}
                    </span>
                    <p className="text-lg text-gray-500">{booking.resource}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg text-gray-600 font-medium">
                    {booking.startTime}–{booking.endTime}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.date}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xl text-gray-500 py-4">
              Keine anstehenden Raumbelegungen.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
