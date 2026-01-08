import { Book } from "lucide-react";
import { useVerseOfWeek as useTagesvers, useSignageLabels } from "@/hooks/use-signage-data";

export function Tagesvers() {
  const { data: verse, isLoading, error } = useTagesvers();
  const { data: labels } = useSignageLabels();
  const title = labels?.verseTitle || "TAGESVERS";

  if (isLoading) {
    return (
      <section className="col-span-5 verse-block text-white p-12 rounded-2xl">
        <h2 className="text-4xl font-semibold mb-8 flex items-center">
          <Book className="signage-icon text-church-yellow mr-4" size={32} />
          {title}
        </h2>
        <div className="text-center py-8">
          <span className="loading loading-ring loading-lg text-white"></span>
          <p className="text-xl mt-4">Lade Bibelvers...</p>
        </div>
      </section>
    );
  }

  if (error || !verse) {
    return (
      <section className="col-span-5 verse-block text-white p-12 rounded-2xl">
        <h2 className="text-4xl font-semibold mb-8 flex items-center">
          <Book className="signage-icon text-church-yellow mr-4" size={32} />
          {title}
        </h2>
        <div className="space-y-6">
          <blockquote className="text-2xl leading-relaxed font-medium">
            „Jesus redete zu ihnen und sprach: Ich bin das Licht der Welt. Wer mir nachfolgt, wird nicht in der Finsternis wandeln, sondern das Licht des Lebens haben."
          </blockquote>
          <cite className="text-xl text-church-yellow font-semibold block">
            — Johannes 8:12
          </cite>
        </div>
        <div className="mt-8 flex justify-end">
          <Book className="signage-icon signage-icon-96 text-6xl text-church-yellow opacity-20" size={96} />
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-5 verse-block text-white p-12 rounded-2xl">
      <h2 className="text-4xl font-semibold mb-6 flex items-center">
        <Book className="signage-icon text-church-yellow mr-4" size={32} />
        {title}
      </h2>

      <div className="space-y-4">
        <blockquote className="text-xl leading-relaxed font-medium">
          {verse.text}
        </blockquote>
        <cite className="text-lg text-church-yellow font-semibold block">
          {verse.reference}
        </cite>
      </div>

      <div className="mt-6 flex justify-end">
        <Book className="signage-icon signage-icon-64 text-4xl text-church-yellow opacity-20" size={64} />
      </div>
    </section>
  );
}
