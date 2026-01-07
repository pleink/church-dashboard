import { useTodayAppointments, useUpcomingAppointments } from "../../hooks/use-signage-data";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function NextEvents() {
    const { data: todayAppointments = [], isLoading: isLoadingToday } = useTodayAppointments();
    const { data: upcomingAppointments = [], isLoading: isLoadingUpcoming } = useUpcomingAppointments();

    const today = new Date();
    const isSameDay = (iso?: string) => {
        if (!iso) return false;
        const d = new Date(iso);
        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
    };

    const sortedToday = [...todayAppointments, ...upcomingAppointments]
        .filter(a => a.title || a.resource)
        .filter(a => isSameDay(a.startDateTime))
        .sort((a, b) => (a.startDateTime || '').localeCompare(b.startDateTime || ''));

    const sortedUpcoming = upcomingAppointments
        .filter(a => a.title || a.resource)
        .filter(a => !isSameDay(a.startDateTime))
        .sort((a, b) => (a.startDateTime || '').localeCompare(b.startDateTime || ''))
        .slice(0, Math.max(0, 6 - sortedToday.length)); // Cap total to 6

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

    if (sortedToday.length === 0 && sortedUpcoming.length === 0) {
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
            <div className="space-y-6">
                {sortedToday.length > 0 && (
                    <div>
                        <h3 className="text-2xl-custom font-semibold text-gray-800 mb-3">Heute</h3>
                        <div className="space-y-3">
                            {sortedToday.map((appointment) => (
                                <div key={`today-${appointment.churchToolsId}-${appointment.calendarId}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: appointment.color || '#facc15' }}
                                        ></div>
                                        <div>
                                            <span className="text-xl-custom font-medium text-gray-800">
                                                {appointment.title || 'Privater Termin'}
                                            </span>
                                            {appointment.location || appointment.resource ? (
                                                <p className="text-lg text-gray-500">
                                                    {appointment.location || appointment.resource}
                                                </p>
                                            ) : null}
                                            {appointment.calendarName && (
                                                <p className="text-sm text-gray-500">
                                                    {appointment.calendarName}
                                                </p>
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
                    </div>
                )}

                {sortedUpcoming.length > 0 && (
                    <div>
                        {sortedToday.length > 0 && (
                            <div className="border-t-2 border-gray-200 my-6" />
                        )}
                        <h3 className="text-2xl-custom font-semibold text-gray-800 mb-3">Demnächst</h3>
                        <div className="space-y-3">
                            {sortedUpcoming.map((appointment) => (
                                <div key={`upcoming-${appointment.churchToolsId}-${appointment.calendarId}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: appointment.color || '#facc15' }}
                                        ></div>
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
                                            {appointment.location || appointment.resource ? (
                                                <p className="text-lg text-gray-500">
                                                    {appointment.location || appointment.resource}
                                                </p>
                                            ) : null}
                                            {appointment.calendarName && (
                                                <p className="text-sm text-gray-500">
                                                    {appointment.calendarName}
                                                </p>
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
                    </div>
                )}
            </div>
        </section>
    );
}
