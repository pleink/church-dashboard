import { useState, useEffect } from "react";
import logoPath from "@assets/fkw_logo.svg";
import { useApiStatus } from "@/hooks/use-signage-data";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: status } = useApiStatus();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const dateString = currentTime.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm px-16 py-12 flex justify-between items-center relative">
      {status && (
        <div className="fixed top-0 left-0 p-1 pointer-events-none z-50">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${status.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'
              }`}
          ></span>
        </div>
      )}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-6">
          <img
            src={logoPath}
            alt="Freie Kirche Wipkingen Logo"
            className="h-24 w-auto object-contain"
          />
        </div>
      </div>

      <div className="text-right">
        <div className="text-6xl font-bold text-church-blue time-display font-mono">
          {timeString}
        </div>
        <div className="text-2xl-custom text-gray-600 mt-2">
          {dateString}
        </div>
      </div>
    </header>
  );
}
