import type { paths, operations } from "../../shared/churchtools-api.js";
import { readFileSync } from 'fs';
import { join } from 'path';

interface ChurchToolsConfig {
  baseUrl: string;
  apiToken: string;
}

interface AppConfig {
  publicCalendars: number[];
  calendars: {
    sermons: number[];
    churchEvents: number[];
    groupEvents: number[];
    titleOverrides: Record<string, string>;
    descriptionOverrides: Record<string, string>;
  };
  resources: {
    roomTypeIds: number[];
  };
  services: {
    excludeGroupIds: number[];
    kidsDescriptions: Record<string, string>;
    kidsStatus: {
      kidsDrin: string;
      kidsDraussen: string;
      teensDrin: string;
      teensDraussen: string;
    };
    specialsKeywords: string[];
  };
  labels?: {
    eventsTitle?: string;
    eventsToday?: string;
    eventsUpcoming?: string;
    sermonTitle?: string;
    sermonProgram?: string;
    sermonKids?: string;
    sermonGastro?: string;
  };
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
type GetAllAppointmentsResponse =
  operations["get-calendars-appointments"]["responses"]["200"]["content"]["application/json"];
type GetCalendarsResponse =
  operations["get-calendars"]["responses"]["200"]["content"]["application/json"];
type GetGroupTypesResponse =
  operations["get-group-grouptypes"]["responses"]["200"]["content"]["application/json"];
type GetEventResponse =
  operations["getEvent"]["responses"]["200"]["content"]["application/json"];

// Define simplified types for our usage
type ChurchToolsEvent = NonNullable<GetEventsResponse["data"]>[number];
type ChurchToolsBooking = NonNullable<GetBookingsResponse["data"]>[number];
type ChurchToolsResource = NonNullable<GetResourcesResponse["data"]>[number];
type ChurchToolsPerson = NonNullable<GetPersonsResponse["data"]>[number];
type ChurchToolsAppointment = NonNullable<GetCalendarAppointmentsResponse["data"]>[number];
type ChurchToolsCalendar = NonNullable<GetCalendarsResponse["data"]>[number];
type ChurchToolsGroupType = NonNullable<GetGroupTypesResponse["data"]>[number];
type ChurchToolsServiceDef = {
  id: number;
  name: string;
  serviceGroupId: number | null;
};

interface ChurchToolsApiResponse<T> {
  data: T;
}

export class ChurchToolsService {
  private config: ChurchToolsConfig;
  private appConfig: AppConfig;
  private cachedCalendars: ChurchToolsCalendar[] | null = null;
  private cachedServices: ChurchToolsServiceDef[] | null = null;

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
      const parsedConfig = JSON.parse(configFile);
      this.appConfig = {
        publicCalendars: parsedConfig.publicCalendars ?? [],
        calendars: {
          sermons: parsedConfig.calendars?.sermons ?? [],
          churchEvents: parsedConfig.calendars?.churchEvents ?? [],
          groupEvents: parsedConfig.calendars?.groupEvents ?? [],
          titleOverrides: parsedConfig.calendars?.titleOverrides ?? {},
          descriptionOverrides: parsedConfig.calendars?.descriptionOverrides ?? {},
        },
        resources: {
          roomTypeIds: parsedConfig.resources?.roomTypeIds ?? [2],
        },
        services: {
          excludeGroupIds: parsedConfig.services?.excludeGroupIds ?? [],
          kidsDescriptions: parsedConfig.services?.kidsDescriptions ?? {},
          kidsStatus: parsedConfig.services?.kidsStatus ?? {
            kidsDrin: "Kids drinnen",
            kidsDraussen: "Kids draussen",
            teensDrin: "Teens drinnen",
            teensDraussen: "Teens draussen",
          },
          specialsKeywords: parsedConfig.services?.specialsKeywords ?? ["Abendmahl", "Kirche weltweit"],
        },
        signage: {
          refreshInterval: parsedConfig.signage?.refreshInterval ?? 15,
          maxUpcomingDays: parsedConfig.signage?.maxUpcomingDays ?? 7,
          maxEventsDisplay: parsedConfig.signage?.maxEventsDisplay ?? 8,
          carouselInterval: parsedConfig.signage?.carouselInterval ?? 7
        }
      };
    } catch (error) {
      console.warn("Could not load config.json, using defaults");
      this.appConfig = {
        publicCalendars: [],
        calendars: {
          sermons: [],
          churchEvents: [],
          groupEvents: [],
          titleOverrides: {},
          descriptionOverrides: {},
        },
        resources: {
          roomTypeIds: [2],
        },
        services: {
          excludeGroupIds: [],
          kidsDescriptions: {},
          kidsStatus: {
            kidsDrin: "Kids drinnen",
            kidsDraussen: "Kids draussen",
            teensDrin: "Teens drinnen",
            teensDraussen: "Teens draussen",
          },
          specialsKeywords: ["Abendmahl", "Kirche weltweit"],
        },
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
    params?: Record<string, string | string[]>,
  ): Promise<T> {
    if (!this.config.apiToken) {
      throw new Error("ChurchTools API token not configured");
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, item));
        } else {
          url.searchParams.append(key, value);
        }
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

