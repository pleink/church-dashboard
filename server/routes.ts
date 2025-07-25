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

    app.get("/api/signage/bookings/today", async (req, res) => {
        try {
            // Try ChurchTools first
            const churchToolsBookings = await churchToolsService.getTodayBookings();

            if (churchToolsBookings.length > 0) {
                // Group bookings by unique combination of title, start time, and end time
                // but collect all room names for each event
                const groupedBookings = new Map();
                
                churchToolsBookings.forEach(booking => {
                    const key = `${booking.base?.caption}-${booking.base?.startDate}-${booking.base?.endDate}`;
                    const roomName = booking.base?.resource?.name || 'Raum';
                    
                    if (groupedBookings.has(key)) {
                        const existing = groupedBookings.get(key);
                        if (!existing.rooms.includes(roomName)) {
                            existing.rooms.push(roomName);
                        }
                    } else {
                        groupedBookings.set(key, {
                            booking,
                            rooms: [roomName]
                        });
                    }
                });

                const formattedBookings = Array.from(groupedBookings.values()).map(({ booking, rooms }) => {
                    // Limit room display to avoid text wrapping
                    let resourceText = rooms.join(', ');
                    if (resourceText.length > 40) {
                        const firstThreeRooms = rooms.slice(0, 3).join(', ');
                        if (rooms.length > 3) {
                            resourceText = `${firstThreeRooms} +${rooms.length - 3}`;
                        } else {
                            resourceText = firstThreeRooms;
                        }
                    }
                    
                    return {
                        id: booking.base?.id || 0,
                        title: booking.base?.caption || 'Buchung',
                        startTime: booking.base?.startDate ? new Date(booking.base.startDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        endTime: booking.base?.endDate ? new Date(booking.base.endDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        resource: resourceText,
                        startDate: booking.base?.startDate
                    };
                }).sort((a, b) => {
                    const dateA = a.startDate ? new Date(a.startDate) : new Date();
                    const dateB = b.startDate ? new Date(b.startDate) : new Date();
                    return dateA.getTime() - dateB.getTime();
                }).map(({ startDate, ...booking }) => booking);

                res.json(formattedBookings);
            } else {
                res.json([]);
            }
        } catch (error) {
            console.error("Error fetching today's bookings:", error);
            res.status(500).json({message: "Fehler beim Laden der heutigen Raumbelegungen"});
        }
    });

    app.get("/api/signage/bookings/upcoming", async (req, res) => {
        try {
            // Get upcoming bookings from ChurchTools
            const churchToolsBookings = await churchToolsService.getUpcomingBookings(7);

            if (churchToolsBookings.length > 0) {
                // Sort bookings by date BEFORE grouping
                const sortedBookings = churchToolsBookings.sort((a, b) => {
                    const dateA = a.base?.startDate ? new Date(a.base.startDate) : new Date();
                    const dateB = b.base?.startDate ? new Date(b.base.startDate) : new Date();
                    return dateA.getTime() - dateB.getTime();
                });
                
                // Group bookings by unique combination of title, start time, and end time
                // but collect all room names for each event
                const groupedBookings = new Map();
                
                sortedBookings.forEach(booking => {
                    const key = `${booking.base?.caption}-${booking.base?.startDate}-${booking.base?.endDate}`;
                    const roomName = booking.base?.resource?.name || 'Raum';
                    
                    if (groupedBookings.has(key)) {
                        const existing = groupedBookings.get(key);
                        if (!existing.rooms.includes(roomName)) {
                            existing.rooms.push(roomName);
                        }
                    } else {
                        groupedBookings.set(key, {
                            booking,
                            rooms: [roomName]
                        });
                    }
                });

                const formattedBookings = Array.from(groupedBookings.values()).map(({ booking, rooms }) => {
                    // Limit room display to avoid text wrapping
                    let resourceText = rooms.join(', ');
                    if (resourceText.length > 40) {
                        const firstThreeRooms = rooms.slice(0, 3).join(', ');
                        if (rooms.length > 3) {
                            resourceText = `${firstThreeRooms} +${rooms.length - 3}`;
                        } else {
                            resourceText = firstThreeRooms;
                        }
                    }
                    
                    return {
                        id: booking.base?.id || 0,
                        title: booking.base?.caption || 'Buchung',
                        startTime: booking.base?.startDate ? new Date(booking.base.startDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        endTime: booking.base?.endDate ? new Date(booking.base.endDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        date: booking.base?.startDate ? new Date(booking.base.startDate).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        }) : '',
                        resource: resourceText,
                        sortKey: booking.base?.startDate
                    };
                }).sort((a, b) => {
                    if (!a.sortKey || !b.sortKey) return 0;
                    return new Date(a.sortKey).getTime() - new Date(b.sortKey).getTime();
                }).map(({ sortKey, ...booking }) => booking);

                res.json(formattedBookings);
            } else {
                res.json([]);
            }
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
                const formattedBirthdays = churchToolsBirthdays.map(birthday => ({
                    id: birthday.person?.domainIdentifier || birthday.date,
                    name: birthday.person ? `${birthday.person.domainAttributes.firstName} ${birthday.person.domainAttributes.lastName}` : 'Unbekannt',
                    birthdayText: birthday.date ? new Date(birthday.date).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    }) : '',
                    avatar: birthday.person?.imageUrl || ''
                }));

                res.json(formattedBirthdays);
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
            const flyers = await storage.getFlyers();
            const formattedFlyers = (flyers || []).map(flyer => ({
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



    const httpServer = createServer(app);
    return httpServer;
}
