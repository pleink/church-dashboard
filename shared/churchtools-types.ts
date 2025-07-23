// ChurchTools API Types based on OpenAPI specification

export interface ChurchToolsEvent {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  category?: {
    id: number;
    name: string;
  };
  calendar?: {
    id: number;
    name: string;
  };
  repeatId?: number;
  appointment?: {
    id: number;
    startDate: string;
    endDate: string;
    caption: string;
    information?: string;
  };
  canceled?: boolean;
}

export interface ChurchToolsBooking {
  id: number;
  startDate: string;
  endDate: string;
  caption: string;
  note?: string;
  status?: {
    id: number;
    name: string;
  };
  resource?: {
    id: number;
    name: string;
    resourceType?: {
      id: number;
      name: string;
    };
  };
  person?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface ChurchToolsPerson {
  id: number;
  firstName: string;
  lastName: string;
  birthdate?: string;
  email?: string;
  imageUrl?: string;
  domainAttributes?: {
    [key: string]: any;
  };
}

export interface ChurchToolsResource {
  id: number;
  name: string;
  description?: string;
  resourceType?: {
    id: number;
    name: string;
  };
  campusId?: number;
}

export interface ChurchToolsApiResponse<T> {
  data: T;
  meta?: {
    count?: number;
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

// API Error types
export interface ChurchToolsApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}