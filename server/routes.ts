import type {Express} from "express";
import {createServer, type Server} from "http";
import {storage} from "./storage";
import {getChurchToolsService} from "./services/churchtools";


export async function registerRoutes(app: Express): Promise<Server> {
    const churchToolsService = getChurchToolsService();
    // Signage data endpoints
    app.get("/api/signage/events", async (req, res) => {
        try {
            // Try to fetch from ChurchTools first
            const churchToolsEvents = await churchToolsService.getUpcomingEvents(1);

            if (churchToolsEvents.length > 0) {
                const event = churchToolsEvents[0];
                const startDate = event.startDate || '';
                const endDate = event.endDate || '';
                
                const formattedEvent = {
                    id: event.id,
                    title: event.name || 'Veranstaltung',
                    description: event.description || '',
                    date: startDate ? new Date(startDate).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }) : '',
                    time: startDate && endDate ? `${new Date(startDate).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}–${new Date(endDate).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}` : '',
                    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
                    location: ''
                };

                res.json(formattedEvent);
            } else {
                res.status(404).json({message: "Keine bevorstehenden Veranstaltungen gefunden"});
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({message: "Fehler beim Laden der Veranstaltungen"});
        }
    });

    app.get("/api/signage/appointments/today", async (req, res) => {
        try {
            // Get today's appointments from ChurchTools calendars
            const churchToolsAppointments = await churchToolsService.getTodayAppointments();

            if (churchToolsAppointments.length > 0) {
                const formattedAppointments = churchToolsAppointments.map((appointment: any) => {
                    const calendarId = appointment.base?.calendar?.id || 0;
                    const isPublic = churchToolsService.isPublicCalendar(calendarId);
                    const resources = appointment.bookings?.map((booking: any) => booking.resource?.name).filter(Boolean).join(', ') || '';

                    return {
                        id: appointment.base?.id || 0,
                        churchToolsId: appointment.base?.id || 0,
                        title: isPublic ? (appointment.base?.title || appointment.base?.caption || 'Termin') : '',
                        startTime: appointment.base?.startDate ? new Date(appointment.base.startDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        endTime: appointment.base?.endDate ? new Date(appointment.base.endDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        date: appointment.base?.startDate ? new Date(appointment.base.startDate).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        }) : '',
                        resource: resources,
                        isPublic,
                        calendarId
                    };
                });

                res.json(formattedAppointments);
            } else {
                res.json([]);
            }
        } catch (error) {
            console.error("Error fetching today's appointments:", error);
            res.status(500).json({message: "Fehler beim Laden der heutigen Termine"});
        }
    });

    app.get("/api/signage/appointments/upcoming", async (req, res) => {
        try {
            // Get upcoming appointments from ChurchTools calendars
            const churchToolsAppointments = await churchToolsService.getUpcomingAppointments(7);

            if (churchToolsAppointments.length > 0) {
                const formattedAppointments = churchToolsAppointments.map((appointment: any) => {
                    const calendarId = appointment.base?.calendar?.id || 0;
                    const isPublic = churchToolsService.isPublicCalendar(calendarId);
                    const resources = appointment.bookings?.map((booking: any) => booking.resource?.name).filter(Boolean).join(', ') || '';

                    // Limit resource display to avoid text wrapping
                    let resourceText = resources;
                    if (resourceText.length > 40) {
                        const resourceList = resources.split(', ');
                        const firstThreeResources = resourceList.slice(0, 3).join(', ');
                        if (resourceList.length > 3) {
                            resourceText = `${firstThreeResources} +${resourceList.length - 3}`;
                        } else {
                            resourceText = firstThreeResources;
                        }
                    }
                    
                    return {
                        id: appointment.base?.id || 0,
                        churchToolsId: appointment.base?.id || 0,
                        title: isPublic ? (appointment.base?.title || appointment.base?.caption || 'Termin') : '',
                        startTime: appointment.base?.startDate ? new Date(appointment.base.startDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        endTime: appointment.base?.endDate ? new Date(appointment.base.endDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        date: appointment.base?.startDate ? new Date(appointment.base.startDate).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        }) : '',
                        resource: resourceText,
                        isPublic,
                        calendarId,
                        imageUrl: appointment.base?.image?.fileUrl || null
                    };
                });

                res.json(formattedAppointments);
            } else {
                res.json([]);
            }
        } catch (error) {
            console.error("Error fetching upcoming appointments:", error);
            res.status(500).json({message: "Fehler beim Laden der anstehenden Termine"});
        }
    });

    app.get("/api/signage/birthdays", async (req, res) => {
        try {
            // Get birthdays from ChurchTools
            const churchToolsBirthdays = await churchToolsService.getBirthdaysThisWeek();

            if (churchToolsBirthdays.length > 0) {
                const formattedBirthdays = churchToolsBirthdays.map((birthday: any) => ({
                    id: birthday.person?.domainIdentifier || birthday.date,
                    churchToolsId: birthday.person?.domainIdentifier || birthday.date,
                    name: birthday.person ? `${birthday.person.domainAttributes.firstName} ${birthday.person.domainAttributes.lastName}` : 'Unbekannt',
                    birthdayText: birthday.date ? new Date(birthday.date).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    }) : '',
                    avatar: birthday.person?.imageUrl || ''
                }));

                res.json(formattedBirthdays.slice(0, 4)); // Limit to 4 birthdays as requested
            } else {
                res.json([]);
            }
        } catch (error) {
            console.error("Error fetching birthdays:", error);
            res.status(500).json({message: "Fehler beim Laden der Geburtstage"});
        }
    });

    app.get("/api/signage/verse", async (req, res) => {
        try {
            const verse = await storage.getCurrentVerseOfWeek();
            if (verse) {
                res.json({
                    id: verse.id,
                    text: verse.text,
                    reference: verse.reference
                });
            } else {
                // Default verse if none found
                res.json({
                    id: 0,
                    text: "Jesus redete zu ihnen und sprach: Ich bin das Licht der Welt. Wer mir nachfolgt, wird nicht in der Finsternis wandeln, sondern das Licht des Lebens haben.",
                    reference: "Johannes 8:12"
                });
            }
        } catch (error) {
            console.error("Error fetching verse:", error);
            res.status(500).json({message: "Fehler beim Laden des Bibelverses"});
        }
    });

    app.get("/api/signage/flyers", async (req, res) => {
        try {
            // Get upcoming appointments from public calendars that have images
            const publicAppointments = await churchToolsService.getUpcomingAppointments(7);
            
            // Filter for public calendar appointments with images
            const appointmentsWithImages = publicAppointments
                .filter((appointment: any) => {
                    const calendarId = appointment.base?.calendar?.id || 0;
                    const hasImage = appointment.base?.image?.fileUrl || appointment.event?.image?.fileUrl;
                    return churchToolsService.isPublicCalendar(calendarId) && hasImage;
                })
                .slice(0, 5); // Limit for performance

            const formattedFlyers = appointmentsWithImages.map((appointment: any) => ({
                id: appointment.base?.id || 0,
                churchToolsId: appointment.base?.id || 0,
                imageUrl: appointment.base?.image?.fileUrl || appointment.event?.image?.fileUrl || '',
                title: appointment.base?.title || appointment.base?.caption || appointment.event?.name || 'Veranstaltung',
                startDate: appointment.base?.startDate || ''
            }));

            res.json(formattedFlyers);
        } catch (error) {
            console.error("Error fetching flyers:", error);
            res.status(500).json({message: "Fehler beim Laden der Flyer"});
        }
    });


    app.get("/api/signage/status", async (req, res) => {
        try {
            // Test ChurchTools connectivity
            await churchToolsService.getUpcomingEvents(1);
            res.json({
                connected: true,
                lastUpdate: new Date().toISOString(),
                service: 'ChurchTools'
            });
        } catch (error) {
            res.json({
                connected: false,
                lastUpdate: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                service: 'ChurchTools'
            });
        }
    });



    const httpServer = createServer(app);
    return httpServer;
}
