import { useSignageSermon, useSignageLabels } from "../../hooks/use-signage-data";
import { Calendar, Clock, MapPin, BookOpenText, User } from "lucide-react";

export default function NextServiceSunday() {
    const { data: event, isLoading } = useSignageSermon();
    const { data: labels } = useSignageLabels();
    const title = labels?.sermonTitleSunday || labels?.sermonTitleWeekday || "WIR FEIERN GOTTESDIENST";
    const programLabel = labels?.sermonProgram || "MIT DABEI";
    const kidsLabel = labels?.sermonKids || "FÜR UNSERE KIDS & TEENS";
    const gastroLabel = labels?.sermonGastro || "KAFFEE & BEGEGNUNG";
    const containerClass = "col-span-7 section-card p-8";

    if (isLoading) {
        return (
            <section className={containerClass}>
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Calendar className="text-church-yellow mr-4" size={32} />
                    {title}
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
            <section className={containerClass}>
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Calendar className="text-church-yellow mr-4" size={32} />
                    {title}
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
        <section className={containerClass}>
            <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                <Calendar className="text-church-yellow mr-4" size={32} />
                {title}
            </h2>

            {event.imageUrl && (
                <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                />
            )}

            <div className="space-y-4">
                {(() => {
                    const formatDate = (value?: string) => {
                        if (!value) return "";
                        return value.replace(/\s*\b\d{4}\b\.?/g, "").trim();
                    };
                    const displayDate = formatDate(event.date);
                    return (
                        <div className="flex items-center space-x-3 text-2xl-custom font-medium text-gray-800">
                            <span>{displayDate} • {event.time}</span>
                        </div>
                    );
                })()}
                {event.location && (
                    <div className="flex items-center space-x-3 text-xl-custom text-gray-600">
                        <MapPin className="text-church-yellow" size={24} />
                        <span className="leading-snug">{event.location}</span>
                    </div>
                )}
                {event.predigtLine && (
                    <div className="flex items-start space-x-3 text-xl-custom text-gray-700 leading-relaxed">
                        <BookOpenText className="text-church-yellow" size={24} />
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
                                <h4 className="text-xl-custom font-semibold text-gray-800">{programLabel}</h4>
                                {(() => {
                                    const roleLabels: Record<number, string> = {
                                        24: 'Predigt',
                                        27: 'Moderation',
                                        131: 'Gebet',
                                    };
                                    const featured = event.services.program.filter((svc) => roleLabels[svc.id]);
                                    const others = event.services.program.filter((svc) => !roleLabels[svc.id]);
                                    return (
                                        <>
                                            {featured.length > 0 && (
                                                <div className={`grid ${featured.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                                    {featured.map((svc) => {
                                                        const avatar = svc.avatar;
                                                        return (
                                                            <div
                                                                key={svc.id}
                                                                className="flex items-center gap-4 px-2 py-2"
                                                            >
                                                                <div className="w-16 h-16 min-w-16 rounded-full overflow-hidden bg-church-blue text-white flex items-center justify-center text-sm font-semibold">
                                                                    {avatar ? (
                                                                        <img
                                                                            src={avatar}
                                                                            alt={svc.person || roleLabels[svc.id]}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <User size={24} />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-sm uppercase tracking-wide text-gray-600 font-semibold">{roleLabels[svc.id]}</div>
                                                                    <div className="text-xl-custom font-semibold text-gray-800 leading-tight">{svc.person || 'N.N.'}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
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
                                <h4 className="text-xl-custom font-semibold text-gray-800">{kidsLabel}</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mt-3">
                                    {event.services.kids.map((svc) => (
                                        <div key={svc.id} className="rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-3 h-full space-y-2">
                                            <div className="font-semibold text-gray-800 text-lg leading-snug">
                                                {svc.name}
                                            </div>
                                            {svc.description && (
                                                <div className="text-sm text-gray-700">
                                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-medium inline-block">
                                                        {svc.description}
                                                    </span>
                                                </div>
                                            )}
                                            {svc.statusLabel && (
                                                <div className="text-lg text-gray-800 leading-snug">{svc.statusLabel}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {event.services.gastro && (
                            <div className="pt-1">
                                <h4 className="text-xl-custom font-semibold text-gray-800">{gastroLabel}</h4>
                                {event.services.gastro.length > 0 ? (
                                    <div
                                        className={`text-sm text-gray-700 w-full ${event.services.gastro.length > 1 ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap gap-3'
                                            }`}
                                    >
                                        {event.services.gastro.map((svc) => (
                                            <div
                                                key={svc.id}
                                                className={`px-3 py-2 rounded-lg border flex items-center justify-between gap-2 w-full ${svc.tone === 'green'
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
