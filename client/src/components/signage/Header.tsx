import { useState, useEffect } from "react";
import { Church, Clock } from "lucide-react";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

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
    <header className="bg-white shadow-sm px-16 py-12 flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-church-blue rounded-full flex items-center justify-center">
            <Church className="text-white text-3xl" size={48} />
          </div>
          <div>
            <h1 className="text-4xl-custom font-bold text-church-blue">Freie Kirche</h1>
            <p className="text-2xl-custom text-gray-600 -mt-2">Wipkingen</p>
          </div>
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
