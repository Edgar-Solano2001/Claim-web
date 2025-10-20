'use client';
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from "next/image";

export default function Hero() {

    return (
      <section className="relative bg-purple-950 text-purple-50 py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Bienvenido a <span className="text-blue-400">Claim</span>
            </h1>

            <p className="text-lg text-purple-200">
              Participa en subastas en tiempo real y consigue los mejores
              productos al mejor precio. Empieza a pujar ahora y gana grandes
              oportunidades.
            </p>

            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition">
              Explorar Subastas
            </button>
          </div>

          {/* Carrusel */}

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={true}
              modules={[Autoplay, Pagination, Navigation]}
              className="h-80"
            >
              <SwiperSlide>
                <Image
                  src="/images/arte.jpg"
                  alt="Subasta 1"
                  width={800}
                  height={320}
                  className="w-full h-80 object-cover"
                  priority
                />
              </SwiperSlide>

              <SwiperSlide>
                <Image
                  src="/images/juguetes.jpg"
                  alt="Subasta 2"
                  width={800}
                  height={320}
                  className="w-full h-80 object-cover"
                  priority
                />
              </SwiperSlide>

              <SwiperSlide>
                <Image
                  src="/images/cartas.jpg"
                  alt="Subasta 3"
                  width={800}
                  height={320}
                  className="w-full h-80 object-cover"
                  priority
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </section>
    );  
};
