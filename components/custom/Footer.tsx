import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
  <footer className="w-full py-16 px-6 lg:px-16 space-y-6 border-t-2 bg-black border-purple-700">
        <div className="flex flex-col lg:flex-row w-full justify-between items-stretch">
          {/* Redes sociales */}
            <div className="flex flex-col items-center mb-8 lg:mb-0 lg:w-1/3 w-full lg:border-r-2 lg:pr-8 lg:border-purple-700">
            <Image
              src="/Claim_Logo.svg"
              alt="Subasta 1"
              width={500}
              height={500}
              objectPosition="center"
              className="w-16 h-16"
              priority
            />
              <p className="mb-2 text-purple-400">Redes sociales</p>
            <div className="flex gap-4">
              <Link href="" className="text-purple-400 hover:text-purple-200 transition-colors">
              <Facebook />
              </Link>
              <Link href="" className="text-purple-400 hover:text-purple-200 transition-colors">
              <Instagram />
              </Link>
              <Link href="" className="text-purple-400 hover:text-purple-200 transition-colors">
              <Youtube />
              </Link>
            </div>
            </div>

          {/* Otro contenido */}
          <div className="flex flex-col lg:flex-row justify-between lg:w-2/3 w-full lg:pl-8">
            <div className="mx-6 mb-6 lg:mb-0">
              <p className="text-lg font-semibold mb-2 text-purple-400">Conócenos</p>
              <p className="text-lg text-purple-400">Acerca de nosotros</p>
              <p className="text-lg text-purple-400">Términos y condiciones</p>
              <p className="text-lg text-purple-400">Dudas</p>
            </div>
            <div className="mx-6">
              <p className="text-lg font-semibold mb-2 text-purple-400">Métodos de pago</p>
              <p className="text-lg text-purple-400">Tarjetas de débito y crédito</p>
              <p className="text-lg text-purple-400">Pagos en efectivo</p>
            </div>
          </div>

          
        </div>
      </footer>
    );
};
