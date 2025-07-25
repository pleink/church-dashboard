import { Book } from "lucide-react";
import { useVerseOfWeek } from "@/hooks/use-signage-data";

export function VerseOfWeek() {
  const { data: verse, isLoading, error } = useVerseOfWeek();

  if (isLoading) {
    return (
      <section className="col-span-5 verse-block text-white p-12 rounded-2xl">
        <h2 className="text-3xl-custom font-semibold mb-8 flex items-center">
          <Book className="text-church-yellow mr-4" size={32} />
          TAGESVERS
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-xl-custom mt-4">Lade Bibelvers...</p>
        </div>
      </section>
    );
  }

  if (error || !verse) {
    return (
      <section className="col-span-5 verse-block text-white p-12 rounded-2xl">
        <h2 className="text-3xl-custom font-semibold mb-8 flex items-center">
          <Book className="text-church-yellow mr-4" size={32} />
          TAGESVERS
        </h2>
        <div className="space-y-6">
          <blockquote className="text-2xl-custom leading-relaxed font-medium">
            „Jesus redete zu ihnen und sprach: Ich bin das Licht der Welt. Wer mir nachfolgt, wird nicht in der Finsternis wandeln, sondern das Licht des Lebens haben."
          </blockquote>
          <cite className="text-xl-custom text-church-yellow font-semibold block">
            — Johannes 8:12
          </cite>
        </div>
        <div className="mt-8 flex justify-end">
          <Book className="text-6xl text-church-yellow opacity-20" size={96} />
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-5 verse-block text-white p-8 rounded-2xl">
      <h2 className="text-3xl-custom font-semibold mb-6 flex items-center">
        <Book className="text-church-yellow mr-4" size={32} />
        TAGESVERS
      </h2>
      
      <div className="space-y-4">
        <blockquote className="text-xl-custom leading-relaxed font-medium">
          {verse.text}
        </blockquote>
        <cite className="text-lg text-church-yellow font-semibold block">
          {verse.reference}
        </cite>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Book className="text-4xl text-church-yellow opacity-20" size={64} />
      </div>
    </section>
  );
}
