import { useSignageSermon } from "../../hooks/use-signage-data";
import { Calendar, Clock, MapPin, BookOpenText } from "lucide-react";

export default function NextService() {
    const { data: event, isLoading } = useSignageSermon();

    if (isLoading) {
        return (
            <section className="col-span-5 p-0">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Calendar className="text-church-yellow mr-4" size={32} />
                    NÄCHSTER GOTTESDIENST
                </h2>
                <div className="text-center py-8">
                    <span className="loading loading-ring loading-lg text-church-blue"></span>
                    <p className="text-xl-custom text-gray-600 mt-4">Lade Gottesdienst...</p>
                </div>
            </section>
        );
    }

    if (!event) {
        return (
            <section className="col-span-5 p-0">
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
                    className="w-full h-64 object-cover rounded-lg mb-4" 
                />
            )}
            
            <div className="space-y-4">
                <div className="flex items-center space-x-3 text-xl-custom text-gray-600">
                    <Clock className="text-church-yellow" size={20} />
                    <span>{event.date} • {event.time}</span>
                </div>
                {event.location && (
                    <div className="flex items-center space-x-3 text-xl-custom text-gray-600">
                        <MapPin className="text-church-yellow" size={20} />
                        <span>{event.location}</span>
                    </div>
                )}
                {event.predigtLine && (
                    <div className="flex items-center space-x-3 text-xl-custom text-gray-700 leading-relaxed">
                        <BookOpenText className="text-church-yellow" size={20} />
                        <span>{event.predigtLine}</span>
                    </div>
                )}
                {event.specials && event.specials.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xl-custom font-semibold text-gray-800">Specials</h4>
                        <ul className="list-disc list-inside text-lg text-gray-700">
                            {event.specials.map((line, idx) => (
                                <li key={idx}>{line}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {!event.predigtLine && !event.specials?.length && event.description && (
                    <p className="text-xl-custom text-gray-700 leading-relaxed">
                        {event.description}
                    </p>
                )}

                {event.services && (
                    <div className="space-y-3 pt-2">
                        {event.services.program?.length > 0 && (
                            <div className="pt-1 space-y-3">
                                <h4 className="text-xl-custom font-semibold text-gray-800">Gottesdienst</h4>
                                {(() => {
                                    const roleLabels: Record<number, string> = {
                                        24: 'Predigt',
                                        27: 'Moderation',
                                        131: 'Ministry/Gebet',
                                    };
                                    const featured = event.services.program.filter((svc) => roleLabels[svc.id]);
                                    const others = event.services.program.filter((svc) => !roleLabels[svc.id]);
                                    return (
                                        <>
                                            {featured.length > 0 && (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {featured.map((svc) => (
                                                        <div
                                                            key={svc.id}
                                                            className="flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 bg-gradient-to-r from-white via-white to-gray-50 shadow-sm"
                                                        >
                                                            <span className="text-sm font-semibold text-gray-800">{roleLabels[svc.id]}</span>
                                                            <span className="text-sm text-gray-700">{svc.person || 'N.N.'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {others.length > 0 && (
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                    {others.map((svc) => (
                                                        <span
                                                            key={svc.id}
                                                            className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200"
                                                        >
                                                            {svc.person || svc.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {event.services.kids?.length > 0 && (
                            <div className="pt-1">
                                <h4 className="text-xl-custom font-semibold text-gray-800">Kinderprogramm</h4>
                                <div className="space-y-2 text-sm text-gray-700 mt-2">
                                    {event.services.kids.map((svc) => (
                                        <div key={svc.id} className="rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-3">
                                            <div className="font-semibold text-gray-800">{svc.name}</div>
                                            {svc.description && <div className="text-gray-600">{svc.description}</div>}
                                            {svc.statusLabel && <div className="text-gray-700">{svc.statusLabel}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {event.services.gastro && (
                            <div className="pt-1">
                                <h4 className="text-xl-custom font-semibold text-gray-800">Gastro</h4>
                                {event.services.gastro.length > 0 ? (
                                    <div
                                        className={`text-sm text-gray-700 w-full ${
                                            event.services.gastro.length > 1 ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap gap-3'
                                        }`}
                                    >
                                        {event.services.gastro.map((svc) => (
                                            <div
                                                key={svc.id}
                                                className={`px-3 py-2 rounded-lg border flex items-center justify-between gap-2 w-full ${
                                                    svc.tone === 'green'
                                                        ? 'bg-green-50 border-green-200 text-green-800'
                                                        : svc.tone === 'yellow'
                                                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                                        : svc.tone === 'red'
                                                        ? 'bg-red-50 border-red-200 text-red-800'
                                                        : 'bg-gray-100 border-gray-200 text-gray-500'
                                                }`}
                                            >
                                                <span className="font-semibold">{svc.name}</span>
                                                <span className="text-sm">{svc.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-600">Gastro nicht besetzt</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
