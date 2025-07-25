import { Image } from "lucide-react";
import Slider from "react-slick";
import { useFlyers } from "@/hooks/use-signage-data";
import { useState } from "react";

export function FlyerCarousel() {
    const { data: flyers, isLoading, error } = useFlyers();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Filter out expired events and ensure fresh content
    const activeFlyers = flyers?.filter((flyer) => {
        if (!flyer.startDate) return true;
        const eventDate = new Date(flyer.startDate);
        const now = new Date();
        return eventDate >= now; // Only show future events
    }) || [];

    const settings = {
        dots: false,
        infinite: activeFlyers.length > 1,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: activeFlyers.length > 1,
        autoplaySpeed: 7000, // 7 seconds as specified
        arrows: false,
        fade: false, // Disable fade to fix positioning issues
        cssEase: 'ease-in-out',
        swipe: false,
        beforeChange: (oldIndex: number, newIndex: number) => setCurrentSlide(newIndex),
    };

    if (isLoading) {
        return (
            <section className="col-span-12 section-card p-6 w-full">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Image className="text-church-yellow mr-4" size={32} />
                    FLYER DER WOCHE
                </h2>
                <div className="text-center py-8">
                    <span className="loading loading-ring loading-lg text-church-blue"></span>
                    <p className="text-xl-custom text-gray-600 mt-4">Lade Flyer...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="col-span-12 section-card p-6 w-full">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Image className="text-church-yellow mr-4" size={32} />
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

    if (!activeFlyers || activeFlyers.length === 0) {
        return (
            <section className="col-span-12 section-card p-6 w-full">
                <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                    <Image className="text-church-yellow mr-4" size={32} />
                    FLYER DER WOCHE
                </h2>
                <div className="text-center py-12">
                    <Image className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <p className="text-xl-custom text-gray-500">
                        Derzeit keine Flyer verfügbar.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="col-span-12 section-card p-8 w-full">
            <h2 className="text-3xl-custom font-semibold text-church-blue mb-6 flex items-center">
                <Image className="text-church-yellow mr-4" size={32} />
                FLYER DER WOCHE
            </h2>
            
            <div className="relative w-full mx-[-2px]">
                <Slider {...settings}>
                    {activeFlyers.map((flyer) => (
                        <div key={flyer.churchToolsId || flyer.id} className="w-full px-2">
                            <div className="relative bg-white rounded-xl overflow-hidden" style={{ height: '500px' }}>
                                <img
                                    src={flyer.imageUrl}
                                    alt={flyer.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('Failed to load image:', flyer.imageUrl);
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZseWVyIEJpbGQgbmljaHQgdmVyZsO8Z2JhcjwvdGV4dD4KICA8L3N2Zz4K';
                                    }}
                                    onLoad={() => {
                                        console.log('Successfully loaded image:', flyer.imageUrl);
                                    }}
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                    <h3 className="text-xl-custom font-semibold text-white">
                                        {flyer.title}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
                
                {/* Progress indicator for multiple flyers */}
                {activeFlyers.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                        {activeFlyers.map((_, index) => (
                            <div
                                key={index}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                    index === currentSlide ? 'bg-church-yellow' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}