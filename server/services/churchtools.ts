import type { paths, operations } from "../../shared/churchtools-api.js";
import { readFileSync } from 'fs';
import { join } from 'path';

interface ChurchToolsConfig {
  baseUrl: string;
  apiToken: string;
}

interface AppConfig {
  publicCalendars: number[];
  signage: {
    refreshInterval: number;
    maxUpcomingDays: number;
    maxEventsDisplay: number;
    carouselInterval: number;
  };
}

// Extract types from OpenAPI spec
type GetEventsResponse =
  operations["getAllEvents"]["responses"]["200"]["content"]["application/json"];
type GetBookingsResponse =
  operations["get-bookings"]["responses"]["200"]["content"]["application/json"];
type GetResourcesResponse =
  operations["get-resources"]["responses"]["200"]["content"]["application/json"];
type GetPersonsResponse =
  operations["get-persons-birthdays"]["responses"]["200"]["content"]["application/json"];
type GetCalendarAppointmentsResponse =
  operations["get-calendars-calendarId-appointments"]["responses"]["200"]["content"]["application/json"];

// Define simplified types for our usage
type ChurchToolsEvent = NonNullable<GetEventsResponse["data"]>[number];
type ChurchToolsBooking = NonNullable<GetBookingsResponse["data"]>[number];
type ChurchToolsResource = NonNullable<GetResourcesResponse["data"]>[number];
type ChurchToolsPerson = NonNullable<GetPersonsResponse["data"]>[number];
type ChurchToolsAppointment = NonNullable<GetCalendarAppointmentsResponse["data"]>[number];

interface ChurchToolsApiResponse<T> {
  data: T;
}

export class ChurchToolsService {
  private config: ChurchToolsConfig;
  private appConfig: AppConfig;

  constructor() {
    console.log("getting envs in service");
    this.config = {
      baseUrl:
        process.env.CHURCHTOOLS_API_BASE ||
        "https://your-church.church.tools/api",
      apiToken:
        process.env.CHURCHTOOLS_API_TOKEN || process.env.API_TOKEN || "",
    };

    // Load app configuration
    try {
      const configPath = join(process.cwd(), 'config.json');
      const configFile = readFileSync(configPath, 'utf8');
      this.appConfig = JSON.parse(configFile);
    } catch (error) {
      console.warn("Could not load config.json, using defaults");
      this.appConfig = {
        publicCalendars: [2, 22, 25],
        signage: {
          refreshInterval: 15,
          maxUpcomingDays: 7,
          maxEventsDisplay: 8,
          carouselInterval: 7
        }
      };
    }

    if (!this.config.apiToken) {
      console.warn(
        "ChurchTools API token not configured. Service will return empty results.",
      );
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<T> {
    if (!this.config.apiToken) {
      throw new Error("ChurchTools API token not configured");
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Login ${this.config.apiToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ChurchTools API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result: ChurchToolsApiResponse<T> = await response.json();
    return result.data;
  }

  async getUpcomingEvents(limit = 5): Promise<ChurchToolsEvent[]> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const events = await this.makeRequest<ChurchToolsEvent[]>("/events", {
        from: today,
        limit: limit.toString(),
        direction: "forward",
      });
      return events || [];
    } catch (error) {
      console.error("Error fetching events from ChurchTools:", error);
      return [];
    }
  }

  async getCalendarAppointments(calendarId: number, days = 7): Promise<ChurchToolsAppointment[]> {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + days);

      const appointments = await this.makeRequest<ChurchToolsAppointment[]>(
        `/calendars/${calendarId}/appointments`,
        {
          from: today.toISOString().split("T")[0],
          to: endDate.toISOString().split("T")[0],
          'include[]': 'event' // Include event data with images
        }
      );
      return appointments || [];
    } catch (error) {
      console.error(`Error fetching appointments for calendar ${calendarId}:`, error);
      return [];
    }
  }

  async getTodayAppointments(): Promise<ChurchToolsAppointment[]> {
    try {
      const allAppointments: ChurchToolsAppointment[] = [];
      
      // Get appointments from all configured calendars (both public and private)
      const allCalendarIds = this.appConfig.publicCalendars; // We can extend this later
      
      for (const calendarId of allCalendarIds) {
        const appointments = await this.getCalendarAppointments(calendarId, 1); // Today only
        allAppointments.push(...appointments);
      }
      
      // Filter to today only and sort by start time
      const today = new Date().toISOString().split("T")[0];
      return allAppointments
        .filter(appointment => appointment.base?.startDate?.startsWith(today))
        .sort((a, b) => {
          const aTime = a.base?.startDate || '';
          const bTime = b.base?.startDate || '';
          return aTime.localeCompare(bTime);
        });
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      return [];
    }
  }

