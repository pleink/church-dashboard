import { useTodayAppointments, useUpcomingAppointments, useSignageLabels } from "../../hooks/use-signage-data";
import { Calendar } from "lucide-react";
import { SignageList } from "./SignageList";

type Props = {
    className?: string;
};

export default function NextEvents({ className }: Props) {
    const { data: todayAppointments = [], isLoading: isLoadingToday } = useTodayAppointments();
    const { data: upcomingAppointments = [], isLoading: isLoadingUpcoming } = useUpcomingAppointments();
    const { data: labels } = useSignageLabels();
    const title = labels?.eventsTitle || "BLICK VORAUS";
    const todayLabel = labels?.eventsToday || "HEUTE BEI UNS";
    const upcomingLabel = labels?.eventsUpcoming || "IN DEN NÄCHSTEN TAGEN";
    const containerClass = className || "col-span-7 section-card p-12";

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
            <section className={containerClass}>
                <h2 className="text-4xl font-semibold text-church-blue mb-8 flex items-center">
                    <Calendar className="signage-icon text-church-yellow mr-4" size={32} />
                    {title}
                </h2>
                <div className="text-center py-8">
                    <span className="loading loading-ring loading-lg text-church-blue"></span>
                    <p className="text-xl text-gray-600 mt-4">Lade Termine...</p>
                </div>
            </section>
        );
    }

    if (sortedToday.length === 0 && sortedUpcoming.length === 0) {
        return (
            <section className={containerClass}>
                <h2 className="text-4xl font-semibold text-church-blue mb-8 flex items-center">
                    <Calendar className="signage-icon text-church-yellow mr-4" size={32} />
                    {title}
                </h2>
                <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-xl text-gray-500">Keine Veranstaltung gefunden</p>
                </div>
            </section>
        );
    }

    return (
        <section className={containerClass}>
            <h2 className="text-4xl font-semibold text-church-blue mb-8 flex items-center">
                <Calendar className="signage-icon text-church-yellow mr-4" size={32} />
                {title}
            </h2>
            <div className="space-y-6">
                {sortedToday.length > 0 && (
                    <div>
                        <SignageList
                            title={todayLabel}
                            items={sortedToday.map((appointment) => ({
                                key: `today-${appointment.churchToolsId}-${appointment.calendarId}`,
                                color: appointment.color || '#facc15',
                                title: appointment.title || 'Privater Termin',
                                subtitle: appointment.location || appointment.resource,
                                rightPrimary: [appointment.startTime, appointment.endTime].filter(Boolean).join("–") || undefined,
                                rightSecondary: appointment.date,
                            }))}
                            showEndDivider={sortedUpcoming.length > 0}
                        />
                    </div>
                )}

                {sortedUpcoming.length > 0 && (
                    <div>
                        <SignageList
                            title={upcomingLabel}
                            items={sortedUpcoming.map((appointment) => ({
                                key: `upcoming-${appointment.churchToolsId}-${appointment.calendarId}`,
                                color: appointment.color || '#facc15',
                                title: appointment.isPublic && appointment.title ? appointment.title : 'Privater Termin',
                                titleClassName: `text-xl font-medium leading-tight ${appointment.isPublic && appointment.title ? 'text-gray-800' : 'text-gray-500 italic'}`,
                                subtitle: appointment.location || appointment.resource,
                                rightPrimary: [appointment.startTime, appointment.endTime].filter(Boolean).join("–") || undefined,
                                rightSecondary: appointment.date,
                            }))}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
