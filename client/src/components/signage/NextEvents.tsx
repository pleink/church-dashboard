import { useTodayAppointments, useUpcomingAppointments } from "../../hooks/use-signage-data";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function NextEvents() {
    const { data: todayAppointments = [], isLoading: isLoadingToday } = useTodayAppointments();
    const { data: upcomingAppointments = [], isLoading: isLoadingUpcoming } = useUpcomingAppointments();

    // Combine and sort all appointments
    const allAppointments = [...todayAppointments, ...upcomingAppointments]
        .filter(appointment => appointment.title || appointment.resource) // Show all appointments, even private ones
        .slice(0, 8); // Limit to 8 entries as per config

    if (isLoadingToday || isLoadingUpcoming) {
        return (
            <section className="col-span-7 section-card p-12">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
                    <Calendar className="text-church-yellow mr-4" size={32} />
                    NÄCHSTE VERANSTALTUNGEN
                </h2>
                <div className="text-center py-8">
                    <span className="loading loading-ring loading-lg text-church-blue"></span>
                    <p className="text-xl-custom text-gray-600 mt-4">Lade Termine...</p>
                </div>
            </section>
        );
    }

    if (allAppointments.length === 0) {
        return (
            <section className="col-span-7 section-card p-12">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
                    <Calendar className="text-church-yellow mr-4" size={32} />
                    NÄCHSTE VERANSTALTUNGEN
                </h2>
                <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-xl-custom text-gray-500">Keine Veranstaltung gefunden</p>
                </div>
            </section>
        );
    }

    return (
        <section className="col-span-7 section-card p-12">
            <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
                <Calendar className="text-church-yellow mr-4" size={32} />
                NÄCHSTE VERANSTALTUNGEN
            </h2>
            <div className="space-y-4">
                {allAppointments.map((appointment) => (
                    <div key={`${appointment.churchToolsId}-${appointment.calendarId}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-church-yellow rounded-full"></div>
                            <div>
                                {appointment.isPublic && appointment.title ? (
                                    <span className="text-xl-custom font-medium text-gray-800">
                                        {appointment.title}
                                    </span>
                                ) : (
                                    <span className="text-xl-custom font-medium text-gray-500 italic">
                                        Privater Termin
                                    </span>
                                )}
                                {appointment.resource && (
                                    <p className="text-lg text-gray-500">{appointment.resource}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl-custom text-gray-600 font-medium">
                                {appointment.startTime}–{appointment.endTime}
                            </div>
                            {appointment.date && (
                                <div className="text-lg text-gray-500">
                                    {appointment.date}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}