  async getUpcomingAppointments(days = 7): Promise<ChurchToolsAppointment[]> {
    try {
      const allAppointments: ChurchToolsAppointment[] = [];
      
      // Get appointments from all configured calendars (both public and private)
      const allCalendarIds = this.appConfig.publicCalendars; // We can extend this later
      
      for (const calendarId of allCalendarIds) {
        const appointments = await this.getCalendarAppointments(calendarId, days);
        allAppointments.push(...appointments);
      }
      
      // Filter to future dates and sort chronologically
      const today = new Date().toISOString().split("T")[0];
      return allAppointments
        .filter(appointment => {
          const appointmentDate = appointment.base?.startDate?.split("T")[0];
          return appointmentDate && appointmentDate > today;
        })
        .sort((a, b) => {
          const aTime = a.base?.startDate || '';
          const bTime = b.base?.startDate || '';
          return aTime.localeCompare(bTime);
        });
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      return [];
    }
  }

  isPublicCalendar(calendarId: number): boolean {
    return this.appConfig.publicCalendars.includes(calendarId);
  }

  async getTodayBookings(): Promise<ChurchToolsBooking[]> {
    try {
      // First get resources to query bookings
      const resources = await this.getResources();
      if (resources.length === 0) {
        return [];
      }

      const today = new Date().toISOString().split("T")[0];
      const resourceIds = resources.slice(0, 10).map((r) => r.id.toString()); // Limit to first 10 resources

      // Fix the resource_ids parameter format for the API
      const params: Record<string, string> = {
        from: today,
        to: today,
      };
      resourceIds.forEach((id, index) => {
        params[`resource_ids[${index}]`] = id;
      });

      const bookings = await this.makeRequest<ChurchToolsBooking[]>(
        "/bookings",
        params,
      );
      return bookings || [];
    } catch (error) {
      console.error("Error fetching bookings from ChurchTools:", error);
      return [];
    }
  }

  async getUpcomingBookings(days = 7): Promise<ChurchToolsBooking[]> {
    try {
      const resources = await this.getResources();
      if (resources.length === 0) {
        return [];
      }

      const today = new Date();
      const endDate = new Date(today);
      // TODO: replace with days parameter
      endDate.setDate(today.getDate() + 100);

      const resourceIds = resources.slice(0, 10).map((r) => r.id.toString());

      // Fix the resource_ids parameter format for the API
      const params: Record<string, string> = {
        from: today.toISOString().split("T")[0],
        to: endDate.toISOString().split("T")[0],
      };
      resourceIds.forEach((id, index) => {
        params[`resource_ids[${index}]`] = id;
      });

      const bookings = await this.makeRequest<ChurchToolsBooking[]>(
        "/bookings",
        params,
      );
      return bookings || [];
    } catch (error) {
      console.error(
        "Error fetching upcoming bookings from ChurchTools:",
        error,
      );
      return [];
    }
  }

  async getResources(): Promise<ChurchToolsResource[]> {
    try {
      const resources =
        await this.makeRequest<ChurchToolsResource[]>("/resources");
      return resources || [];
    } catch (error) {
      console.error("Error fetching resources from ChurchTools:", error);
      return [];
    }
  }

  async getBirthdaysThisWeek(): Promise<ChurchToolsPerson[]> {
    try {
      // Use the dedicated birthdays endpoint which provides structured birthday data
      const birthdays = await this.makeRequest<any[]>("/persons/birthdays", {
        from_days_ago: "0",
        to_days_ahead: "7",
      });
      return birthdays || [];
    } catch (error) {
      console.error("Error fetching birthdays from ChurchTools:", error);
      return [];
    }
  }

  // Status methods
  async getConnectionStatus(): Promise<{
    connected: boolean;
    lastUpdate: string;
  }> {
    try {
      // Try a simple request to check connection
      await this.makeRequest("/events", { limit: "1" });
      return {
        connected: true,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      return {
        connected: false,
        lastUpdate: new Date().toISOString(),
      };
    }
  }
}

let instance: ChurchToolsService | null = null;

export function getChurchToolsService(): ChurchToolsService {
  if (!instance) {
    instance = new ChurchToolsService();
  }
  return instance;
}
