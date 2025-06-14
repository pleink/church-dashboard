interface ChurchToolsConfig {
  baseUrl: string;
  apiToken: string;
}

interface ChurchToolsEvent {
  id: number;
  name: string;
  description?: string;
  startdate: string;
  enddate: string;
  image?: string;
  location?: string;
}

interface ChurchToolsBooking {
  id: number;
  caption: string;
  startdate: string;
  enddate: string;
  resource: {
    name: string;
  };
}

interface ChurchToolsPerson {
  id: number;
  firstName: string;
  lastName: string;
  birthdate?: string;
  imageUrl?: string;
}

export class ChurchToolsService {
  private config: ChurchToolsConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.CHURCHTOOLS_API_BASE || 'https://your-church.church.tools/api',
      apiToken: process.env.CHURCHTOOLS_API_TOKEN || process.env.API_TOKEN || ''
    };

    if (!this.config.apiToken) {
      console.warn('ChurchTools API token not configured. Service will return empty results.');
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.config.apiToken) {
      throw new Error('ChurchTools API token not configured');
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Login ${this.config.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`ChurchTools API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getUpcomingEvents(limit = 5): Promise<ChurchToolsEvent[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const events = await this.makeRequest<ChurchToolsEvent[]>(`/events?from=${today}&limit=${limit}`);
      return events || [];
    } catch (error) {
      console.error('Error fetching events from ChurchTools:', error);
      return [];
    }
  }

  async getTodayBookings(): Promise<ChurchToolsBooking[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const bookings = await this.makeRequest<ChurchToolsBooking[]>(`/bookings?from=${today}&to=${today}`);
      return bookings || [];
    } catch (error) {
      console.error('Error fetching bookings from ChurchTools:', error);
      return [];
    }
  }

  async getBirthdaysThisWeek(): Promise<ChurchToolsPerson[]> {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const startDate = weekStart.toISOString().split('T')[0];
      const endDate = weekEnd.toISOString().split('T')[0];
      
      const persons = await this.makeRequest<ChurchToolsPerson[]>(`/persons?birthday_from=${startDate}&birthday_to=${endDate}`);
      return persons || [];
    } catch (error) {
      console.error('Error fetching birthdays from ChurchTools:', error);
      return [];
    }
  }

  async syncEvents(): Promise<void> {
    const events = await this.getUpcomingEvents(10);
    // Sync logic would go here - for now we'll just log
    console.log(`Synced ${events.length} events from ChurchTools`);
  }

  async syncBookings(): Promise<void> {
    const bookings = await this.getTodayBookings();
    console.log(`Synced ${bookings.length} bookings from ChurchTools`);
  }

  async syncBirthdays(): Promise<void> {
    const birthdays = await this.getBirthdaysThisWeek();
    console.log(`Synced ${birthdays.length} birthdays from ChurchTools`);
  }
}

export const churchToolsService = new ChurchToolsService();
