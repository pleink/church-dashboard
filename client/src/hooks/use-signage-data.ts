import { useQuery } from "@tanstack/react-query";

interface SignageEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  imageUrl?: string;
  location?: string;
}

interface RoomBooking {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  resource: string;
}

interface Birthday {
  id: number;
  name: string;
  birthdayText: string;
  avatar?: string;
}

interface VerseOfWeek {
  id: number;
  text: string;
  reference: string;
}

interface ApiStatus {
  connected: boolean;
  lastUpdate: string;
  error?: string;
  service: string;
}

export function useSignageEvent() {
  return useQuery<SignageEvent>({
    queryKey: ["/api/signage/events"],
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRoomBookings() {
  return useQuery<RoomBooking[]>({
    queryKey: ["/api/signage/bookings"],
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

export function useApiStatus() {
  return useQuery<ApiStatus>({
    queryKey: ["/api/signage/status"],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