  async getUpcomingEvents(limit = 5, options?: { throwOnError?: boolean }): Promise<ChurchToolsEvent[]> {
    const { throwOnError = false } = options ?? {};
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
      if (throwOnError) {
        throw error;
      }
      return [];
    }
  }

  private async getCalendars(): Promise<ChurchToolsCalendar[]> {
    try {
      if (this.cachedCalendars) {
        return this.cachedCalendars;
      }
      const calendars = await this.makeRequest<ChurchToolsCalendar[]>("/calendars");
      this.cachedCalendars = calendars || [];
      return this.cachedCalendars;
    } catch (error) {
      console.error("Error fetching calendars from ChurchTools:", error);
      return [];
    }
  }

  private async getGroupCalendarIds(): Promise<number[]> {
    // Prefer explicit config
    if (this.appConfig.calendars.groupEvents.length > 0) {
      return this.appConfig.calendars.groupEvents;
    }

    // Fallback to server-discovered group calendars
    const calendars = await this.getCalendars();
    return calendars.filter((calendar) => calendar.type === "group").map((calendar) => calendar.id);
  }

  async getCalendarAppointments(calendarIds: number[], days = 7): Promise<ChurchToolsAppointment[]> {
    if (calendarIds.length === 0) {
      return [];
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + Math.max(days - 1, 0));

      const appointments = await this.makeRequest<ChurchToolsAppointment[]>(
        `/calendars/appointments`,
        {
          from: today.toISOString().split("T")[0],
          to: endDate.toISOString().split("T")[0],
          "calendar_ids[]": calendarIds.map((id) => id.toString()),
          "include[]": ["event", "group", "bookings"],
        },
      );

      return appointments || [];
    } catch (error) {
      console.error(`Error fetching appointments for calendars ${calendarIds.join(",")}:`, error);
      return [];
    }
  }

  async getTodayAppointments(): Promise<ChurchToolsAppointment[]> {
    try {
      const allAppointments: ChurchToolsAppointment[] = [];

      const groupIds = await this.getGroupCalendarIds();
      const calendarIds = [
        ...this.appConfig.calendars.sermons,
        ...this.appConfig.calendars.churchEvents,
        ...groupIds,
      ].filter((value, index, arr) => arr.indexOf(value) === index);

      const appointments = await this.getCalendarAppointments(calendarIds, 1);
      allAppointments.push(...appointments);

      // Filter to today only and sort by start time
      const today = new Date().toISOString().split("T")[0];
      return allAppointments
        .filter((appointment) => {
          const start = appointment.calculated?.startDate || appointment.base?.startDate || "";
          return start.startsWith(today);
        })
        .sort((a, b) => {
          const aTime = a.calculated?.startDate || a.base?.startDate || "";
          const bTime = b.calculated?.startDate || b.base?.startDate || "";
          return aTime.localeCompare(bTime);
        });
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      return [];
    }
  }

  async getUpcomingAppointments(days = this.appConfig.signage.maxUpcomingDays || 7): Promise<ChurchToolsAppointment[]> {
    try {
      const allAppointments: ChurchToolsAppointment[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + Math.max(days - 1, 0));
      
      const calendarIds = await this.getGroupCalendarIds();
      const allCalendarIds = [
        ...this.appConfig.calendars.sermons,
        ...this.appConfig.calendars.churchEvents,
        ...calendarIds,
      ].filter((value, index, arr) => arr.indexOf(value) === index);
      const appointments = await this.getCalendarAppointments(allCalendarIds, days);
      allAppointments.push(...appointments);

      return allAppointments
        .filter(appointment => {
          const start = appointment.calculated?.startDate || appointment.base?.startDate;
          const appointmentDate = start ? new Date(start) : null;
          return appointmentDate && appointmentDate >= today && appointmentDate <= endDate;
        })
        .sort((a, b) => {
          const aTime = a.calculated?.startDate || a.base?.startDate || '';
          const bTime = b.calculated?.startDate || b.base?.startDate || '';
          return aTime.localeCompare(bTime);
        });
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      return [];
    }
  }

  isPublicCalendar(calendarId: number): boolean {
    const calendar =
      this.cachedCalendars?.find((entry) => entry.id === calendarId) || null;
    if (calendar && typeof calendar.isPublic === "boolean") {
      return calendar.isPublic;
    }

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

  async getEvent(eventId: number): Promise<GetEventResponse["data"] | null> {
    try {
      const event = await this.makeRequest<GetEventResponse["data"]>(`/events/${eventId}`);
      return event || null;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      return null;
    }
  }

  async getServices(): Promise<ChurchToolsServiceDef[]> {
    try {
      if (this.cachedServices) return this.cachedServices;
      const services = await this.makeRequest<any[]>("/services");
      this.cachedServices = (services || []).map((svc: any) => ({
        id: svc.id,
        name: svc.name,
        serviceGroupId: svc.serviceGroupId ?? null,
      }));
      return this.cachedServices;
    } catch (error) {
      console.error("Error fetching services list:", error);
      return [];
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
