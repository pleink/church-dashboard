import type {Express} from "express";
import {createServer, type Server} from "http";
import {getChurchToolsService} from "./services/churchtools";
import config from "../config.json";


export async function registerRoutes(app: Express): Promise<Server> {
    const churchToolsService = getChurchToolsService();
    const roomTypeIds = config.resources?.roomTypeIds ?? [2];
    const titleOverrides = (config.calendars?.titleOverrides ?? {}) as Record<string, string>;
    const descriptionOverrides = (config.calendars?.descriptionOverrides ?? {}) as Record<string, string>;
    const allConfiguredCalendars: number[] = Array.from(new Set([
        ...(config.calendars?.sermons ?? []),
        ...(config.calendars?.churchEvents ?? []),
        ...(config.calendars?.groupEvents ?? []),
    ]));

    const serviceConfig = {
        excludeGroupIds: config.services?.excludeGroupIds ?? [],
        kidsDescriptions: config.services?.kidsDescriptions ?? {},
        kidsStatus: config.services?.kidsStatus ?? {
            kidsDrin: "Kids drinnen",
            kidsDraussen: "Kids draussen",
            teensDrin: "Teens drinnen",
            teensDraussen: "Teens draussen",
        },
        specialsKeywords: config.services?.specialsKeywords ?? ["Abendmahl", "Kirche weltweit"],
    };

    const getDisplayTitle = (appointment: any) => {
        const calendarId = appointment.base?.calendar?.id;
        const override = calendarId != null ? titleOverrides[String(calendarId)] : undefined;
        return override || appointment.base?.title || appointment.base?.caption || 'Termin';
    };

    const getDisplayDescription = (appointment: any) => {
        const calendarId = appointment.base?.calendar?.id;
        const override = calendarId != null ? descriptionOverrides[String(calendarId)] : undefined;
        return override ?? (appointment.base?.description || '');
    };

    const getRoomResources = (appointment: any) => {
        const bookings = appointment.bookings || [];
        const getRes = (booking: any) =>
            booking.resource ||
            booking.base?.resource ||
            booking.resource?.base ||
            booking.base?.resource?.base;

        const toLabel = (booking: any) => {
            const res = getRes(booking) || {};
            const name = res.name || '';
            const loc = res.location || '';
            return loc ? `${name} (${loc})` : name;
        };

        const roomNames = bookings
            .filter((booking: any) => {
                const res = getRes(booking);
                return res?.resourceTypeId && roomTypeIds.includes(res.resourceTypeId);
            })
            .map(toLabel)
            .filter(Boolean);

        if (roomNames.length > 0) return roomNames.join(', ');

        // Fallback: if no matching room type, list all booking resources
        const allNames = bookings.map(toLabel).filter(Boolean);
        return allNames.join(', ');
    };

    const extractImage = (appointment: any) => {
        const baseImg = appointment.base?.image;
        const eventImg = appointment.event?.image;
        return (
            baseImg?.fileUrl ||
            eventImg?.fileUrl ||
            baseImg?.imageUrl ||
            eventImg?.imageUrl ||
            ''
        );
    };

    const getCalendarColor = (appointment: any) =>
        appointment.base?.calendar?.color || undefined;

    const getStart = (appointment: any) =>
        appointment.calculated?.startDate ||
        appointment.appointment?.calculated?.startDate ||
        appointment.base?.startDate ||
        '';

    const getEnd = (appointment: any) =>
        appointment.calculated?.endDate ||
        appointment.appointment?.calculated?.endDate ||
        appointment.base?.endDate ||
        '';

    const dedupeById = (items: any[]) => {
        const seen = new Set<number>();
        return items.filter((item) => {
            const id = item.id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    };

    const getNow = () => new Date();

    const computeGastroStatus = (serviceId: number, hasStaff: boolean) => {
        const now = getNow();
        const minutes = now.getHours() * 60 + now.getMinutes();

        if (!hasStaff) {
            return { status: 'unavailable', label: 'Heute geschlossen', tone: 'muted' as const };
        }

        // Kaffeebar (id 140): open 09:30-09:55, last 5 min yellow
        if (serviceId === 140) {
            const start = 9 * 60 + 30; // 09:30
            const warn = 9 * 60 + 50;  // 09:50
            const end = 9 * 60 + 55;   // 09:55

            if (minutes < start || minutes > end) {
                return { status: 'closed', label: 'Geschlossen', tone: 'red' as const };
            }
            if (minutes >= warn) {
                return { status: 'closingSoon', label: 'Schliesst bald', tone: 'yellow' as const };
            }
            return { status: 'open', label: 'Offen', tone: 'green' as const };
        }

        // Bistro (id 127): opens 11:30, closes 13:00
        if (serviceId === 127) {
            const start = 11 * 60 + 30; // 11:30
            const end = 13 * 60;        // 13:00

            if (minutes < start) {
                return { status: 'openingSoon', label: 'Öffnet um 11:30', tone: 'yellow' as const };
            }
            if (minutes > end) {
                return { status: 'closed', label: 'Geschlossen', tone: 'red' as const };
            }
            return { status: 'open', label: 'Offen', tone: 'green' as const };
        }

        return { status: 'open', label: 'Offen', tone: 'green' as const };
    };
    // Signage data endpoints
    // Sermons (next service) endpoint
    app.get("/api/signage/sermon", async (_req, res) => {
        try {
            const sermonCalendarIds = config.calendars?.sermons ?? [];
            const sermonAppointments = await churchToolsService.getCalendarAppointments(
                sermonCalendarIds,
                config.signage?.maxUpcomingDays ?? 30
            );

            const now = new Date();
            const nextSermon = sermonAppointments
                .map((a: any) => {
                    const start = getStart(a);
                    const end = getEnd(a);
                    return {
                        ...a,
                        start,
                        end,
                        startDate: start ? new Date(start) : null,
                    };
                })
                .filter((a: any) => a.startDate && a.startDate >= now)
                .sort((a: any, b: any) => {
                    if (!a.startDate || !b.startDate) return 0;
                    return a.startDate.getTime() - b.startDate.getTime();
                })[0];

            if (!nextSermon) {
                return res.status(404).json({message: "Keine bevorstehenden Gottesdienste gefunden"});
            }

            const startDate = nextSermon.start || '';
            const endDate = nextSermon.end || '';

            const kidsAllowedIds = new Set(Object.keys(serviceConfig.kidsDescriptions || {}).map((k) => Number(k)));

            // Try to enrich with event details (services/description)
            const events = await churchToolsService.getUpcomingEvents(10);
            const matchedEvent = events.find((ev: any) => ev.startDate === startDate) || null;
            const detailedEvent = matchedEvent ? await churchToolsService.getEvent(matchedEvent.id!) : null;
            const allServices = await churchToolsService.getServices();

            const descriptionText = detailedEvent?.description || detailedEvent?.note || nextSermon.base?.description || '';
            const descriptionLines: string[] = descriptionText
                ? descriptionText.split('\n').map((line: string) => line.trim()).filter(Boolean)
                : [];

            const predigtLine = descriptionLines.find((line: string) => line.toLowerCase().includes('predigt')) || '';
            const predigtText = predigtLine ? predigtLine.replace(/predigt[:]?\\s*/i, '') : '';
            const specials = descriptionLines.filter((line: string) =>
                (serviceConfig.specialsKeywords || []).some((kw: string) =>
                    line.toLowerCase().includes(kw.toLowerCase())
                )
            );
            const hasKidsDraussen = descriptionLines.some((line: string) => /kids\s*drau/i.test(line));
            const hasKidsDrin = descriptionLines.some((line: string) => /kids\s*drin/i.test(line));
            const hasTeensDraussen = descriptionLines.some((line: string) => /teens\s*drau/i.test(line));
            const hasTeensDrin = descriptionLines.some((line: string) => /teens\s*drin/i.test(line));

            const services = (detailedEvent?.eventServices || [])
                .map((svc: any) => {
                    const def = allServices.find((d) => d.id === svc.serviceId);
                    const groupId = def?.serviceGroupId ?? null;
                    return {
                        id: svc.serviceId,
                        name: def?.name || svc.name || svc.person?.title || '',
                        person: svc.person?.title || svc.name || '',
                        groupId,
                    };
                })
                .filter((svc) => {
                    if (kidsAllowedIds.has(svc.id) || svc.id === 136) return true;
                    return svc.groupId == null || !serviceConfig.excludeGroupIds.includes(svc.groupId);
                });

            // Build gastro list from definitions to ensure they appear even without staffing
            const gastroDefs = allServices.filter((d) => d.serviceGroupId === 8);

            const categorizedServices = {
                program: dedupeById(
                    services
                        .filter(s => (s.groupId === 1 || (s.groupId !== 5 && s.groupId !== 8)) && !!s.person)
                        .sort((a, b) => a.id - b.id)
                ),
                kids: dedupeById(
                    services
                        .filter(s => (s.groupId === 5 || s.id === 136) && kidsAllowedIds.has(s.id))
                        .map(s => {
                            const baseDesc = (serviceConfig.kidsDescriptions as Record<string, string>)[String(s.id)] || undefined;
                            let statusLabel: string | undefined = undefined;
                            if (s.id === 136) {
                                if (hasTeensDraussen) statusLabel = serviceConfig.kidsStatus?.teensDraussen;
                                else if (hasTeensDrin) statusLabel = serviceConfig.kidsStatus?.teensDrin;
                            } else {
                                if (hasKidsDraussen) statusLabel = serviceConfig.kidsStatus?.kidsDraussen;
                                else if (hasKidsDrin) statusLabel = serviceConfig.kidsStatus?.kidsDrin;
                            }
                            return {
                                ...s,
                                description: baseDesc,
                                statusLabel,
                            };
                        })
                        .sort((a, b) => a.id - b.id)
                ),
                gastro: dedupeById(
                    gastroDefs
                        .map((def) => {
                            const assigned = services.find((s) => s.id === def.id);
                            const hasStaff = !!assigned;
                            const status = computeGastroStatus(def.id, hasStaff);
                            return {
                                id: def.id,
                                name: def.name,
                                person: undefined,
                                status: status.status,
                                label: status.label,
                                tone: status.tone,
                            };
                        })
                        .sort((a, b) => a.id - b.id)
                ),
            };

            const formattedEvent = {
                id: nextSermon.base?.id || 0,
                title: getDisplayTitle(nextSermon),
                description: getDisplayDescription(nextSermon),
                color: getCalendarColor(nextSermon),
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
                imageUrl: extractImage(nextSermon),
                location: '',
                descriptionLines,
                predigtLine: predigtText,
                specials,
                services: categorizedServices
            };

            res.json(formattedEvent);
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({message: "Fehler beim Laden der Veranstaltungen"});
        }
    });

    app.get("/api/signage/appointments/today", async (req, res) => {
        try {
            // Get today's appointments from configured calendars
            const churchToolsAppointments = await churchToolsService.getTodayAppointments();
            const sermonIds = config.calendars?.sermons ?? [];
            const filteredAppointments = churchToolsAppointments.filter((appointment: any) => {
                const calendarId = appointment.base?.calendar?.id || 0;
                return !sermonIds.includes(calendarId);
            });

            if (filteredAppointments.length > 0) {
                const formattedAppointments = filteredAppointments.map((appointment: any) => {
                    const calendarId = appointment.base?.calendar?.id || 0;
                    const isPublic = appointment.base?.calendar?.isPublic ?? churchToolsService.isPublicCalendar(calendarId);
                    const allowDisplay = isPublic || allConfiguredCalendars.includes(calendarId);
                    const resources = getRoomResources(appointment);
                    const start = getStart(appointment);
                    const end = getEnd(appointment);

                    return {
                        id: appointment.base?.id || 0,
                        churchToolsId: appointment.base?.id || 0,
                        title: allowDisplay ? getDisplayTitle(appointment) : '',
                        color: getCalendarColor(appointment),
                        startDateTime: start,
                        calendarName: appointment.base?.calendar?.name || '',
                        location: getRoomResources(appointment),
                        startTime: start ? new Date(start).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        endTime: end ? new Date(end).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        date: start ? new Date(start).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        }) : '',
                        resource: resources,
                        isPublic: allowDisplay,
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
            const maxUpcomingDays = config.signage?.maxUpcomingDays ?? 7;
            const churchToolsAppointments = await churchToolsService.getUpcomingAppointments(maxUpcomingDays);
            const sermonIds = config.calendars?.sermons ?? [];
            const filteredAppointments = churchToolsAppointments.filter((appointment: any) => {
                const calendarId = appointment.base?.calendar?.id || 0;
                return !sermonIds.includes(calendarId);
            });

            if (filteredAppointments.length > 0) {
                const formattedAppointments = filteredAppointments.map((appointment: any) => {
                    const calendarId = appointment.base?.calendar?.id || 0;
                    const isPublic = appointment.base?.calendar?.isPublic ?? churchToolsService.isPublicCalendar(calendarId);
                    const allowDisplay = isPublic || allConfiguredCalendars.includes(calendarId);
                    const resources = getRoomResources(appointment);
                    const start = getStart(appointment);
                    const end = getEnd(appointment);

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
                        title: allowDisplay ? getDisplayTitle(appointment) : '',
                        color: getCalendarColor(appointment),
                        startDateTime: start,
                        calendarName: appointment.base?.calendar?.name || '',
                        location: getRoomResources(appointment),
                        startTime: start ? new Date(start).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        endTime: end ? new Date(end).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                        date: start ? new Date(start).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        }) : '',
                        resource: resourceText,
                            isPublic: allowDisplay,
                            calendarId,
                            imageUrl: extractImage(appointment)
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
                    id: birthday.person?.domainIdentifier || birthday.id,
                    churchToolsId: birthday.person?.domainIdentifier || birthday.id,
                    name: birthday.person ? `${birthday.person.domainAttributes.firstName} ${birthday.person.domainAttributes.lastName}` : 'Unbekannt',
                    birthdayText: birthday.anniversary ? new Date(birthday.anniversary).toLocaleDateString('de-DE', {
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
            // Fetch daily verse from Devotionalium API with configured translation
            const apiUrl = `https://devotionalium.com/api/v2?lang=${config.devotionalium.language}&bibleVersion=${config.devotionalium.bibleVersion}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Devotionalium API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Get the Bible verse (collection 1 = New Testament)
            const bibleVerse = data['1'];
            
            if (bibleVerse && bibleVerse.text) {
                res.json({
                    id: 1,
                    text: bibleVerse.text,
                    reference: bibleVerse.reference,
                    source: 'Devotionalium',
                    date: data.date
                });
            } else {
                // Fallback to default verse if API doesn't return Bible verse
                res.json({
                    id: 0,
                    text: "Jesus redete zu ihnen und sprach: Ich bin das Licht der Welt. Wer mir nachfolgt, wird nicht in der Finsternis wandeln, sondern das Licht des Lebens haben.",
                    reference: "Johannes 8:12",
                    source: 'Fallback'
                });
            }
        } catch (error) {
            console.error("Error fetching verse from Devotionalium:", error);
            
            // Fallback to default verse on error
            res.json({
                id: 0,
                text: "Jesus redete zu ihnen und sprach: Ich bin das Licht der Welt. Wer mir nachfolgt, wird nicht in der Finsternis wandeln, sondern das Licht des Lebens haben.",
                reference: "Johannes 8:12",
                source: 'Fallback'
            });
        }
    });

    app.get("/api/signage/flyers", async (req, res) => {
        try {
            // Get upcoming appointments from configured calendars that have images
            const publicAppointments = await churchToolsService.getUpcomingAppointments(30);
            
            // Filter for public calendar appointments with images
            const appointmentsWithImages = publicAppointments
                .filter((appointment: any) => {
                    const calendarId = appointment.base?.calendar?.id || 0;
                    const hasImage = extractImage(appointment);
                    const inConfig = allConfiguredCalendars.includes(calendarId);
                    return inConfig && hasImage;
                })
                .slice(0, 5); // Limit for performance

            let formattedFlyers = appointmentsWithImages.map((appointment: any) => ({
                id: appointment.base?.id || 0,
                churchToolsId: appointment.base?.id || 0,
                imageUrl: extractImage(appointment),
                title: getDisplayTitle(appointment),
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
            await churchToolsService.getUpcomingEvents(1, { throwOnError: true });
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
