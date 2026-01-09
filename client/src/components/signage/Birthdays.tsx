import { Cake, User } from "lucide-react";
import { useBirthdays, useSignageLabels } from "@/hooks/use-signage-data";
import { SignageSection } from "./SignageSection";

export function Birthdays() {
  const { data: birthdays, isLoading, error } = useBirthdays();
  const { data: labels } = useSignageLabels();
  const title = labels?.birthdaysTitle || "DIESE WOCHE FEIERN WIR...";
  const headingIcon = <Cake size={32} />;
  const sectionClass = "col-span-7 section-card p-12";

  if (isLoading) {
    return (
      <SignageSection className={sectionClass} title={title} icon={headingIcon}>
        <div className="text-center py-8">
          <span className="loading loading-ring loading-lg text-church-blue"></span>
          <p className="text-xl text-gray-600 mt-4">Lade Geburtstage...</p>
        </div>
      </SignageSection>
    );
  }

  if (error) {
    return (
      <SignageSection className={sectionClass} title={title} icon={headingIcon}>
        <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
          <p className="text-xl text-red-800">
            Fehler beim Laden der Geburtstage.
          </p>
        </div>
      </SignageSection>
    );
  }

  return (
    <SignageSection
      className={sectionClass}
      title={title}
      icon={headingIcon}
      headingClassName="text-4xl font-semibold text-church-blue mb-6 flex items-center"
    >
      <div className="grid grid-cols-2 gap-8 pt-4">
        {birthdays && birthdays.length > 0 ? (
          birthdays.slice(0, 4).map((person) => (
            <div key={person.churchToolsId || person.id} className="flex items-center space-x-4">
              <div className="w-16 h-16 min-w-16 flex-shrink-0 avatar-placeholder rounded-full flex items-center justify-center overflow-hidden">
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="signage-icon signage-icon-24 text-white text-xl" size={24} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {person.name}
                </h3>
                <p className="text-lg text-gray-600">
                  {person.birthdayText}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-xl text-gray-500">
              Diese Woche hat niemand Geburtstag.
            </p>
          </div>
        )}
      </div>
    </SignageSection>
  );
}
