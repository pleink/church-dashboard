import { useQuery } from "@tanstack/react-query";

interface SignageEvent {
  id: number;
  title: string;
  description?: string;
  descriptionLines?: string[];
  predigtLine?: string;
  specials?: string[];
  services?: {
    program: { id: number; name: string; person?: string; avatar?: string }[];
    kids: { id: number; name: string; person?: string; description?: string; statusLabel?: string }[];
    gastro: {
      id: number;
      name: string;
      status: 'open' | 'closingSoon' | 'closed' | 'openingSoon' | 'unavailable';
      label: string;
      tone: 'green' | 'yellow' | 'red' | 'muted';
    }[];
  };
  date: string;
  time: string;
  location?: string;
  imageUrl?: string;
}

interface TodayAppointment {
  id: number;
  churchToolsId: number;
  title: string;
  color?: string;
  location?: string;
  startDateTime?: string;
  startTime: string;
  endTime: string;
  date: string;
  resource: string;
  isPublic: boolean;
  calendarId: number;
}

interface UpcomingAppointment {
  id: number;
  churchToolsId: number;
  title: string;
  color?: string;
  location?: string;
  startDateTime?: string;
  startTime: string;
  endTime: string;
  date: string;
  resource: string;
  isPublic: boolean;
  calendarId: number;
  imageUrl?: string;
}

interface Birthday {
  id: number;
  churchToolsId: number;
  name: string;
  birthdayText: string;
  avatar?: string;
}

interface VerseOfWeek {
  id: number;
  text: string;
  reference: string;
}

interface Flyer {
  id: number;
  churchToolsId: number;
  imageUrl: string;
  title: string;
  startDate: string;
}

interface ApiStatus {
  connected: boolean;
  lastUpdate: string;
  error?: string;
  service: string;
}

interface SignageLabels {
  eventsTitle: string;
  eventsToday: string;
  eventsUpcoming: string;
  sermonTitleSunday: string;
  sermonTitleWeekday: string;
  sermonProgram: string;
  sermonProgramSub: string;
  sermonKids: string;
  sermonGastro: string;
  birthdaysTitle: string;
  verseTitle: string;
}

export function useSignageSermon() {
  return useQuery<SignageEvent>({
    queryKey: ["/api/signage/sermon"],
    refetchInterval: 30 * 1000, // 1 minute for accurate live status (e.g., gastro)
    staleTime: 15 * 1000, // 30 seconds
  });
}

export function useTodayAppointments() {
  return useQuery<TodayAppointment[]>({
    queryKey: ["/api/signage/appointments/today"],
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpcomingAppointments() {
  return useQuery<UpcomingAppointment[]>({
    queryKey: ["/api/signage/appointments/upcoming"],
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBirthdays() {
  return useQuery<Birthday[]>({
    queryKey: ["/api/signage/birthdays"],
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });
}

export function useVerseOfWeek() {
  return useQuery<VerseOfWeek>({
    queryKey: ["/api/signage/verse"],
    refetchInterval: 60 * 60 * 1000, // 1 hour
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useFlyers() {
  return useQuery<Flyer[]>({
    queryKey: ["/api/signage/flyers"],
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });
}

export function useApiStatus() {
  return useQuery<ApiStatus>({
    queryKey: ["/api/signage/status"],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSignageLabels() {
  return useQuery<SignageLabels>({
    queryKey: ["/api/signage/labels"],
    staleTime: Infinity,
  });
}
