type Appointment = {
    id: number;
    churchToolsId: number;
    calendarId: number;
    startDateTime?: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    resource: string;
};

export function appointmentKey(appointment: Appointment): string {
    const timestamp = Date.parse(appointment.startDateTime || '');
    const occurrence = Number.isFinite(timestamp)
        ? timestamp
        : [appointment.date, appointment.startTime, appointment.endTime];
    const identity = appointment.churchToolsId || appointment.id
        || [appointment.title, appointment.resource];
    return JSON.stringify([appointment.calendarId, identity, occurrence]);
}

export function groupAppointments<T extends Appointment>(
    todayAppointments: T[],
    upcomingAppointments: T[],
    now = new Date(),
    maxAppointments = 8,
) {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);
    const unique = new Map<string, T>();

    // Prefer the dedicated today's response when the two endpoints overlap.
    for (const appointment of [...todayAppointments, ...upcomingAppointments]) {
        const start = Date.parse(appointment.startDateTime || '');
        if (!Number.isFinite(start) || start < dayStart.getTime()) continue;
        if (!appointment.title && !appointment.resource) continue;
        const key = appointmentKey(appointment);
        if (!unique.has(key)) unique.set(key, appointment);
    }

    const sorted = Array.from(unique.values()).sort((a, b) =>
        Date.parse(a.startDateTime!) - Date.parse(b.startDateTime!));
    const today = sorted.filter(a => Date.parse(a.startDateTime!) < nextDay.getTime()).slice(0, maxAppointments);
    const upcoming = sorted.filter(a => Date.parse(a.startDateTime!) >= nextDay.getTime())
        .slice(0, Math.max(0, maxAppointments - today.length));
    return { today, upcoming };
}
