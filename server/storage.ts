import {
    users, events, roomBookings, birthdays, verseOfWeek,
    type User, type InsertUser, type Event, type RoomBooking,
    type Birthday, type VerseOfWeek, type Flyer, type InsertEvent,
    type InsertRoomBooking, type InsertBirthday, type InsertVerseOfWeek, type InsertFlyer
} from "@shared/schema";

export interface IStorage {
    getUser(id: number): Promise<User | undefined>;

    getUserByUsername(username: string): Promise<User | undefined>;

    createUser(user: InsertUser): Promise<User>;

    // Events
    getUpcomingEvents(limit?: number): Promise<Event[]>;

    createEvent(event: InsertEvent): Promise<Event>;

    // Room Bookings
    getTodayRoomBookings(): Promise<RoomBooking[]>;

    getUpcomingRoomBookings(days?: number): Promise<RoomBooking[]>;

    createRoomBooking(booking: InsertRoomBooking): Promise<RoomBooking>;

    // Birthdays
    getWeeklyBirthdays(): Promise<Birthday[]>;

    createBirthday(birthday: InsertBirthday): Promise<Birthday>;

    // Verse of Week
    getCurrentVerseOfWeek(): Promise<VerseOfWeek | undefined>;

    createVerseOfWeek(verse: InsertVerseOfWeek): Promise<VerseOfWeek>;

    // Flyer
    getFlyers(): Promise<Flyer[] | undefined>;

    createFlyer(flyer: InsertFlyer): Promise<Flyer>;
}

export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private events: Map<number, Event>;
    private roomBookings: Map<number, RoomBooking>;
    private birthdays: Map<number, Birthday>;
    private verses: Map<number, VerseOfWeek>;
    private flyers: Map<number, Flyer>;
    currentId: number;

    constructor() {
        this.users = new Map();
        this.events = new Map();
        this.roomBookings = new Map();
        this.birthdays = new Map();
        this.verses = new Map();
        this.flyers = new Map();
        this.currentId = 1;

        // Initialize with sample data
        this.initializeSampleData();
    }

    private async initializeSampleData() {
        // Sample upcoming event - using one of your actual flyers
        await this.createEvent({
            title: "Tag der offenen Tür",
            description: "Gebäudeführung, Kinderattraktionen, Kaffee und Kuchen",
            startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
            imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
            location: "Habsburgstr. 17, 8037 Zürich"
        });

        // Sample room bookings for today
        const today = new Date();
        await this.createRoomBooking({
            title: "Hauskreis",
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
            resourceName: "Hauptraum",
            bookingDate: today
        });

        await this.createRoomBooking({
            title: "Bibelstunde",
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
            resourceName: "Seminarraum",
            bookingDate: today
        });

        await this.createRoomBooking({
            title: "Jugendtreff",
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 30),
            resourceName: "Jugendraum",
            bookingDate: today
        });

        // Add upcoming room bookings for next few days
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        await this.createRoomBooking({
            title: "Gebetskreis",
            startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
            endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
            resourceName: "Kapelle",
            bookingDate: tomorrow
        });

        await this.createRoomBooking({
            title: "Worship Team Probe",
            startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0),
            endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 20, 0),
            resourceName: "Hauptraum",
            bookingDate: tomorrow
        });

        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 2);

        await this.createRoomBooking({
            title: "Seniorentreff",
            startTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 14, 30),
            endTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 16, 30),
            resourceName: "Seminarraum",
            bookingDate: dayAfter
        });

        // Sample birthdays this week
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        await this.createBirthday({
            name: "Anna Müller",
            birthDate: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2),
            avatarUrl: null
        });

        await this.createBirthday({
            name: "Peter Schmidt",
            birthDate: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5),
            avatarUrl: null
        });

        // Current verse of the week
        await this.createVerseOfWeek({
            text: "Jesus redete zu ihnen und sprach: Ich bin das Licht der Welt. Wer mir nachfolgt, wird nicht in der Finsternis wandeln, sondern das Licht des Lebens haben.",
            reference: "Johannes 8:12",
            weekStart: weekStart
        });
    }

    async getUser(id: number): Promise<User | undefined> {
        return this.users.get(id);
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find(
            (user) => user.username === username,
        );
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const id = this.currentId++;
        const user: User = {...insertUser, id};
        this.users.set(id, user);
        return user;
    }

    async getUpcomingEvents(limit = 5): Promise<Event[]> {
        const now = new Date();
        return Array.from(this.events.values())
            .filter(event => new Date(event.startDate) > now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, limit);
    }

    async createEvent(insertEvent: InsertEvent): Promise<Event> {
        const id = this.currentId++;
        const event: Event = {
            ...insertEvent,
            id,
            description: insertEvent.description || null,
            imageUrl: insertEvent.imageUrl || null,
            location: insertEvent.location || null
        };
        this.events.set(id, event);
        return event;
    }

    async getTodayRoomBookings(): Promise<RoomBooking[]> {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        return Array.from(this.roomBookings.values())
            .filter(booking => {
                const startTime = new Date(booking.startTime);
                return startTime >= now && startTime <= endOfDay;
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    async getUpcomingRoomBookings(days = 7): Promise<RoomBooking[]> {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(now.getDate() + days);

        return Array.from(this.roomBookings.values())
            .filter(booking => {
                const startTime = new Date(booking.startTime);
                return startTime >= now && startTime <= endDate;
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 6); // Limit to 6 upcoming bookings
    }

    async createRoomBooking(insertBooking: InsertRoomBooking): Promise<RoomBooking> {
        const id = this.currentId++;
        const booking: RoomBooking = {...insertBooking, id};
        this.roomBookings.set(id, booking);
        return booking;
    }

    async getWeeklyBirthdays(): Promise<Birthday[]> {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return Array.from(this.birthdays.values())
            .filter(birthday => {
                const birthDate = new Date(birthday.birthDate);
                const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                return thisYearBirthday >= weekStart && thisYearBirthday < weekEnd;
            })
            .sort((a, b) => {
                const aDate = new Date(now.getFullYear(), new Date(a.birthDate).getMonth(), new Date(a.birthDate).getDate());
                const bDate = new Date(now.getFullYear(), new Date(b.birthDate).getMonth(), new Date(b.birthDate).getDate());
                return aDate.getTime() - bDate.getTime();
            });
    }

    async createBirthday(insertBirthday: InsertBirthday): Promise<Birthday> {
        const id = this.currentId++;
        const birthday: Birthday = {
            ...insertBirthday,
            id,
            avatarUrl: insertBirthday.avatarUrl || null
        };
        this.birthdays.set(id, birthday);
        return birthday;
    }

    async getCurrentVerseOfWeek(): Promise<VerseOfWeek | undefined> {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return Array.from(this.verses.values())
            .find(verse => new Date(verse.weekStart).getTime() === weekStart.getTime());
    }

    async createVerseOfWeek(insertVerse: InsertVerseOfWeek): Promise<VerseOfWeek> {
        const id = this.currentId++;
        const verse: VerseOfWeek = {...insertVerse, id};
        this.verses.set(id, verse);
        return verse;
    }

    async getFlyers(): Promise<Flyer[] | undefined> {
        return Array.from(this.flyers.values());
    }

    async createFlyer(insertFlyer: InsertFlyer): Promise<Flyer> {
        const id = this.currentId++;
        const flyer: Flyer = {
            ...insertFlyer,
            id,
            imageUrl: insertFlyer.imageUrl,
            description: insertFlyer.description
        };
        this.flyers.set(id, flyer);
        return flyer;
    }
}

export const storage = new MemStorage();
