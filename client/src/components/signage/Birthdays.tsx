import { Cake, User } from "lucide-react";
import { useBirthdays } from "@/hooks/use-signage-data";

export function Birthdays() {
  const { data: birthdays, isLoading, error } = useBirthdays();

  if (isLoading) {
    return (
      <section className="col-span-7 section-card p-12">
        <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
          <Cake className="text-church-yellow mr-4" size={32} />
          DIESE WOCHE FEIERN WIR...
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto"></div>
          <p className="text-xl-custom text-gray-600 mt-4">Lade Geburtstage...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="col-span-7 section-card p-12">
        <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
          <Cake className="text-church-yellow mr-4" size={32} />
          DIESE WOCHE FEIERN WIR...
        </h2>
        <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
          <p className="text-xl-custom text-red-800">
            Fehler beim Laden der Geburtstage.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-7 section-card p-12">
      <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
        <Cake className="text-church-yellow mr-4" size={32} />
        DIESE WOCHE FEIERN WIR...
      </h2>
      
      <div className="grid grid-cols-2 gap-8">
        {birthdays && birthdays.length > 0 ? (
          birthdays.slice(0, 4).map((person) => (
            <div key={person.id} className="flex items-center space-x-6">
              <div className="w-24 h-24 avatar-placeholder rounded-full flex items-center justify-center">
                {person.avatar ? (
                  <img 
                    src={person.avatar} 
                    alt={person.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="text-white text-2xl" size={32} />
                )}
              </div>
              <div>
                <h3 className="text-2xl-custom font-semibold text-gray-800">
                  {person.name}
                </h3>
                <p className="text-xl-custom text-gray-600">
                  {person.birthdayText}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <p className="text-2xl-custom text-gray-500">
              Diese Woche hat niemand Geburtstag.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
