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
                const formattedEvent = {
                    id: event.id,
                    title: event.name,
                    description: event.description,
                    date: new Date(event.startdate).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }),
                    time: `${new Date(event.startdate).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}–${new Date(event.enddate).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}`,
                    imageUrl: event.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
                    location: event.location
                };

                res.json(formattedEvent);
            } else {
                // Fallback to stored events
                const events = await storage.getUpcomingEvents(1);
                if (events.length > 0) {
                    const event = events[0];
                    const formattedEvent = {
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        date: new Date(event.startDate).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }),
                        time: `${new Date(event.startDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}–${new Date(event.endDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}`,
                        imageUrl: event.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
                        location: event.location
                    };

                    res.json(formattedEvent);
                } else {
                    res.status(404).json({message: "Keine bevorstehenden Veranstaltungen gefunden"});
                }
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({message: "Fehler beim Laden der Veranstaltungen"});
        }
    });

    app.get("/api/signage/bookings/today", async (req, res) => {
        try {
            // Try ChurchTools first
            const churchToolsBookings = await churchToolsService.getTodayBookings();

            if (churchToolsBookings.length > 0) {
                const formattedBookings = churchToolsBookings.map(booking => ({
                    id: booking.id,
                    title: booking.caption,
                    startTime: new Date(booking.startdate).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    endTime: new Date(booking.enddate).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    resource: booking.resource.name
                }));

                res.json(formattedBookings);
            } else {
                // Fallback to stored today's bookings
                const bookings = await storage.getTodayRoomBookings();
                const formattedBookings = bookings.map(booking => ({
                    id: booking.id,
                    title: booking.title,
                    startTime: new Date(booking.startTime).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    endTime: new Date(booking.endTime).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    resource: booking.resourceName
                }));

                res.json(formattedBookings);
            }
        } catch (error) {
            console.error("Error fetching today's bookings:", error);
            res.status(500).json({message: "Fehler beim Laden der heutigen Raumbelegungen"});
        }
    });

    app.get("/api/signage/bookings/upcoming", async (req, res) => {
        try {
            // For upcoming bookings, use stored data (starts from tomorrow)
            const bookings = await storage.getUpcomingRoomBookings(7);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const upcomingBookings = bookings.filter(booking =>
                new Date(booking.startTime) >= tomorrow
            ).slice(0, 5); // Limit to 5 upcoming bookings

            const formattedBookings = upcomingBookings.map(booking => ({
                id: booking.id,
                title: booking.title,
                startTime: new Date(booking.startTime).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                endTime: new Date(booking.endTime).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                date: new Date(booking.startTime).toLocaleDateString('de-DE', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                }),
                resource: booking.resourceName
            }));

            res.json(formattedBookings);
        } catch (error) {
            console.error("Error fetching upcoming bookings:", error);
            res.status(500).json({message: "Fehler beim Laden der anstehenden Raumbelegungen"});
        }
    });

    app.get("/api/signage/birthdays", async (req, res) => {
        try {
            // Try ChurchTools first
            const churchToolsBirthdays = await churchToolsService.getBirthdaysThisWeek();

            if (churchToolsBirthdays.length > 0) {
                const formattedBirthdays = churchToolsBirthdays.map(person => ({
                    id: person.id,
                    name: `${person.firstName} ${person.lastName}`,
                    birthdayText: person.birthdate ? new Date(person.birthdate).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    }) : '',
                    avatar: person.imageUrl
                }));

                res.json(formattedBirthdays);
            } else {
                // Fallback to stored birthdays
                const birthdays = await storage.getWeeklyBirthdays();
                const formattedBirthdays = birthdays.map(birthday => ({
                    id: birthday.id,
                    name: birthday.name,
                    birthdayText: new Date(birthday.birthDate).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    }),
                    avatar: birthday.avatarUrl
                }));

                res.json(formattedBirthdays);
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
            const flyers = await storage.getFlyers();
            const formattedFlyers = flyers.map(flyer => ({
                id: flyer.id,
                imageUrl: flyer.imageUrl,
                title: flyer.description
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

    // Sync endpoint for manual data refresh
    app.post("/api/signage/sync", async (req, res) => {
        try {
            await Promise.all([
                churchToolsService.syncEvents(),
                churchToolsService.syncBookings(),
                churchToolsService.syncBirthdays()
            ]);

            res.json({
                success: true,
                message: "Daten erfolgreich synchronisiert",
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error("Sync error:", error);
            res.status(500).json({
                success: false,
                message: "Fehler bei der Synchronisation",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}
