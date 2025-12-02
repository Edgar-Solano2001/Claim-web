import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 border-t-2 border-purple-700 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
        {/* Contenedor principal: en móvil columna, en lg 3 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Branding + Redes sociales */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/Claim_Logo.svg"
                alt="Claim - Subastas"
                width={56}
                height={56}
                className="w-14 h-14"
                priority
              />
              <div>
                <p className="text-xl font-semibold text-white">Claim</p>
                <p className="text-sm text-gray-300">Plataforma de subastas</p>
              </div>
            </div>

            <p className="text-sm text-purple-300">Síguenos</p>
            <div className="flex gap-4">
              <Link
                href="#"
                aria-label="Visita nuestra página en Facebook"
                className="text-purple-300 hover:text-purple-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook aria-hidden="true" />
                <span className="sr-only">Facebook</span>
              </Link>

              <Link
                href="#"
                aria-label="Visita nuestra página en Instagram"
                className="text-purple-300 hover:text-purple-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram aria-hidden="true" />
                <span className="sr-only">Instagram</span>
              </Link>

              <Link
                href="#"
                aria-label="Visita nuestro canal de Youtube"
                className="text-purple-300 hover:text-purple-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube aria-hidden="true" />
                <span className="sr-only">Youtube</span>
              </Link>
            </div>

            <p className="text-sm text-gray-400 mt-4">
              ¿Tienes preguntas? Escríbenos a{" "}
              <Link href="mailto:soporte@subastas.example" className="text-gray-300 hover:text-gray-200">
                soporte@claim.example
              </Link>
            </p>
          </div>

          {/* Navegación */}
          <nav aria-label="Enlaces del sitio" className="flex flex-col sm:flex-row justify-between gap-8">
            <div>
              <p className="text-lg font-semibold text-white mb-2">Conócenos</p>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/about" className="hover:text-white">Acerca de nosotros</Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">Términos y condiciones</Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white">Centro de ayuda</Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-lg font-semibold text-white mb-2">Métodos de pago</p>
              <ul className="space-y-2 text-gray-300">
                <li>Tarjetas de débito y crédito</li>
                <li>Pagos en efectivo (puntos autorizados)</li>
                <li>Transferencias bancarias</li>
              </ul>
            </div>
          </nav>

          {/* Contacto / Dirección / Horarios */}
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-white mb-2">Contacto</p>
            <address className="not-italic text-gray-300">
              <p>Teléfono: <a href="tel:+34123456789" className="text-purple-300 hover:text-purple-200">+34 123 456 789</a></p>
              <p>Horario: Lun - Vie 9:00 - 18:00</p>
            </address>

            <div className="mt-4 text-sm text-gray-400">
              <p>
                Seguridad y privacidad: Tus datos están protegidos. Revisa nuestra{" "}
                <Link href="/privacy" className="text-purple-300 hover:text-purple-200">Política de privacidad</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Pie inferior */}
        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© {year} Subastas. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/cookies" className="text-gray-300 hover:text-white">Política de cookies</Link>
            <Link href="/sitemap" className="text-gray-300 hover:text-white">Mapa del sitio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
