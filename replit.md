# Church Signage Display System

## Overview

This is a full-stack digital signage application designed for Freie Kirche Wipkingen (Free Church Wipkingen). The system displays real-time information including upcoming events, room bookings, weekly birthdays, and bible verses on digital displays throughout the church.

The application is built as a modern web application that can run continuously on digital signage screens, with a focus on reliability, readability, and automatic content updates.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom church branding
- **UI Components**: Radix UI with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **External Integration**: ChurchTools API for event and booking data
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions

### Development Environment
- **Platform**: Replit with Node.js 20, Web, and PostgreSQL 16 modules
- **Development Server**: Hot module replacement with Vite
- **Database Migrations**: Drizzle Kit for schema management

## Key Components

### Data Sources
1. **ChurchTools Integration**: Primary data source for events, room bookings, and potentially birthdays
2. **Local Database**: Fallback storage and local content management
3. **Hybrid Approach**: Attempts ChurchTools first, falls back to local data

### Display Sections
1. **Header**: Church branding, real-time clock, and current date
2. **Room Usage**: Today's room bookings and resource usage
3. **Upcoming Events**: Next church event with image and details
4. **Birthdays**: Weekly birthday celebrations (up to 4 people)
5. **Verse of Week**: Biblical verse display with formatting
6. **API Status**: Connection status indicator for ChurchTools

### Database Schema
- **Users**: Basic authentication (username/password)
- **Events**: Church events with dates, descriptions, and images
- **Room Bookings**: Resource scheduling with times and locations
- **Birthdays**: Member birthdays with optional avatars
- **Verse of Week**: Weekly bible verses with references

## Data Flow

1. **Initial Load**: Frontend requests data from backend API endpoints
2. **ChurchTools Query**: Backend attempts to fetch live data from ChurchTools API
3. **Fallback Strategy**: If ChurchTools unavailable, serves local database content
4. **Auto Refresh**: Frontend polls for updates every 15 minutes
5. **Real-time Clock**: Client-side time updates every second
6. **Error Handling**: Graceful degradation with user-friendly error messages

## External Dependencies

### ChurchTools Integration
- **API Base URL**: Configurable via environment variables
- **Authentication**: Token-based API authentication
- **Endpoints Used**: Events, bookings, and potentially person data
- **Error Handling**: Comprehensive fallback mechanisms

### Database Dependencies
- **PostgreSQL**: Primary database (Neon serverless in production)
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Pooling**: Managed through Neon serverless architecture

### UI/UX Dependencies
- **Google Fonts**: Spartan font family for consistent typography
- **Lucide React**: Icon library for UI elements
- **Unsplash**: Fallback images for events without custom imagery
- **Custom CSS**: Church-specific color scheme and responsive design

## Deployment Strategy

### Production Environment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite production build with Express.js server bundling
- **Port Configuration**: External port 80 mapping to internal port 5000
- **Environment Variables**: Database URL and ChurchTools API credentials

### Development Workflow
- **Live Development**: `npm run dev` with hot reloading
- **Database Management**: `npm run db:push` for schema updates
- **Type Checking**: `npm run check` for TypeScript validation

### Deployment Configuration
- **Build Command**: `npm run build` (Vite + esbuild for server)
- **Start Command**: `npm run start` (production Node.js server)
- **Static Assets**: Served from `dist/public` directory
- **API Routes**: Express.js handling `/api/*` endpoints

## Changelog

```
Changelog:
- June 14, 2025. Initial setup with 4K vertical digital signage display
- June 14, 2025. Implemented improvements based on user feedback:
  • Extended room usage to show upcoming bookings (7 days) with dates
  • Fixed events display with proper future dates
  • Reduced height of birthdays section (smaller avatars, compact layout)
  • Reduced height of bible verse section (smaller text, compact spacing)
  • Added church logo integration from provided assets
  • Enhanced room bookings with date information for better context
- July 23, 2025. Major API integration upgrade:
  • Migrated from Replit Agent to standard Replit environment
  • Replaced mock data with real ChurchTools API integration
  • Generated TypeScript types from ChurchTools OpenAPI specification
  • Removed all fallback and mock data logic from server routes
  • Updated ChurchTools service to use authentic API endpoints only
  • Fixed API parameter formatting for proper ChurchTools communication
  • Added real environment variables for ChurchTools API authentication
  • Implemented proper error handling for API failures (no fallbacks)
- July 25, 2025. Calendar Appointment System Implementation:
  • Replaced room booking system with calendar appointments using /calendars/{calendarId}/appointments endpoint
  • Created centralized config.json with public calendar IDs [2, 22, 25] and signage settings
  • Implemented public/private calendar filtering logic in ChurchTools service
  • Updated API routes: /api/signage/appointments/today and /api/signage/appointments/upcoming
  • Renamed components: RoomUsage → NextEvents, UpcomingEvent → NextService
  • Added churchToolsId fields to all API responses for better tracking
  • Fixed birthday data mapping to use correct ChurchTools person API structure
  • Updated flyer carousel to use appointment images from public calendars
  • Maintained church branding and 4K signage display styling throughout
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```