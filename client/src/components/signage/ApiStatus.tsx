import { CheckCircle, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { useApiStatus } from "@/hooks/use-signage-data";

export function ApiStatus() {
  const { data: status, isLoading } = useApiStatus();

  if (isLoading) {
    return (
      <section className="col-span-12 mt-4">
        <div className="text-center">
          <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-lg">
            <Wifi className="inline text-gray-600 mr-2" size={20} />
            <span className="text-xl-custom text-gray-800">
              Prüfe ChurchTools Verbindung...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (!status) {
    return (
      <section className="col-span-12 mt-4">
        <div className="text-center">
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
            <WifiOff className="inline text-red-600 mr-2" size={20} />
            <span className="text-xl-custom text-red-800">
              ChurchTools Status unbekannt
            </span>
          </div>
        </div>
      </section>
    );
  }

  const lastUpdateTime = new Date(status.lastUpdate).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <section className="col-span-12 mt-4">
      <div className="text-center">
        {status.connected ? (
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg">
            <CheckCircle className="inline text-green-600 mr-2" size={20} />
            <span className="text-xl-custom text-green-800">
              ChurchTools verbunden - Letzte Aktualisierung: {lastUpdateTime}
            </span>
          </div>
        ) : (
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
            <AlertTriangle className="inline text-red-600 mr-2" size={20} />
            <span className="text-xl-custom text-red-800">
              ChurchTools nicht erreichbar - Zeige gespeicherte Daten
              {status.error && (
                <span className="block text-sm mt-1">
                  Fehler: {status.error}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
