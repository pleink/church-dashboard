import { 
  users, events, roomBookings, birthdays, verseOfWeek,
  type User, type InsertUser, type Event, type RoomBooking, 
  type Birthday, type VerseOfWeek, type InsertEvent,
  type InsertRoomBooking, type InsertBirthday, type InsertVerseOfWeek
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
  createRoomBooking(booking: InsertRoomBooking): Promise<RoomBooking>;
  
  // Birthdays
  getWeeklyBirthdays(): Promise<Birthday[]>;
  createBirthday(birthday: InsertBirthday): Promise<Birthday>;
  
  // Verse of Week
  getCurrentVerseOfWeek(): Promise<VerseOfWeek | undefined>;
  createVerseOfWeek(verse: InsertVerseOfWeek): Promise<VerseOfWeek>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private roomBookings: Map<number, RoomBooking>;
  private birthdays: Map<number, Birthday>;
  private verses: Map<number, VerseOfWeek>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.roomBookings = new Map();
    this.birthdays = new Map();
    this.verses = new Map();
    this.currentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample upcoming event - using one of your actual flyers
    await this.createEvent({
      title: "Tag der offenen Tür",
      description: "Gebäudeführung, Kinderattraktionen, Kaffee und Kuchen",
      startDate: new Date(2024, 5, 1, 13, 0), // June 1, 2024, 13:00
      endDate: new Date(2024, 5, 1, 17, 0), // June 1, 2024, 17:00
      imageUrl: "/assets/image_1749912981916.png",
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
    const user: User = { ...insertUser, id };
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.roomBookings.values())
      .filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= today && bookingDate < tomorrow;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createRoomBooking(insertBooking: InsertRoomBooking): Promise<RoomBooking> {
    const id = this.currentId++;
    const booking: RoomBooking = { ...insertBooking, id };
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
    const verse: VerseOfWeek = { ...insertVerse, id };
    this.verses.set(id, verse);
    return verse;
  }
}

export const storage = new MemStorage();
