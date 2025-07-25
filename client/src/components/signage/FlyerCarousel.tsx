import {Image} from "lucide-react";
import Slider from "react-slick";
import {useFlyers} from "@/hooks/use-signage-data";

export function FlyerCarousel() {
    const {data: flyers, isLoading: isLoading, error: error} = useFlyers();

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 7000,
        arrows: false,
    };

    if (isLoading) {
        return (
            <section className="col-span-7 section-card p-12">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
                    <Image className="text-church-yellow mr-4" size={32}/>
                    AKTUELLE FLYER
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto"></div>
                    <p className="text-xl-custom text-gray-600 mt-4">Lade Flyer...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="col-span-7 section-card p-12">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-8 flex items-center">
                    <Image className="text-church-yellow mr-4" size={32}/>
                    FLYER DER WOCHE
                </h2>
                <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
                    <p className="text-xl-custom text-red-800">
                        Fehler beim Laden der Flyer.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="col-span-7 section-card p-8">
            <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                <Image className="text-church-yellow mr-4" size={32}/>
                FLYER DER WOCHE
            </h2>
            <div>
                {flyers && flyers.length > 0 ? (
                    <Slider {...settings}>
                        {
                            flyers.map((flyer) => (
                                flyer.imageUrl ? (
                                    <div key={flyer.churchToolsId || flyer.id} className="px-4">
                                        <img
                                            src={flyer.imageUrl}
                                            alt={flyer.title}
                                            className="rounded-xl shadow-md max-h-[500px] w-full object-contain mx-auto"
                                        />
                                    </div>
                                ) : (
                                    <div key={flyer.churchToolsId || flyer.id} className="px-4">
                                        <p className="text-xl-custom text-gray-500">
                                            Kein Bild verfügbar.
                                        </p>
                                    </div>
                                )
                            ))
                        }
                    </Slider>
                ) : (
                    <div className="col-span-2 text-center py-4">
                        <p className="text-xl-custom text-gray-500">
                            Keine Flyer verfügbar.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
