import { Star, Calendar, Clock } from "lucide-react";
import { useSignageSermon } from "@/hooks/use-signage-data";

export function UpcomingEvent() {
  const { data: event, isLoading, error } = useSignageSermon();

  if (isLoading) {
    return (
      <section className="col-span-5 section-card p-12">
        <h2 className="text-4xl font-semibold text-church-blue mb-6 flex items-center">
          <Star className="text-church-yellow mr-4" size={32} />
          NÄCHSTE VERANSTALTUNG
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto"></div>
          <p className="text-xl text-gray-600 mt-4">Lade Veranstaltung...</p>
        </div>
      </section>
    );
  }

  if (error || !event) {
    return (
      <section className="col-span-5 section-card p-12">
        <h2 className="text-4xl font-semibold text-church-blue mb-6 flex items-center">
          <Star className="text-church-yellow mr-4" size={32} />
          NÄCHSTE VERANSTALTUNG
        </h2>
        <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
          <p className="text-xl text-red-800">
            Keine bevorstehenden Veranstaltungen gefunden.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-5 section-card p-12">
      <h2 className="text-4xl font-semibold text-church-blue mb-6 flex items-center">
        <Star className="text-church-yellow mr-4" size={32} />
        NÄCHSTE VERANSTALTUNG
      </h2>

      <img
        src={event.imageUrl}
        alt={event.title}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-church-blue">
          {event.title}
        </h3>
        <div className="flex items-center space-x-3 text-xl text-gray-600">
          <Calendar className="text-church-yellow" size={20} />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center space-x-3 text-xl text-gray-600">
          <Clock className="text-church-yellow" size={20} />
          <span>{event.time}</span>
        </div>
        {event.description && (
          <p className="text-xl text-gray-700 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </section>
  );
}
