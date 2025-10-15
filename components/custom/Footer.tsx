import { Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
      <footer className="w-max mx-auto py-16 px-6 lg:px-16 space-y-6 border-t-2">
        <div className="flex flex-col lg:flex-row w-full justify-between items-stretch">
          {/* Redes sociales */}
          <div className="flex flex-col items-center lg:items-start mb-8 lg:mb-0 lg:w-1/3 w-full lg:border-r-2 lg:pr-8">
            <p className="mb-2">Redes sociales</p>
            <p className="mb-4">Logotipo</p>
            <div className="flex gap-4">
              <Link href="" className="">
          <Facebook />
              </Link>
              <Link href="" className="">
          <Instagram />
              </Link>
              <Link href="" className="">
          <Youtube />
              </Link>
            </div>
          </div>

          {/* Otro contenido */}
          <div className="flex flex-col lg:flex-row justify-between lg:w-2/3 w-full lg:pl-8">
            <div className="mx-6 mb-6 lg:mb-0">
              <p className="text-lg font-semibold mb-2">Conócenos</p>
              <p className="text-lg">Acerca de nosotros</p>
              <p className="text-lg">Términos y condiciones</p>
              <p className="text-lg">Dudas</p>
            </div>
            <div className="mx-6">
              <p className="text-lg font-semibold mb-2">Métodos de pago</p>
              <p className="text-lg">Tarjetas de débito y crédito</p>
              <p className="text-lg">Pagos en efectivo</p>
            </div>
          </div>

          
        </div>
      </footer>
    );
};
