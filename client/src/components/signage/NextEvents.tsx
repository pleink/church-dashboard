import { useTodayAppointments, useUpcomingAppointments, useSignageLabels, useSignageSettings } from "../../hooks/use-signage-data";
import { Calendar } from "lucide-react";
import { SignageList } from "./SignageList";
import { SignageSection } from "./SignageSection";
import { appointmentKey, groupAppointments } from "@/lib/signage-appointments";
import { getMaxEventsDisplay } from "@shared/signage-settings";

type Props = {
    className?: string;
};

export default function NextEvents({ className }: Props) {
    const { data: todayAppointments = [], isLoading: isLoadingToday } = useTodayAppointments();
    const { data: upcomingAppointments = [], isLoading: isLoadingUpcoming } = useUpcomingAppointments();
    const { data: labels } = useSignageLabels();
    const { data: settings, isLoading: isLoadingSettings } = useSignageSettings();
    const title = labels?.eventsTitle || "BLICK VORAUS";
    const todayLabel = labels?.eventsToday || "HEUTE BEI UNS";
    const upcomingLabel = labels?.eventsUpcoming || "IN DEN NÄCHSTEN TAGEN";
    const containerClass = className || "col-span-7 section-card p-12";

    const { today: sortedToday, upcoming: sortedUpcoming } = groupAppointments(
        todayAppointments, upcomingAppointments, new Date(), getMaxEventsDisplay(settings?.maxEventsDisplay),
    );

    const headingIcon = <Calendar size={32} />;

    if (isLoadingToday || isLoadingUpcoming || isLoadingSettings) {
        return (
            <SignageSection
                className={containerClass}
                title={title}
                icon={headingIcon}
            >
                <div className="text-center py-8">
                    <span className="loading loading-ring loading-lg text-church-blue"></span>
                    <p className="text-xl text-gray-600 mt-4">Lade Termine...</p>
                </div>
            </SignageSection>
        );
    }

    if (sortedToday.length === 0 && sortedUpcoming.length === 0) {
        return (
            <SignageSection
                className={containerClass}
                title={title}
                icon={headingIcon}
            >
                <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-xl text-gray-500">Keine Veranstaltung gefunden</p>
                </div>
            </SignageSection>
        );
    }

    return (
        <SignageSection
            className={containerClass}
            title={title}
            icon={headingIcon}
        >
            <div className="space-y-6">
                {sortedToday.length > 0 && (
                    <SignageList
                        title={todayLabel}
                        items={sortedToday.map((appointment) => ({
                            key: appointmentKey(appointment),
                            color: appointment.color || '#facc15',
                            title: appointment.title || 'Privater Termin',
                            subtitle: appointment.location || appointment.resource,
                            rightPrimary: [appointment.startTime, appointment.endTime].filter(Boolean).join("–") || undefined,
                            rightSecondary: appointment.date,
                        }))}
                        showEndDivider={sortedUpcoming.length > 0}
                    />
                )}

                {sortedUpcoming.length > 0 && (
                    <SignageList
                        title={upcomingLabel}
                        items={sortedUpcoming.map((appointment) => ({
                            key: appointmentKey(appointment),
                            color: appointment.color || '#facc15',
                            title: appointment.isPublic && appointment.title ? appointment.title : 'Privater Termin',
                            titleClassName: `text-xl font-medium leading-tight ${appointment.isPublic && appointment.title ? 'text-gray-800' : 'text-gray-500 italic'}`,
                            subtitle: appointment.location || appointment.resource,
                            rightPrimary: [appointment.startTime, appointment.endTime].filter(Boolean).join("–") || undefined,
                            rightSecondary: appointment.date,
                        }))}
                    />
                )}
            </div>
        </SignageSection>
    );
}
