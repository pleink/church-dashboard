import type { paths, operations } from "../../shared/churchtools-api.js";

interface ChurchToolsConfig {
  baseUrl: string;
  apiToken: string;
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

// Define simplified types for our usage
type ChurchToolsEvent = NonNullable<GetEventsResponse["data"]>[number];
type ChurchToolsBooking = NonNullable<GetBookingsResponse["data"]>[number];
type ChurchToolsResource = NonNullable<GetResourcesResponse["data"]>[number];
type ChurchToolsPerson = NonNullable<GetPersonsResponse["data"]>[number];

interface ChurchToolsApiResponse<T> {
  data: T;
}

export class ChurchToolsService {
  private config: ChurchToolsConfig;

  constructor() {
    console.log("getting envs in service");
    this.config = {
      baseUrl:
        process.env.CHURCHTOOLS_API_BASE ||
        "https://your-church.church.tools/api",
      apiToken:
        process.env.CHURCHTOOLS_API_TOKEN || process.env.API_TOKEN || "",
    };

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
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 100);

      const startDate = weekStart.toISOString().split("T")[0];
      const endDate = weekEnd.toISOString().split("T")[0];

      const persons = await this.makeRequest<ChurchToolsPerson[]>("/persons", {
        birthday_from: startDate,
        birthday_to: endDate,
      });
      return persons || [];
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
