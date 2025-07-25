import { useSignageEvent } from "../../hooks/use-signage-data";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function NextService() {
    const { data: event, isLoading } = useSignageEvent();

    if (isLoading) {
        return (
            <section className="col-span-5 section-card p-8">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Calendar className="text-church-yellow mr-4" size={32} />
                    NÄCHSTER GOTTESDIENST
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto"></div>
                    <p className="text-xl-custom text-gray-600 mt-4">Lade Gottesdienst...</p>
                </div>
            </section>
        );
    }

    if (!event) {
        return (
            <section className="col-span-5 section-card p-8">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Calendar className="text-church-yellow mr-4" size={32} />
                    NÄCHSTER GOTTESDIENST
                </h2>
                <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
                    <p className="text-xl-custom text-red-800">
                        Keine bevorstehenden Gottesdienste gefunden.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="col-span-5 section-card p-8">
            <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                <Calendar className="text-church-yellow mr-4" size={32} />
                NÄCHSTER GOTTESDIENST
            </h2>
            
            {event.imageUrl && (
                <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg mb-6" 
                />
            )}
            
            <div className="space-y-4">
                <h3 className="text-2xl-custom font-bold text-church-blue">
                    {event.title}
                </h3>
                <div className="flex items-center space-x-3 text-xl-custom text-gray-600">
                    <Calendar className="text-church-yellow" size={20} />
                    <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-3 text-xl-custom text-gray-600">
                    <Clock className="text-church-yellow" size={20} />
                    <span>{event.time}</span>
                </div>
                {event.description && (
                    <p className="text-xl-custom text-gray-700 leading-relaxed">
                        {event.description}
                    </p>
                )}
            </div>
        </section>
    );
}