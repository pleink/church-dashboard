import { useSignageSermon, useSignageLabels } from "../../hooks/use-signage-data";
import { BookOpenText } from "lucide-react";
import { SignageList } from "./SignageList";
import { SignageSection } from "./SignageSection";
import config from "../../../../config.json";

export default function NextServiceWeekday() {
    const { data: event, isLoading } = useSignageSermon();
    const { data: labels } = useSignageLabels();
    const title = labels?.sermonTitleWeekday || labels?.sermonTitleSunday || "WIR FEIERN GOTTESDIENST";
    const kidsLabel = labels?.sermonKids || "FÜR UNSERE KIDS & TEENS";
    const gastroLabel = labels?.sermonGastro || "KAFFEE & BEGEGNUNG";
    const containerClass = "col-span-5 section-card p-12";

    const pastorName = event?.services?.program?.find((svc) => svc.id === 24)?.person || "";
    const rawPredigt = event?.predigtLine || "";
    const cleanPredigt = rawPredigt.replace(/^\s*predigt[:\s-]*/i, "").trim();
    const kidsServices = event?.services?.kids || [];
    const groupedKids = kidsServices.filter((svc) => svc.id !== 136);
    const teensService = kidsServices.find((svc) => svc.id === 136);
    const kidsStart = groupedKids.find((svc) => svc.statusLabel)?.statusLabel || "";

    const headingIcon = <BookOpenText size={32} />;

    if (isLoading) {
        return (
            <SignageSection
                className={containerClass}
                title={title}
                icon={headingIcon}
                headingClassName="text-4xl font-semibold text-church-blue mb-6 flex items-start"
            >
                <div className="text-center py-8">
                    <span className="loading loading-ring loading-lg text-church-blue"></span>
                    <p className="text-xl text-gray-600 mt-4">Lade Gottesdienst...</p>
                </div>
            </SignageSection>
        );
    }

    if (!event) {
        return (
            <SignageSection
                className={containerClass}
                title={title}
                icon={headingIcon}
                headingClassName="text-4xl font-semibold text-church-blue mb-6 flex items-start"
            >
                <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
                    <p className="text-xl text-red-800">
                        Keine bevorstehenden Gottesdienste gefunden.
                    </p>
                </div>
            </SignageSection>
        );
    }

    return (
        <SignageSection
            className={containerClass}
            title={title}
            icon={headingIcon}
            headingClassName="text-4xl font-semibold text-church-blue mb-6 flex items-start"
        >
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
                        <div className="flex items-center space-x-3 text-2xl font-medium text-gray-800">
                            <span>{displayDate} • {event.time}</span>
                        </div>
                    );
                })()}
                {(() => {
                    const sermonText = pastorName && cleanPredigt
                        ? `Predigt von ${pastorName} über: ${cleanPredigt}`
                        : pastorName
                            ? `Predigt von ${pastorName}`
                            : cleanPredigt
                                ? `Predigt: ${cleanPredigt}`
                                : "";
                    return sermonText ? (
                        <div className="flex items-start space-x-3 text-xl text-gray-700 leading-relaxed">
                            <span>{sermonText}</span>
                        </div>
                    ) : null;
                })()}
                {event.specials && event.specials.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-gray-800">Specials</h4>
                        <ul className="list-disc list-inside text-lg text-gray-700">
                            {event.specials.map((line, idx) => (
                                <li key={idx}>{line}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {!event.predigtLine && !event.specials?.length && event.description && (
                    <p className="text-xl text-gray-700 leading-relaxed">
                        {event.description}
                    </p>
                )}
            </div>

            <div className="signage-divider signage-divider-lg"></div>

            {event.services && (
                <div className="space-y-6 pt-2">
                    {kidsServices && kidsServices.length > 0 && (
                        <SignageList
                            title={kidsLabel}
                            items={[
                                ...(groupedKids.length > 0
                                    ? [{
                                        key: 'kids-grouped',
                                        color: '#facc15',
                                        title: 'Kinderhüeti & Kidsträff',
                                        subtitle: kidsStart,
                                    }]
                                    : []),
                                ...(teensService
                                    ? [{
                                        key: teensService.id || 'teens',
                                        color: '#facc15',
                                        title: teensService.name,
                                        subtitle: teensService.statusLabel,
                                    }]
                                    : []),
                            ]}
                            showEndDivider={Boolean(event.services.gastro && event.services.gastro.length > 0)}
                        />
                    )}

                        {event.services.gastro && (
                            <SignageList
                                title={gastroLabel}
                                items={event.services.gastro
                                    .slice()
                                    .sort((a, b) => {
                                        if (a.id === 140 && b.id !== 140) return -1;
                                        if (b.id === 140 && a.id !== 140) return 1;
                                        return a.id - b.id;
                                    })
                                    .map((svc) => {
                                        const hasTeam = svc.status !== 'unavailable';
                                        const hours = svc.id === 140
                                            ? config.services.gastro.hours?.kaffeebar
                                            : svc.id === 127
                                                ? config.services.gastro.hours?.bistro
                                                : '';
                                        const strings = config.services.gastro.strings || {};
                                        return {
                                            key: svc.id,
                                            color: hasTeam ? '#facc15' : '#d1d5db',
                                            title: svc.name,
                                            subtitle: hasTeam ? (hours || strings.available || 'Verfügbar') : (strings.unavailable || 'Nicht besetzt'),
                                        };
                                    })}
                            />
                        )}
                </div>
            )}
        </SignageSection>
    );
}
